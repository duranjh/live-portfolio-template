import 'server-only'
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto'

/**
 * Opaque capability tokens (confirm / unsubscribe).
 *
 * The RAW token is sent in the email link and is never stored. We store only
 * its SHA-256 hash; on click we hash the incoming value and look it up. A DB
 * leak therefore exposes no usable tokens. Tokens are high-entropy (256 bits),
 * so a fast hash is correct here (no slow KDF needed — that is for low-entropy
 * passwords, which this project does not have).
 */

/** Cryptographically-random, URL-safe 256-bit token. */
export function generateToken(): string {
  return randomBytes(32).toString('base64url')
}

/** SHA-256 hex of a token, for storage + lookup. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/** Constant-time string comparison (equal-length, timing-safe). */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}
