import 'server-only'

/**
 * Capability-flag environment (server-only).
 *
 * Capture (database + email) is ALL-OR-NOTHING. If ANY capture secret is
 * present, the FULL set is required — otherwise we throw at startup instead of
 * silently half-running (which would lose data or disable bot defense). With NO
 * capture secrets, the app runs in DEMO MODE: forms validate and return the
 * same neutral success, but nothing is persisted or sent. `git clone &&
 * npm run dev` works for anyone with zero secrets.
 *
 * This module reads `process.env` and must never be imported by client code.
 * Client widgets read `NEXT_PUBLIC_*` values directly from `process.env`.
 */

export type CaptureEnv = {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  RESEND_API_KEY: string
  /** RFC 5322 from-address, e.g. `Jane <hello@example.com>` */
  MAIL_FROM: string
  /** Where owner notifications (new ideas, etc.) are sent. */
  OWNER_EMAIL: string
  /** Canonical site origin, e.g. `https://example.com` — used for links + origin checks. */
  SITE_URL: string
  TURNSTILE_SECRET_KEY: string
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: string
  /** Secret salt for keyed HMAC of IPs/emails so raw values are never stored. */
  IP_HMAC_KEY: string
  /** Svix signing secret for the Resend webhook. */
  RESEND_WEBHOOK_SECRET: string
}

const CAPTURE_KEYS: (keyof CaptureEnv)[] = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'MAIL_FROM',
  'OWNER_EMAIL',
  'SITE_URL',
  'TURNSTILE_SECRET_KEY',
  'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  'IP_HMAC_KEY',
  'RESEND_WEBHOOK_SECRET',
]

/** Presence of any of these signals the operator INTENDS to enable capture. */
const CAPTURE_SIGNAL_KEYS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
] as const

function read(key: string): string | undefined {
  const v = process.env[key]
  return v && v.trim().length > 0 ? v.trim() : undefined
}

function compute(): { captureEnabled: boolean; env: CaptureEnv | null } {
  const demoForced = read('DEMO') === 'true'
  const signalled = CAPTURE_SIGNAL_KEYS.some((k) => read(k) !== undefined)

  if (demoForced || !signalled) {
    return { captureEnabled: false, env: null }
  }

  // Capture is intended → require the full set, fail loud on partial config.
  const missing = CAPTURE_KEYS.filter((k) => read(k) === undefined)
  if (missing.length > 0) {
    throw new Error(
      `[env] Capture is partially configured. Missing: ${missing.join(', ')}. ` +
        `Set ALL capture variables to enable capture, or unset the database/email keys ` +
        `to run in demo mode. See .env.example.`,
    )
  }

  // Guard: the service-role key must never be exposed to the browser.
  for (const k of Object.keys(process.env)) {
    if (k.startsWith('NEXT_PUBLIC_') && /SERVICE_ROLE|SERVICE_KEY/i.test(k)) {
      throw new Error(`[env] ${k} looks like a secret exposed as NEXT_PUBLIC_. Remove it.`)
    }
  }

  const env = Object.fromEntries(
    CAPTURE_KEYS.map((k) => [k, read(k)!]),
  ) as CaptureEnv

  return { captureEnabled: true, env }
}

const result = compute()

/** True when the full capture stack is configured. */
export const captureEnabled = result.captureEnabled

/** Validated capture env, or `null` in demo mode. */
export const env = result.env

/** Optional admin secret; admin routes return 503 when absent. */
export const adminSecret = read('ADMIN_SECRET')

/** Returns the capture env or throws (use only on capture-enabled code paths). */
export function requireCaptureEnv(): CaptureEnv {
  if (!result.env) {
    throw new Error('[env] capture is disabled (demo mode); this path requires capture env.')
  }
  return result.env
}
