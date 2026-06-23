# Security Policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Instead, use **GitHub's private
"Report a vulnerability"** flow (Security → Advisories) on this repository, or email the maintainer
at `[security contact]`. You'll get an acknowledgement, and we'll work on a fix and coordinate
disclosure. Please include steps to reproduce and the affected version/commit.

## Security model (how this template protects data)

This is a public template; treat the live security of any deployment as the operator's
responsibility. The codebase is built defense-in-depth:

- **No accounts, minimal attack surface.** Identity is a verified email — no passwords, sessions, or
  account-takeover surface. UUIDv7 PKs are non-enumerable.
- **Default-deny database.** Every table has `ENABLE` + `FORCE ROW LEVEL SECURITY` with **zero**
  anon/authenticated policies. The anon key can read/write nothing. All writes go through
  `SECURITY DEFINER`/INVOKER RPCs called by a **server-only** service-role client
  (`import 'server-only'`, key read only in `lib/db/client.ts`). Public board reads come from the
  sanitized `public_ideas` view (no submitter PII).
- **Secrets server-side only.** The service-role key is never `NEXT_PUBLIC_*` and never reaches the
  client bundle (a startup guard rejects a `NEXT_PUBLIC_*` service key). Demo mode runs with zero secrets.
- **Verify-once, double opt-in.** One confirmed email covers newsletter + every follow + the board.
  Signups are idempotent; suppressed/unsubscribed addresses are never silently resurrected.
- **Tokens & IPs.** Confirm/unsubscribe tokens are random, **stored hashed**, single-use, expiring,
  and `timingSafeEqual`-verified. Capability tokens (guide unlock, stateless unsubscribe, remembered
  identity) are **HMAC-signed**, verified server-side on every use. IPs/emails are stored only as a
  **keyed HMAC**, never raw.
- **Input is hostile by default.** Every Server Action / route handler input is Zod-validated.
  User-generated content is rendered as escaped plain text (no `dangerouslySetInnerHTML` on UGC).
- **Bot/abuse defense.** Cloudflare WAF + Bot Fight + server-verified Turnstile + honeypot +
  rate-limit, with **neutral, timing-uniform responses** (no account enumeration).
- **Admin/broadcast.** Behind Cloudflare Access (verified JWT) or a constant-time `ADMIN_SECRET`;
  routes return `503` when unconfigured. Broadcast is **dry-run by default**.
- **Headers & CSP.** HSTS, `nosniff`, `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy,
  and a starter Content-Security-Policy in `next.config.ts`.

## Operator checklist

- Set a strong random `IP_HMAC_KEY`; keep the Supabase **service-role** key server-side only.
- Apply all `supabase/migrations` in order; confirm anon Postgres reads return no PII.
- Put Cloudflare in front (WAF rate-limit on the idea POST path, Bot Fight, Turnstile).
- Verify headers on securityheaders.com; keep dependencies patched (Dependabot + `npm audit`).
