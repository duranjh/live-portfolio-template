import { describe, it, expect } from 'vitest'
import { hmacIp, emailHash, voterFingerprint, sha256Hex } from '@/lib/security/hash'

describe('keyed hashing', () => {
  it('hmacIp is deterministic and never contains the raw IP', () => {
    expect(hmacIp('1.2.3.4')).toBe(hmacIp('1.2.3.4'))
    expect(hmacIp('1.2.3.4')).not.toContain('1.2.3.4')
    expect(hmacIp('1.2.3.4')).not.toBe(hmacIp('1.2.3.5'))
    expect(hmacIp('1.2.3.4')).toMatch(/^[0-9a-f]{64}$/)
  })

  it('emailHash is deterministic per normalized email', () => {
    expect(emailHash('a@b.com')).toBe(emailHash('a@b.com'))
    expect(emailHash('a@b.com')).not.toBe(emailHash('c@d.com'))
  })

  it('voterFingerprint varies by IP and UA', () => {
    expect(voterFingerprint('1.1.1.1', 'UA')).not.toBe(voterFingerprint('1.1.1.1', 'UB'))
    expect(voterFingerprint('1.1.1.1', 'UA')).not.toBe(voterFingerprint('2.2.2.2', 'UA'))
  })

  it('sha256Hex', () => {
    expect(sha256Hex('x')).toMatch(/^[0-9a-f]{64}$/)
  })
})
