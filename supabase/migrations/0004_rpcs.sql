-- 0004_rpcs.sql
-- Atomic state-machine functions. Each runs in ONE transaction. Called ONLY by the
-- server-side service-role client (execute is revoked from anon/authenticated at the
-- end). The service-role bypasses RLS by design, so these are SECURITY INVOKER
-- (default) — avoiding the SECURITY DEFINER search_path footgun. search_path is pinned
-- regardless. Raw tokens are generated app-side (base64url) and passed in pre-hashed;
-- token EXPIRY uses the DB clock so generation and comparison never skew.

set check_function_bodies = off;

-- Internal: upsert-or-resolve the subscriber by email, idempotently, and decide
-- whether a confirmation email is needed. Returns blocked=true for suppressed/erased
-- (callers must no-op). Never silently resurrects suppressed addresses; an
-- unsubscribed address may re-subscribe via a fresh double opt-in (the confirm click
-- proves intent).
create or replace function _ensure_subscriber(
  p_email text,
  p_email_hash text,
  p_source text,
  p_confirm_token_hash text,
  p_unsub_token_hash text,
  p_name text default ''
) returns table(sub_id uuid, confirm_needed boolean, confirmed boolean, blocked boolean)
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_status subscriber_status;
  v_was_inserted boolean;
  v_last_sent timestamptz;
  v_cooldown interval := interval '2 minutes';
begin
  if exists (select 1 from suppression where email_hash = p_email_hash) then
    return query select null::uuid, false, false, true; return;
  end if;

  insert into subscribers (email, email_hash, name, status, confirm_token_hash,
                           unsubscribe_token_hash, token_expires_at,
                           last_confirm_sent_at, source)
  values (p_email, p_email_hash, nullif(p_name, ''), 'pending', p_confirm_token_hash,
          p_unsub_token_hash, now() + interval '24 hours', now(), p_source)
  on conflict (email) do update                          -- state-preserving (+ fill name)
    set updated_at = now(),
        name = coalesce(excluded.name, subscribers.name)
  returning id, status, (xmax = 0) into v_id, v_status, v_was_inserted;

  if v_was_inserted then
    return query select v_id, true, false, false; return;
  end if;

  if v_status in ('suppressed', 'erased') then
    return query select null::uuid, false, false, true; return;
  end if;

  if v_status = 'confirmed' then
    return query select v_id, false, true, false; return;
  end if;

  if v_status = 'unsubscribed' then
    -- re-subscribe via fresh double opt-in
    update subscribers
      set status = 'pending',
          confirm_token_hash = p_confirm_token_hash,
          unsubscribe_token_hash = coalesce(unsubscribe_token_hash, p_unsub_token_hash),
          token_expires_at = now() + interval '24 hours',
          last_confirm_sent_at = now()
      where id = v_id;
    return query select v_id, true, false, false; return;
  end if;

  -- status = 'pending': resend (rotating the token) only if cooldown elapsed
  select last_confirm_sent_at into v_last_sent from subscribers where id = v_id;
  if v_last_sent is null or v_last_sent < now() - v_cooldown then
    update subscribers
      set confirm_token_hash = p_confirm_token_hash,
          token_expires_at = now() + interval '24 hours',
          last_confirm_sent_at = now()
      where id = v_id and status = 'pending';
    return query select v_id, true, false, false; return;
  end if;

  return query select v_id, false, false, false;
end $$;

-- ---- subscribe / followApp -------------------------------------------------
create or replace function rpc_subscribe(
  p_email text, p_email_hash text, p_source text,
  p_confirm_token_hash text, p_unsub_token_hash text,
  p_consent_version text, p_source_page text, p_ip_hash text, p_country text,
  p_project_slug text default null,
  p_name text default ''
) returns table(state text, confirm_needed boolean)
language plpgsql set search_path = public, pg_temp
as $$
declare
  v record;
  v_purpose text := coalesce('follow:' || p_project_slug, 'newsletter');
begin
  select * into v from _ensure_subscriber(p_email, p_email_hash, p_source,
                                          p_confirm_token_hash, p_unsub_token_hash, p_name);
  if v.blocked then
    return query select 'noop'::text, false; return;
  end if;

  if p_project_slug is not null then
    insert into interests (subscriber_id, project_slug, active)
    values (v.sub_id, p_project_slug, v.confirmed)
    on conflict (subscriber_id, project_slug)
      do update set active = interests.active or excluded.active;
  end if;

  insert into consent_log (subscriber_id, purpose, event, consent_text_version,
                           source_page, ip_hash, country)
  values (v.sub_id, v_purpose,
          (case when v.confirmed then 'confirmed' else 'requested' end)::consent_event,
          p_consent_version, p_source_page, p_ip_hash, p_country);

  return query select (case when v.confirmed then 'confirmed' else 'pending' end)::text,
                      v.confirm_needed;
