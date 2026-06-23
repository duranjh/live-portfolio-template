import { describe, it, expect } from 'vitest'
import { honeypotTripped, HONEYPOT_FIELD } from '@/lib/security/honeypot'

describe('honeypot', () => {
  it('trips when the hidden field is filled', () => {
    const f = new FormData()
    f.set(HONEYPOT_FIELD, 'i am a bot')
    expect(honeypotTripped(f)).toBe(true)
  })

  it('passes when the hidden field is empty or absent', () => {
    expect(honeypotTripped(new FormData())).toBe(false)
    const f = new FormData()
    f.set(HONEYPOT_FIELD, '')
    expect(honeypotTripped(f)).toBe(false)
  })
})
