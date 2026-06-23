import { describe, it, expect } from 'vitest'
import { makeUnsubToken, verifyUnsubToken } from '@/lib/security/unsub'

describe('stateless unsubscribe token', () => {
  const now = 1_700_000_000_000
  const hash = 'a'.repeat(64) // a hex email_hash

  it('round-trips the email-hash', () => {
    const t = makeUnsubToken(hash, now)
    expect(verifyUnsubToken(t, now + 1000)).toBe(hash)
  })

  it('rejects an expired token', () => {
    const t = makeUnsubToken(hash, now)
    expect(verifyUnsubToken(t, now + 366 * 24 * 60 * 60 * 1000)).toBe(null)
  })

  it('rejects tampered or malformed tokens', () => {
    const t = makeUnsubToken(hash, now)
    expect(verifyUnsubToken(t + 'x', now + 1000)).toBe(null)
    expect(verifyUnsubToken(t.replace(/^u1\./, 'v1.'), now + 1000)).toBe(null)
    expect(verifyUnsubToken('garbage', now)).toBe(null)
    expect(verifyUnsubToken(undefined, now)).toBe(null)
  })
})
