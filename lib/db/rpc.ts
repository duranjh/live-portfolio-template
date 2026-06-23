import 'server-only'
import { db } from './client'

/**
 * Typed wrappers over the SECURITY-INVOKER state-machine RPCs (supabase/migrations).
 * Each RPC runs in one transaction; these just call it and unwrap the single row.
 * Returns `null` in demo mode (no DB) so capture actions become safe no-ops.
 */

function one<T>(data: unknown): T | null {
  if (Array.isArray(data)) return (data[0] as T | undefined) ?? null
  return (data as T) ?? null
}

/** Shared args for any action that touches the subscriber (verify-once) state machine. */
export type EnsureArgs = {
  name: string
  email: string
  emailHash: string
  source: string | null
  confirmTokenHash: string
  unsubTokenHash: string
  consentVersion: string
  sourcePage: string | null
  ipHash: string | null
  country: string | null
}

export type SubscribeResult = { state: string; confirm_needed: boolean }
export type IdeaResult = { state: string; confirm_needed: boolean; idea_id: string | null }
export type CommentResult = { state: string; confirm_needed: boolean; comment_id: string | null }

export async function rpcSubscribe(
  a: EnsureArgs & { projectSlug?: string | null },
): Promise<SubscribeResult | null> {
  const c = db()
  if (!c) return null
  const { data, error } = await c.rpc('rpc_subscribe', {
    p_email: a.email,
    p_email_hash: a.emailHash,
    p_source: a.source,
    p_confirm_token_hash: a.confirmTokenHash,
    p_unsub_token_hash: a.unsubTokenHash,
    p_consent_version: a.consentVersion,
    p_source_page: a.sourcePage,
    p_ip_hash: a.ipHash,
    p_country: a.country,
    p_name: a.name,
    p_project_slug: a.projectSlug ?? null,
  })
  if (error) throw error
  return one<SubscribeResult>(data)
}

export type UnlockResult = {
  state: string
  confirm_needed: boolean
  unlocked: boolean
  scope: string | null
}

/** Guide gate: 1-free-while-pending, all-once-confirmed. `scope` = '*' | slug | null. */
export async function rpcUnlockGuide(
  a: EnsureArgs & { guideSlug: string },
): Promise<UnlockResult | null> {
  const c = db()
  if (!c) return null
  const { data, error } = await c.rpc('rpc_unlock_guide', {
    p_email: a.email,
    p_email_hash: a.emailHash,
    p_source: a.source,
    p_confirm_token_hash: a.confirmTokenHash,
    p_unsub_token_hash: a.unsubTokenHash,
    p_consent_version: a.consentVersion,
    p_source_page: a.sourcePage,
    p_ip_hash: a.ipHash,
    p_country: a.country,
    p_name: a.name,
    p_guide_slug: a.guideSlug,
  })
  if (error) throw error
  return one<UnlockResult>(data)
}

export async function rpcSubmitIdea(
  a: EnsureArgs & { title: string; body: string; ossConsent: boolean },
): Promise<IdeaResult | null> {
  const c = db()
  if (!c) return null
  const { data, error } = await c.rpc('rpc_submit_idea', {
    p_email: a.email,
    p_email_hash: a.emailHash,
    p_source: a.source,
    p_confirm_token_hash: a.confirmTokenHash,
    p_unsub_token_hash: a.unsubTokenHash,
    p_consent_version: a.consentVersion,
    p_source_page: a.sourcePage,
    p_ip_hash: a.ipHash,
    p_country: a.country,
    p_name: a.name,
    p_title: a.title,
    p_body: a.body,
    p_oss_consent: a.ossConsent,
  })
  if (error) throw error
  return one<IdeaResult>(data)
}

export async function rpcComment(
  a: EnsureArgs & { ideaId: string; parentId: string | null; body: string },
): Promise<CommentResult | null> {
  const c = db()
  if (!c) return null
  const { data, error } = await c.rpc('rpc_comment', {
    p_email: a.email,
    p_email_hash: a.emailHash,
    p_source: a.source,
    p_confirm_token_hash: a.confirmTokenHash,
    p_unsub_token_hash: a.unsubTokenHash,
    p_consent_version: a.consentVersion,
    p_source_page: a.sourcePage,
    p_ip_hash: a.ipHash,
    p_country: a.country,
    p_name: a.name,
    p_idea_id: a.ideaId,
    p_parent_id: a.parentId,
    p_body: a.body,
  })
  if (error) throw error
  return one<CommentResult>(data)
}

