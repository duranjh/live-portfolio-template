-- 0001_extensions.sql
-- Extensions + shared helper functions.

create extension if not exists pgcrypto;

-- Time-ordered UUIDv7 generator.
-- Postgres 18+ ships a native uuidv7(); this is the fallback for earlier versions
-- (Supabase is typically PG15–17). Time-ordered keys give good index locality while
-- remaining distributed/collision-free and non-enumerable.
create or replace function app_uuid_v7() returns uuid
language plpgsql volatile parallel safe as $$
declare
  ts_ms bigint := floor(extract(epoch from clock_timestamp()) * 1000)::bigint;
  bytes bytea;
begin
  -- 6 bytes of millisecond timestamp (big-endian low 48 bits) + 10 random bytes.
  bytes := substring(int8send(ts_ms) from 3 for 6) || gen_random_bytes(10);
  -- set version (7) in the high nibble of byte 6
  bytes := set_byte(bytes, 6, (112 | (get_byte(bytes, 6) & 15)));
  -- set variant (10xx) in the high bits of byte 8
  bytes := set_byte(bytes, 8, (128 | (get_byte(bytes, 8) & 63)));
  return encode(bytes, 'hex')::uuid;
end $$;

-- Generic updated_at touch trigger.
create or replace function app_set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;