end $$;

-- ---- confirm (double opt-in) ----------------------------------------------
create or replace function rpc_confirm(p_confirm_token_hash text)
returns table(state text, subscriber_id uuid)
language plpgsql set search_path = public, pg_temp
as $$
declare v_id uuid;
begin
  update subscribers
    set status = 'confirmed', confirmed_at = now(),
        confirm_token_hash = null, token_expires_at = null
    where confirm_token_hash = p_confirm_token_hash
      and status = 'pending'
      and token_expires_at > now()
    returning id into v_id;

  if v_id is null then
    return query select 'invalid'::text, null::uuid; return;
  end if;

  -- activate everything queued while pending
  update interests set active = true where interests.subscriber_id = v_id and not active;
  return query select 'confirmed'::text, v_id;
end $$;

-- ---- unsubscribe (global, reversible via fresh opt-in) ---------------------
create or replace function rpc_unsubscribe(p_unsub_token_hash text)
returns table(state text)
language plpgsql set search_path = public, pg_temp
as $$
declare v_id uuid;
begin
  update subscribers set status = 'unsubscribed'
    where unsubscribe_token_hash = p_unsub_token_hash
      and status in ('pending', 'confirmed')
    returning id into v_id;
  if v_id is null then
    return query select 'noop'::text; return;   -- idempotent
  end if;
  update interests set active = false where subscriber_id = v_id;
  return query select 'unsubscribed'::text;
end $$;

-- ---- unfollow (per-app scope) ---------------------------------------------
create or replace function rpc_unfollow(p_unfollow_token_hash text)
returns table(state text)
language plpgsql set search_path = public, pg_temp
as $$
declare v_n int;
begin
  delete from interests where unfollow_token_hash = p_unfollow_token_hash;
  get diagnostics v_n = row_count;
  return query select (case when v_n > 0 then 'unfollowed' else 'noop' end)::text;
end $$;

-- ---- submit idea (email-gated) --------------------------------------------
create or replace function rpc_submit_idea(
  p_email text, p_email_hash text, p_source text,
  p_confirm_token_hash text, p_unsub_token_hash text,
  p_consent_version text, p_source_page text, p_ip_hash text, p_country text,
  p_title text, p_body text, p_oss_consent boolean,
  p_name text default ''
) returns table(state text, confirm_needed boolean, idea_id uuid)
language plpgsql set search_path = public, pg_temp
as $$
declare v record; v_idea uuid;
begin
  select * into v from _ensure_subscriber(p_email, p_email_hash, p_source,
                                          p_confirm_token_hash, p_unsub_token_hash, p_name);
  if v.blocked then
    return query select 'noop'::text, false, null::uuid; return;
  end if;

  insert into ideas (submitter_subscriber_id, title, body, oss_consent_at, moderation_status)
  values (v.sub_id, p_title, p_body, case when p_oss_consent then now() end, 'pending')
  returning id into v_idea;

  insert into consent_log (subscriber_id, purpose, event, consent_text_version,
                           source_page, ip_hash, country)
  values (v.sub_id, 'idea',
          (case when v.confirmed then 'confirmed' else 'requested' end)::consent_event,
          p_consent_version, p_source_page, p_ip_hash, p_country);

  return query select (case when v.confirmed then 'submitted' else 'pending' end)::text,
                      v.confirm_needed, v_idea;
end $$;

-- ---- comment (email-gated) ------------------------------------------------
create or replace function rpc_comment(
  p_email text, p_email_hash text, p_source text,
  p_confirm_token_hash text, p_unsub_token_hash text,
  p_consent_version text, p_source_page text, p_ip_hash text, p_country text,
  p_idea_id uuid, p_parent_id uuid, p_body text,
  p_name text default ''
) returns table(state text, confirm_needed boolean, comment_id uuid)
language plpgsql set search_path = public, pg_temp
as $$
declare v record; v_comment uuid;
begin
  select * into v from _ensure_subscriber(p_email, p_email_hash, p_source,
                                          p_confirm_token_hash, p_unsub_token_hash, p_name);
  if v.blocked then
    return query select 'noop'::text, false, null::uuid; return;
  end if;

  insert into idea_comments (idea_id, parent_id, subscriber_id, body, moderation_status)
  values (p_idea_id, p_parent_id, v.sub_id, p_body, 'pending')
  returning id into v_comment;

  insert into consent_log (subscriber_id, purpose, event, consent_text_version,
                           source_page, ip_hash, country)
  values (v.sub_id, 'comment',
          (case when v.confirmed then 'confirmed' else 'requested' end)::consent_event,
          p_consent_version, p_source_page, p_ip_hash, p_country);

  return query select (case when v.confirmed then 'submitted' else 'pending' end)::text,
                      v.confirm_needed, v_comment;
