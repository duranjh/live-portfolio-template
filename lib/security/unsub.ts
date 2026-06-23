import 'server-only'
import { createHmac } from 'node:crypto'
import { requireCaptureEnv } from '@/lib/env'
import { safeEqual } from './tokens'

/**
 * Stateless, signed unsubscribe token for BROADCAST emails — no per-recipient DB row to mint
 * or store. It carries the keyed `email_hash` (itself an HMAC, never the raw address), so the
 * unsubscribe endpoint can act with a single `email_hash` lookup. HMAC-signed (unforgeable) with
 * an embedded expiry. Distinct from the per-subscriber stored confirm/unsubscribe token hashes
 * used by the double-opt-in flow — the unsubscribe handlers accept either (branch on the `u1.`
 * prefix). Long TTL because an unsubscribe link in an old email must still work.
 */

const TTL_MS = 365 * 24 * 60 * 60 * 1000 // 1 year

function sign(payload: string): string {
  return createHmac('sha256', requireCaptureEnv().IP_HMAC_KEY).update(payload).digest('base64url')
}

/** Mint a stateless unsubscribe token for `emailHash`, expiring `TTL_MS` after `nowMs`. */
export function makeUnsubToken(emailHash: string, nowMs: number): string {
  // base64url the hash so its encoding can never collide with the '.' delimiter.
  const enc = Buffer.from(emailHash, 'utf8').toString('base64url')
  const payload = `u1.${nowMs + TTL_MS}.${enc}`
  return `${payload}.${sign(payload)}`
}

/** Verify signature + non-expiry; returns the embedded `email_hash`, or null if invalid/expired. */
export function verifyUnsubToken(token: string | undefined, nowMs: number): string | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 4 || parts[0] !== 'u1') return null
  const [v, exp, enc, sig] = parts
  if (!safeEqual(sig, sign(`${v}.${exp}.${enc}`))) return null
  const expMs = Number(exp)
  if (!Number.isFinite(expMs) || expMs <= nowMs) return null
  return Buffer.from(enc, 'base64url').toString('utf8')
}
