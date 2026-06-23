import 'server-only'
import { createHmac } from 'node:crypto'
import { requireCaptureEnv } from '@/lib/env'
import { safeEqual } from './tokens'

/**
 * Stateless, signed, SCOPED guide-unlock token (the `guides_unlock` cookie).
 *
 * Scope is `'*'` (a confirmed email — every guide) or a single guide slug (a still-
 * unverified email's one free guide). The guide page renders gated MDX only when this
 * verifies server-side for the requested slug. HMAC-signed (no DB row needed) with an
 * embedded ~90-day expiry. The DB (`subscribers.status` + `guide_unlocks`) is the
 * source of truth at submit time; this cookie is the same-browser fast path.
 */

const TTL_MS = 90 * 24 * 60 * 60 * 1000

export const UNLOCK_COOKIE = 'guides_unlock'

/** `'*'` = all guides (confirmed); otherwise a single guide slug. */
export type UnlockScope = '*' | (string & {})

function sign(payload: string): string {
  return createHmac('sha256', requireCaptureEnv().IP_HMAC_KEY).update(payload).digest('base64url')
}

/** Mint a token for `scope` that expires `TTL_MS` after `nowMs`. */
export function makeUnlockToken(scope: UnlockScope, nowMs: number): string {
  // base64url the scope so a slug can never collide with the '.' delimiter.
  const scopeEnc = Buffer.from(scope, 'utf8').toString('base64url')
  const payload = `v2.${nowMs + TTL_MS}.${scopeEnc}`
  return `${payload}.${sign(payload)}`
}

/** Verify signature + non-expiry + that `slug` is in scope (`'*'` or an exact match). */
export function verifyUnlockToken(
  token: string | undefined,
  slug: string,
  nowMs: number,
): boolean {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 4 || parts[0] !== 'v2') return false
  const [v, exp, scopeEnc, sig] = parts
  if (!safeEqual(sig, sign(`${v}.${exp}.${scopeEnc}`))) return false
  const expMs = Number(exp)
  if (!Number.isFinite(expMs) || expMs <= nowMs) return false
  const scope = Buffer.from(scopeEnc, 'base64url').toString('utf8')
  return scope === '*' || scope === slug
}
