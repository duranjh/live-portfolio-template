import { describe, it, expect } from 'vitest'
import { withNeutralResult } from '@/lib/security/neutral'

describe('withNeutralResult', () => {
  it('returns an identical shape whether the body succeeds or throws', async () => {
    const success = await withNeutralResult(async () => {}, 'hello')
    const failure = await withNeutralResult(async () => {
      throw new Error('boom')
    }, 'hello')
    expect(success).toEqual(failure)
    expect(success).toEqual({ ok: true, message: 'hello' })
  })

  it('enforces a minimum response time (timing floor)', async () => {
    const start = Date.now()
    await withNeutralResult(async () => {}, 'x')
    expect(Date.now() - start).toBeGreaterThanOrEqual(300)
  })
})
