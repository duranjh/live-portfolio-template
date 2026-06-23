import { z } from 'zod'

/**
 * Conservative email normalization: lowercase + trim + NFC only.
 *
 * Deliberately does NOT strip Gmail dots / `+` subaddressing — doing so for
 * non-Gmail domains would merge genuinely different people into one subscriber.
 * The `UNIQUE` constraint on the normalized column catches true duplicates.
 */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase().normalize('NFC')
}

const emailField = z
  .string()
  .min(3)
  .max(254)
  .email()
  // Require a real domain + TLD (reject "a@b" / "sd@dds" that .email() alone may allow).
  .regex(/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/, 'Enter a valid email (e.g. name@example.com)')
  .transform(normalizeEmail)

const nameField = z.string().trim().min(1).max(120)

export const subscribeSchema = z.object({
  name: nameField,
  email: emailField,
  /** Present when following a specific app; absent for the general newsletter. */
  projectSlug: z.string().max(120).optional(),
  source: z.string().max(120).optional(),
})

export const guideGateSchema = z.object({
  name: nameField,
  email: emailField,
  guideSlug: z.string().max(160),
})

export const ideaSchema = z.object({
  name: nameField,
  email: emailField,
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(10).max(4000),
  /** Required open-source-consent checkbox — must be explicitly true. */
  ossConsent: z.literal(true),
})

/** Owner broadcast to one segment. `segment` = 'newsletter' | '*' | 'follow:<slug>'. */
export const broadcastSchema = z.object({
  segment: z.string().min(1).max(160),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(20000),
  confirm: z.boolean().optional().default(false),
})

export const commentSchema = z.object({
  name: nameField,
  email: emailField,
  ideaId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  body: z.string().trim().min(1).max(2000),
})

// Votes are frictionless (no email) — fingerprint-throttled only.
export const voteSchema = z.object({
  ideaId: z.string().uuid(),
})

export type SubscribeInput = z.infer<typeof subscribeSchema>
export type IdeaInput = z.infer<typeof ideaSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type VoteInput = z.infer<typeof voteSchema>