end $$;

-- ---- vote (frictionless: fingerprint, no email) ---------------------------
create or replace function rpc_vote(p_idea_id uuid, p_voter_fingerprint text)
returns table(state text)
language plpgsql set search_path = public, pg_temp
as $$
begin
  insert into idea_votes (idea_id, voter_fingerprint)
  values (p_idea_id, p_voter_fingerprint)
  on conflict (idea_id, voter_fingerprint) do nothing;
  if found then
    update ideas set vote_count = vote_count + 1 where id = p_idea_id;
    return query select 'voted'::text;
  else
    return query select 'noop'::text;   -- already voted
  end if;
end $$;

-- ---- suppress (Resend webhook: hard bounce / complaint) -------------------
create or replace function rpc_suppress(p_email_hash text, p_reason text)
returns void
language plpgsql set search_path = public, pg_temp
as $$
begin
  insert into suppression (email_hash, reason) values (p_email_hash, p_reason)
    on conflict (email_hash) do nothing;
  update subscribers set status = 'suppressed'
    where email_hash = p_email_hash and status <> 'erased';
end $$;

-- ---- GDPR erasure (anonymize, retain suppression) -------------------------
create or replace function rpc_erase_subscriber(p_email_hash text)
returns table(state text)
language plpgsql set search_path = public, pg_temp
as $$
declare v_id uuid;
begin
  update subscribers
    set status = 'erased',
        email = 'erased+' || id::text || '@erased.invalid',
        email_hash = null,
        confirm_token_hash = null,
        unsubscribe_token_hash = null,
        token_expires_at = null
    where email_hash = p_email_hash
    returning id into v_id;
  if v_id is null then
    return query select 'noop'::text; return;
  end if;
  -- retain a hash-only suppression marker so the address can never be re-mailed
  insert into suppression (email_hash, reason) values (p_email_hash, 'erased')
    on conflict (email_hash) do nothing;
  -- keep board history but sever PII linkage
  update ideas set submitter_subscriber_id = null, author_handle = null, author_erased = true
    where submitter_subscriber_id = v_id;
  update idea_comments set subscriber_id = null, author_erased = true
    where subscriber_id = v_id;
  update consent_log set subscriber_id = null where subscriber_id = v_id;
  delete from interests where subscriber_id = v_id;
  return query select 'erased'::text;
end $$;

-- ---- moderation (admin) ---------------------------------------------------
create or replace function rpc_moderate_idea(
  p_idea_id uuid, p_moderation moderation_status, p_status idea_status,
  p_built_project_slug text
) returns void
language plpgsql set search_path = public, pg_temp
as $$
begin
  update ideas
    set moderation_status = coalesce(p_moderation, moderation_status),
        status = coalesce(p_status, status),
        built_project_slug = coalesce(p_built_project_slug, built_project_slug)
    where id = p_idea_id;
end $$;

create or replace function rpc_moderate_comment(
  p_comment_id uuid, p_moderation moderation_status
) returns void
language plpgsql set search_path = public, pg_temp
as $$
begin
  update idea_comments set moderation_status = p_moderation where id = p_comment_id;
end $$;

-- ---- DB-backed rate limiter (fixed window) --------------------------------
-- Returns true if the request is ALLOWED (under the limit) for this bucket/window.
create or replace function rpc_rate_check(
  p_bucket text, p_limit int, p_window_seconds int
) returns boolean
language plpgsql set search_path = public, pg_temp
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count int;
begin
  insert into rate_limits (bucket, window_start, count)
  values (p_bucket, v_window, 1)
  on conflict (bucket, window_start) do update set count = rate_limits.count + 1
  returning count into v_count;
  return v_count <= p_limit;
end $$;

-- Only the server-side service-role may execute these.
revoke execute on all functions in schema public from anon, authenticated;
grant execute on all functions in schema public to service_role;
