-- 0003_rls.sql
-- Default-deny, fail-closed RLS. The anon/public key can read or write NOTHING.
--
-- Every table is ENABLE + FORCE ROW LEVEL SECURITY with ZERO policies for anon /
-- authenticated. FORCE matters: plain ENABLE does not apply to the table owner, so a
-- future owner-connection or accidental grant would leak. With FORCE + no policies,
-- the only way in is the service-role key (which bypasses RLS by design and never
-- leaves the server). All writes go through SECURITY DEFINER RPCs (migration 0004);
-- all reads go through server code using the service-role client. There is no public
-- board view granted to anon — the /ideas page is server-rendered from a sanitized,
-- PII-free projection.

do $$
declare t text;
begin
  foreach t in array array[
    'subscribers', 'consent_log', 'interests', 'suppression',
    'ideas', 'idea_votes', 'idea_comments', 'webhook_events', 'rate_limits'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force row level security;', t);
    -- Defense in depth: strip any default table grants from the public API roles.
    execute format('revoke all on table public.%I from anon, authenticated;', t);
  end loop;
end $$;

-- Helper functions are owner-defined; never expose them to the public API roles.
revoke all on function app_uuid_v7() from anon, authenticated;
revoke all on function app_set_updated_at() from anon, authenticated;