export async function rpcVote(ideaId: string, voterFingerprint: string): Promise<string | null> {
  const c = db()
  if (!c) return null
  const { data, error } = await c.rpc('rpc_vote', {
    p_idea_id: ideaId,
    p_voter_fingerprint: voterFingerprint,
  })
  if (error) throw error
  return one<{ state: string }>(data)?.state ?? null
}

export async function rpcConfirm(confirmTokenHash: string): Promise<{ state: string } | null> {
  const c = db()
  if (!c) return null
  const { data, error } = await c.rpc('rpc_confirm', { p_confirm_token_hash: confirmTokenHash })
  if (error) throw error
  return one<{ state: string; subscriber_id: string | null }>(data)
}

export async function rpcUnsubscribe(unsubTokenHash: string): Promise<{ state: string } | null> {
  const c = db()
  if (!c) return null
  const { data, error } = await c.rpc('rpc_unsubscribe', { p_unsub_token_hash: unsubTokenHash })
  if (error) throw error
  return one<{ state: string }>(data)
}

export async function rpcUnfollow(unfollowTokenHash: string): Promise<{ state: string } | null> {
  const c = db()
  if (!c) return null
  const { data, error } = await c.rpc('rpc_unfollow', { p_unfollow_token_hash: unfollowTokenHash })
  if (error) throw error
  return one<{ state: string }>(data)
}

export async function rpcSuppress(emailHash: string, reason: string): Promise<void> {
  const c = db()
  if (!c) return
  const { error } = await c.rpc('rpc_suppress', { p_email_hash: emailHash, p_reason: reason })
  if (error) throw error
}

export async function rpcRateCheck(
  bucket: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const c = db()
  if (!c) return true // demo mode: no limiter
  const { data, error } = await c.rpc('rpc_rate_check', {
    p_bucket: bucket,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  })
  if (error) {
    // Fail open on limiter infra error — Cloudflare WAF is the primary defense.
    console.error('[ratelimit] rpc error, failing open:', error)
    return true
  }
  return data === true
}

export async function rpcModerateIdea(
  ideaId: string,
  moderation: string | null,
  status: string | null,
  builtProjectSlug: string | null,
): Promise<void> {
  const c = db()
  if (!c) return
  const { error } = await c.rpc('rpc_moderate_idea', {
    p_idea_id: ideaId,
    p_moderation: moderation,
    p_status: status,
    p_built_project_slug: builtProjectSlug,
  })
  if (error) throw error
}

export async function rpcModerateComment(commentId: string, moderation: string): Promise<void> {
  const c = db()
  if (!c) return
  const { error } = await c.rpc('rpc_moderate_comment', {
    p_comment_id: commentId,
    p_moderation: moderation,
  })
  if (error) throw error
}

export async function rpcErase(emailHash: string): Promise<void> {
  const c = db()
  if (!c) return
  const { error } = await c.rpc('rpc_erase_subscriber', { p_email_hash: emailHash })
  if (error) throw error
}

/** A broadcast recipient (server-only; carries PII — the email). */
export type Recipient = { email: string; name: string | null; email_hash: string | null }

/** Live segment recipients at THIS moment: confirmed AND not suppressed AND in-segment. */
export async function rpcSegmentRecipients(segment: string): Promise<Recipient[]> {
  const c = db()
  if (!c) return []
  const { data, error } = await c.rpc('rpc_segment_recipients', { p_segment: segment })
  if (error) throw error
  return (data as Recipient[] | null) ?? []
}

/** Stateless unsubscribe by keyed email-hash (the broadcast unsubscribe-token path). */
export async function rpcUnsubscribeByHash(emailHash: string): Promise<void> {
  const c = db()
  if (!c) return
  const { error } = await c.rpc('rpc_unsubscribe_by_hash', { p_email_hash: emailHash })
  if (error) throw error
}
