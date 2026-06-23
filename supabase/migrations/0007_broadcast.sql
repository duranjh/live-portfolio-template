-- ===========================================================================
-- 0007_broadcast.sql — send-side: live segment recipients + stateless unsubscribe
-- ===========================================================================
-- Two server-only RPCs called by the service-role client (which bypasses RLS,
-- like every other RPC here). No new tables.

-- ---- live segment recipients (evaluated at SEND time) ----------------------
-- Returns who would receive a broadcast RIGHT NOW: status='confirmed' (so
-- pending/unsubscribed/suppressed/erased are excluded) AND email_hash not in the
-- durable suppression list. Segment is 'newsletter'/'*' (all confirmed) or
-- 'follow:<slug>' (confirmed with an ACTIVE interest in that app). Re-running this
-- at confirm-time is what honors a mid-broadcast unsubscribe.
create or replace function rpc_segment_recipients(p_segment text)
returns table(email text, name text, email_hash text)
language plpgsql set search_path = public, pg_temp
as $$
begin
  if p_segment = 'newsletter' or p_segment = '*' then
    return query
      select s.email, s.name, s.email_hash
      from subscribers s
      where s.status = 'confirmed'
        and (s.email_hash is null
             or not exists (select 1 from suppression sup where sup.email_hash = s.email_hash));
  elsif p_segment like 'follow:%' then
    return query
      select s.email, s.name, s.email_hash
      from subscribers s
      join interests i on i.subscriber_id = s.id and i.active
      where s.status = 'confirmed'
        and i.project_slug = substring(p_segment from 8)
        and (s.email_hash is null
             or not exists (select 1 from suppression sup where sup.email_hash = s.email_hash));
  end if;
end $$;

-- ---- stateless unsubscribe (by keyed email_hash) ---------------------------
-- Same effect as rpc_unsubscribe (global, reversible via a fresh opt-in) but keyed
-- by email_hash, for the stateless broadcast unsubscribe token. Idempotent.
create or replace function rpc_unsubscribe_by_hash(p_email_hash text)
returns table(state text)
language plpgsql set search_path = public, pg_temp
as $$
declare v_id uuid;
begin
  update subscribers set status = 'unsubscribed'
    where email_hash = p_email_hash and status in ('pending', 'confirmed')
    returning id into v_id;
  if v_id is null then
    return query select 'noop'::text; return;   -- idempotent (already gone / unknown)
  end if;
  update interests set active = false where subscriber_id = v_id;
  return query select 'unsubscribed'::text;
end $$;
