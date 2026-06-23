import { describe, it, expect } from 'vitest'
import { makeUnlockToken, verifyUnlockToken } from '@/lib/security/unlock'

describe('guide unlock token (scoped)', () => {
  const now = 1_700_000_000_000

  it('an all-scope token unlocks any guide', () => {
    const t = makeUnlockToken('*', now)
    expect(verifyUnlockToken(t, 'ship-in-30-days', now + 1000)).toBe(true)
    expect(verifyUnlockToken(t, 'any-other-guide', now + 1000)).toBe(true)
  })

  it('a slug-scoped token unlocks only that one guide', () => {
    const t = makeUnlockToken('ship-in-30-days', now)
    expect(verifyUnlockToken(t, 'ship-in-30-days', now + 1000)).toBe(true)
    expect(verifyUnlockToken(t, 'a-different-guide', now + 1000)).toBe(false)
  })

  it('rejects an expired token', () => {
    const t = makeUnlockToken('*', now)
    expect(verifyUnlockToken(t, 'ship-in-30-days', now + 100 * 24 * 60 * 60 * 1000)).toBe(false)
  })

  it('rejects tampered or malformed tokens', () => {
    const t = makeUnlockToken('*', now)
    expect(verifyUnlockToken(t + 'x', 'ship-in-30-days', now + 1000)).toBe(false)
    expect(verifyUnlockToken('garbage', 'ship-in-30-days', now)).toBe(false)
    expect(verifyUnlockToken(undefined, 'ship-in-30-days', now)).toBe(false)
  })
})
