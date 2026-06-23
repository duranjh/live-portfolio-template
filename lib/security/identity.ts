import 'server-only'
import { createHmac } from 'node:crypto'
import { requireCaptureEnv } from '@/lib/env'
import { safeEqual } from './tokens'

/**
 * "Remembered identity" — the same-browser convenience that turns a second Follow into one
 * click (the plan's "verify once, reused everywhere"). Two cookies:
 *
 *  • IDENTITY_COOKIE (`lp_identity`) — httpOnly, Secure, SameSite=Lax, HMAC-SIGNED. Carries the
 *    visitor's own verified email so the server can record a later follow without re-asking.
 *    Server-read-only (no JS access) + signed (no forge/tamper). Deliberate, documented PII
 *    tradeoff: it's the user's *own* email in a server-only signed token — a standard "remember
 *    me", and far safer than a readable cookie. The DB stays the source of truth; clearing the
 *    cookie simply brings the form back, so it can't be used to bypass anything.
 *  • KNOWN_FLAG_COOKIE (`lp_known`) — a readable, non-PII `1` flag the client reads to decide
 *    whether to show the one-click UI. Carries no identity on its own.
 */

const TTL_MS = 180 * 24 * 60 * 60 * 1000 // 180 days

export const IDENTITY_COOKIE = 'lp_identity'
export const KNOWN_FLAG_COOKIE = 'lp_known'
export const IDENTITY_MAX_AGE = Math.floor(TTL_MS / 1000)

function sign(payload: string): string {
  return createHmac('sha256', requireCaptureEnv().IP_HMAC_KEY).update(payload).digest('base64url')
}

/** Mint a signed identity token carrying the verified email, expiring `TTL_MS` after `nowMs`. */
export function makeIdentityToken(email: string, nowMs: number): string {
  const emailEnc = Buffer.from(email, 'utf8').toString('base64url')
  const payload = `v1.${nowMs + TTL_MS}.${emailEnc}`
  return `${payload}.${sign(payload)}`
}

/** Verify signature + non-expiry; returns the embedded email, or null if invalid/expired. */
export function readIdentityToken(token: string | undefined, nowMs: number): string | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 4 || parts[0] !== 'v1') return null
  const [v, exp, emailEnc, sig] = parts
  if (!safeEqual(sig, sign(`${v}.${exp}.${emailEnc}`))) return null
  const expMs = Number(exp)
  if (!Number.isFinite(expMs) || expMs <= nowMs) return null
  return Buffer.from(emailEnc, 'base64url').toString('utf8')
}
