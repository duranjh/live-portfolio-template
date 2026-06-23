import 'server-only'
import { createHmac, createHash } from 'node:crypto'
import { requireCaptureEnv } from '@/lib/env'

/**
 * Keyed hashing for values we must compare/deduplicate but never store raw.
 *
 * IP addresses are personal data; we store only a keyed HMAC so the raw IP is
 * unrecoverable while still letting us throttle and dedupe. The secret key
 * (IP_HMAC_KEY) makes the small IPv4 space infeasible to brute-force/rainbow.
 */

function key(): string {
  return requireCaptureEnv().IP_HMAC_KEY
}

/** Plain SHA-256 hex (non-secret inputs). */
export function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

/** Keyed HMAC of an IP address (raw IP never stored). */
export function hmacIp(ip: string): string {
  return createHmac('sha256', key()).update(`ip:${ip}`).digest('hex')
}

/** Keyed HMAC of a normalized email — the durable suppression key. */
export function emailHash(emailNorm: string): string {
  return createHmac('sha256', key()).update(`email:${emailNorm}`).digest('hex')
}

/** One-per-identity vote key derived from IP + UA (best-effort for anon paths). */
export function voterFingerprint(ip: string, ua: string): string {
  return createHmac('sha256', key()).update(`vote:${ip}|${ua}`).digest('hex')
}
