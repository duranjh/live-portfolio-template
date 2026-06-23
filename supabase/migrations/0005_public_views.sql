-- 0005_public_views.sql
-- Sanitized projection for the public board. Exposes ONLY safe columns — no
-- submitter_subscriber_id, no email. Approved ideas whose submitter is confirmed (or
-- whose author was erased). Read via the service-role client; never granted to anon.

create or replace view public_ideas
with (security_invoker = true) as
  select i.id, i.title, i.body, i.status, i.vote_count, i.built_project_slug, i.created_at,
    (select count(*) from idea_comments c
       where c.idea_id = i.id and c.moderation_status = 'approved') as comment_count
  from ideas i
  left join subscribers s on s.id = i.submitter_subscriber_id
  where i.moderation_status = 'approved'
    and (i.author_erased or s.status = 'confirmed');

revoke all on public_ideas from anon, authenticated;
