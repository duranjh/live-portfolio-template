-- 0002_tables.sql
-- Tables, enums, constraints, indexes. UUIDv7 PKs everywhere.

create type subscriber_status as enum
  ('pending', 'confirmed', 'unsubscribed', 'suppressed', 'erased');
create type idea_status as enum
  ('open', 'accepted', 'building', 'shipped', 'declined');
-- Pre-moderation: user content starts 'pending' and is public only once 'approved'.
create type moderation_status as enum
  ('pending', 'approved', 'rejected', 'hidden');
create type consent_event as enum ('requested', 'confirmed', 'withdrawn');

-- One row per human, keyed by verified email. The only identity in the system.
create table subscribers (
  id                       uuid primary key default app_uuid_v7(),
  name                     text,
  email                    text not null,
  email_hash               text,                 -- keyed HMAC; durable suppression key
  status                   subscriber_status not null default 'pending',
  confirm_token_hash       text,
  unsubscribe_token_hash   text,                 -- global one-click (RFC 8058) scope
  token_expires_at         timestamptz,
  last_confirm_sent_at     timestamptz,          -- dedicated; resend cooldown (never overload updated_at)
  source                   text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  confirmed_at             timestamptz
);
create unique index subscribers_email_key on subscribers (email);
create unique index subscribers_confirm_token_key
  on subscribers (confirm_token_hash) where confirm_token_hash is not null;
create unique index subscribers_unsub_token_key
  on subscribers (unsubscribe_token_hash) where unsubscribe_token_hash is not null;

create trigger subscribers_set_updated_at
  before update on subscribers
  for each row execute function app_set_updated_at();

-- GDPR/CASL proof-of-consent audit trail (append-only).
create table consent_log (
  id                   uuid primary key default app_uuid_v7(),
  subscriber_id        uuid references subscribers (id) on delete set null,
  purpose              text not null,            -- 'newsletter' | 'follow:<slug>' | 'idea' | 'comment'
  event                consent_event not null,
  consent_text_version text,
  source_page          text,
  ip_hash              text,
  country              text,
  created_at           timestamptz not null default now()
);
create index consent_log_subscriber_idx on consent_log (subscriber_id);

-- Per-app "follow" segmentation. Inert (active=false) until the email is confirmed.
create table interests (
  id                  uuid primary key default app_uuid_v7(),
  subscriber_id       uuid not null references subscribers (id) on delete cascade,
  project_slug        text not null,
  active              boolean not null default false,  -- lit atomically on confirm
  unfollow_token_hash text,                            -- per-app unfollow scope
  created_at          timestamptz not null default now(),
  unique (subscriber_id, project_slug)
);
create index interests_project_idx on interests (project_slug) where active;

-- Permanent do-not-contact marker keyed by email HASH, so it survives GDPR erasure
-- of the raw email and can never be re-mailed.
create table suppression (
  email_hash text primary key,
  reason     text,
  created_at timestamptz not null default now()
);

-- Public idea board. Content stored as plain text; rendered escaped.
create table ideas (
  id                      uuid primary key default app_uuid_v7(),
  submitter_subscriber_id uuid references subscribers (id) on delete set null,
  author_handle           text,
  author_erased           boolean not null default false,
  title                   text not null,
  body                    text not null,
  status                  idea_status not null default 'open',
  oss_consent_at          timestamptz,
  moderation_status       moderation_status not null default 'pending',
  built_project_slug      text,                 -- two-way credit link to the shipped app
  vote_count              integer not null default 0,
  created_at              timestamptz not null default now()
);
create index ideas_public_idx on ideas (created_at desc)
  where moderation_status = 'approved';

-- One vote per identity, enforced at the DB. Canonical votes tie to a confirmed subscriber.
create table idea_votes (
  id                  uuid primary key default app_uuid_v7(),
  idea_id             uuid not null references ideas (id) on delete cascade,
  voter_subscriber_id uuid references subscribers (id) on delete set null,
  voter_fingerprint   text not null,
  created_at          timestamptz not null default now(),
  unique (idea_id, voter_fingerprint)
);

create table idea_comments (
  id                uuid primary key default app_uuid_v7(),
  idea_id           uuid not null references ideas (id) on delete cascade,
  parent_id         uuid references idea_comments (id) on delete cascade,  -- one level
  subscriber_id     uuid references subscribers (id) on delete set null,
  author_erased     boolean not null default false,
  body              text not null,
  moderation_status moderation_status not null default 'pending',
  created_at        timestamptz not null default now()
);
create index idea_comments_idea_idx on idea_comments (idea_id, created_at);

-- Resend webhook idempotency: dedupe at-least-once delivery on the Svix message id.
create table webhook_events (
  svix_id     text primary key,
  type        text,
  received_at timestamptz not null default now()
);

-- Lightweight DB-backed rate limiter (fallback under Cloudflare). One row per
-- (bucket, fixed window); the RPC increments and checks the count.
create table rate_limits (
  bucket       text not null,        -- e.g. 'subscribe:<ip_hash>'
  window_start timestamptz not null,
  count        integer not null default 0,
  primary key (bucket, window_start)
);
