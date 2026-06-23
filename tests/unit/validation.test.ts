import { describe, it, expect } from 'vitest'
import { normalizeEmail, subscribeSchema, ideaSchema } from '@/lib/validation/schemas'

describe('normalizeEmail', () => {
  it('lowercases + trims but keeps dots and plus addressing', () => {
    expect(normalizeEmail('  Foo.Bar+tag@Example.COM ')).toBe('foo.bar+tag@example.com')
  })
})

describe('subscribeSchema', () => {
  it('accepts a valid name + email + optional slug', () => {
    const r = subscribeSchema.safeParse({ name: 'Jane Doe', email: 'A@B.com', projectSlug: 'app-x' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.email).toBe('a@b.com')
  })
  it('rejects an invalid email', () => {
    expect(subscribeSchema.safeParse({ name: 'Jane', email: 'nope' }).success).toBe(false)
  })
  it('requires a name', () => {
    expect(subscribeSchema.safeParse({ email: 'a@b.com' }).success).toBe(false)
  })
})

describe('ideaSchema', () => {
  const base = { name: 'Jane', email: 'a@b.com', title: 'A title', body: 'A sufficiently long body.' }
  it('requires ossConsent === true', () => {
    expect(ideaSchema.safeParse({ ...base, ossConsent: false }).success).toBe(false)
    expect(ideaSchema.safeParse({ ...base, ossConsent: true }).success).toBe(true)
  })
  it('enforces title/body length', () => {
    expect(ideaSchema.safeParse({ ...base, title: 'ab', ossConsent: true }).success).toBe(false)
  })
})
