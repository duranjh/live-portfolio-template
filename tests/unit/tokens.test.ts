import { describe, it, expect } from 'vitest'
import { generateToken, hashToken, safeEqual } from '@/lib/security/tokens'

describe('tokens', () => {
  it('generates unique, URL-safe, high-entropy tokens', () => {
    const a = generateToken()
    const b = generateToken()
    expect(a).not.toBe(b)
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(a.length).toBeGreaterThan(40)
  })

  it('hashes deterministically to 64 hex chars', () => {
    const t = generateToken()
    expect(hashToken(t)).toBe(hashToken(t))
    expect(hashToken(t)).toMatch(/^[0-9a-f]{64}$/)
    expect(hashToken(t)).not.toBe(t)
  })

  it('safeEqual: equal vs different vs different-length', () => {
    expect(safeEqual('abc', 'abc')).toBe(true)
    expect(safeEqual('abc', 'abd')).toBe(false)
    expect(safeEqual('abc', 'abcd')).toBe(false)
  })
})
