# Data Retention

Defaults for a deployment with capture enabled. Tune to your jurisdiction and policy; the shipped
privacy policy should reflect whatever you choose. *(General guidance, not legal advice.)*

| Data | Default retention | Notes |
| --- | --- | --- |
| **Pending / unconfirmed signups** | **30 days**, then auto-purged | Limits exposure of un-opted-in addresses; bounds throwaway-email abuse on the guide gate. |
| **Confirmed subscribers** | Until unsubscribe or erasure | The list you actually contact. |
| **Suppression markers** (`suppression`) | **Indefinite** | A do-not-contact hash kept even after erasure, so an address is never re-added. |
| **Consent log** (`consent_log`) | **~3 years** | GDPR/CASL proof-of-consent audit trail. |
| **Security / request logs** | **30–90 days** | Error refs, rate-limit/throttle rows. |
| **Ephemeral token / throttle rows** | Purged on schedule | Expired confirm/unsubscribe tokens, rate-limit buckets, webhook dedupe rows. |
| **Idea board content** | Until removed/erased | On erasure, authorship is anonymized (tombstoned), the content may remain. |
| **Backups** | Provider default, capped | Per your Supabase/host backup policy. |

## Enforcement

Retention is intended to be enforced by scheduled jobs (e.g. **pg_cron** on Supabase): purge
pending signups past 30 days, expire ephemeral tokens/throttle rows, and trim security logs. These
are operator-configured, not run automatically by the template.

## Erasure (GDPR / right to be forgotten)

Erasure is **anonymize, not hard-delete**: the email is tombstoned, `status` becomes `erased`,
content foreign keys repoint to a sentinel — and the **suppression hash is retained** so the address
can never be re-mailed. See `rpc_erase_subscriber` in `supabase/migrations`.
