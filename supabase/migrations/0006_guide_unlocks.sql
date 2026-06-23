-- 0007_guide_unlocks.sql
-- Guide lead-magnet access tracking + the 1-free-then-verify unlock state machine.
-- An UNVERIFIED (pending) email may hold exactly ONE guide unlock; a CONFIRMED email
-- unlocks all guides. Mirrors the 0004 conventions (SECURITY INVOKER, pinned
-- search_path, service-role-only execute). Demo mode never reaches this (no DB).

set check_function_bodies = off;

create table if not exists guide_unlocks (
  id            uuid primary key default app_uuid_v7(),
  subscriber_id uuid not null references subscribers (id) on delete cascade,
  guide_slug    text not null,
  unlocked_at   timestamptz not null default now(),
  unique (subscriber_id, guide_slug)
);
create index if not exists guide_unlocks_subscriber_idx on guide_unlocks (subscriber_id);

-- Default-deny like every other table: FORCE RLS + zero policies (service-role bypasses).
alter table guide_unlocks enable row level security;
alter table guide_unlocks force row level security;

-- ---- unlock guide (1 free while pending, all once confirmed) ----------------
create or replace function rpc_unlock_guide(
  p_email text, p_email_hash text, p_source text,
  p_confirm_token_hash text, p_unsub_token_hash text,
  p_consent_version text, p_source_page text, p_ip_hash text, p_country text,
  p_guide_slug text,
  p_name text default ''
) returns table(state text, confirm_needed boolean, unlocked boolean, scope text)
language plpgsql set search_path = public, pg_temp
as $$
declare
  v record;
  v_has_this boolean;
  v_count int;
begin
  select * into v from _ensure_subscriber(p_email, p_email_hash, p_source,
                                          p_confirm_token_hash, p_unsub_token_hash, p_name);
  if v.blocked then
    return query select 'noop'::text, false, false, null::text; return;
  end if;

  insert into consent_log (subscriber_id, purpose, event, consent_text_version,
                           source_page, ip_hash, country)
  values (v.sub_id, 'guide:' || p_guide_slug,
          (case when v.confirmed then 'confirmed' else 'requested' end)::consent_event,
          p_consent_version, p_source_page, p_ip_hash, p_country);

  -- Confirmed → unlock ALL guides (record this one for analytics).
  if v.confirmed then
    insert into guide_unlocks (subscriber_id, guide_slug) values (v.sub_id, p_guide_slug)
      on conflict (subscriber_id, guide_slug) do nothing;
    return query select 'confirmed'::text, false, true, '*'::text; return;
  end if;

  -- Pending → exactly one free guide, then they must confirm.
  select exists(
    select 1 from guide_unlocks where subscriber_id = v.sub_id and guide_slug = p_guide_slug
  ) into v_has_this;
  select count(*) into v_count from guide_unlocks where subscriber_id = v.sub_id;

  if v_has_this then
    -- their existing free guide → re-grant
    return query select 'pending'::text, v.confirm_needed, true, p_guide_slug; return;
  elsif v_count = 0 then
    -- first free guide → record + grant
    insert into guide_unlocks (subscriber_id, guide_slug) values (v.sub_id, p_guide_slug);
    return query select 'pending'::text, v.confirm_needed, true, p_guide_slug; return;
  else
    -- a different guide already used while pending → must confirm first
    return query select 'needs_confirm'::text, v.confirm_needed, false, null::text; return;
  end if;
end $$;

revoke execute on function rpc_unlock_guide(
  text, text, text, text, text, text, text, text, text, text, text
) from anon, authenticated;
grant execute on function rpc_unlock_guide(
  text, text, text, text, text, text, text, text, text, text, text
) to service_role;
