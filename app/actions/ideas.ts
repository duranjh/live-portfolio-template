'use server'

import { after } from 'next/server'
import { withNeutralResult, type CaptureResult } from '@/lib/security/neutral'
import { honeypotTripped } from '@/lib/security/honeypot'
import { verifyTurnstile } from '@/lib/security/turnstile'
import { rateOk } from '@/lib/security/ratelimit'
import { ideaSchema, commentSchema, voteSchema } from '@/lib/validation/schemas'
import { getRequestMeta } from '@/lib/request'
import { hmacIp, emailHash, voterFingerprint } from '@/lib/security/hash'
import { generateToken, hashToken } from '@/lib/security/tokens'
import { rpcSubmitIdea, rpcComment, rpcVote, type EnsureArgs } from '@/lib/db/rpc'
import { sendConfirmation, sendOwnerIdeaNotification } from '@/lib/email/send'
import { captureEnabled, env } from '@/lib/env'
import { CONSENT_TEXT_VERSION, MESSAGES } from '@/lib/constants'

/** Build the shared verify-once args + the raw confirm token (for the email link). */
async function ensureArgs(
  email: string,
  name: string,
  source: string,
  sourcePage: string | null,
): Promise<{ args: EnsureArgs; confirmRaw: string; unsubRaw: string; ipHash: string; ip: string }> {
  const { ip, country } = await getRequestMeta()
  const ipH = hmacIp(ip)
  const confirmRaw = generateToken()
  const unsubRaw = generateToken()
  return {
    ip,
    ipHash: ipH,
    confirmRaw,
    unsubRaw,
    args: {
      name,
      email,
      emailHash: emailHash(email),
      source,
      confirmTokenHash: hashToken(confirmRaw),
      unsubTokenHash: hashToken(unsubRaw),
      consentVersion: CONSENT_TEXT_VERSION,
      sourcePage,
      ipHash: ipH,
      country,
    },
  }
}

function queueConfirmation(email: string, confirmRaw: string, unsubRaw: string): void {
  if (!env) return
  const confirmUrl = `${env.SITE_URL}/confirm?token=${confirmRaw}`
  const unsubUrl = `${env.SITE_URL}/unsubscribe?token=${unsubRaw}`
  after(async () => {
    try {
      await sendConfirmation(email, confirmUrl, unsubUrl)
    } catch (e) {
      console.error('[ideas] confirmation send failed', e)
    }
  })
}

/** Submit an idea (email-gated; double opt-in). Owner is pinged post-response. */
export async function submitIdea(
  _prev: unknown,
  formData: FormData,
): Promise<CaptureResult> {
  return withNeutralResult(async () => {
    if (honeypotTripped(formData)) return
    const parsed = ideaSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      title: formData.get('title'),
      body: formData.get('body'),
      ossConsent:
        formData.get('ossConsent') === 'on' || formData.get('ossConsent') === 'true',
    })
    if (!parsed.success) return
    if (!captureEnabled || !env) return

    const { args, confirmRaw, unsubRaw, ipHash, ip } = await ensureArgs(
      parsed.data.email,
      parsed.data.name,
      'idea',
      (formData.get('sourcePage') as string) || null,
    )
    if (!(await rateOk('idea', ipHash, 5, 300))) return
    if (!(await verifyTurnstile(formData.get('cf-turnstile-response') as string, ip))) return

    const result = await rpcSubmitIdea({
      ...args,
      title: parsed.data.title,
      body: parsed.data.body,
      ossConsent: parsed.data.ossConsent,
    })

    if (result?.confirm_needed) queueConfirmation(parsed.data.email, confirmRaw, unsubRaw)
    if (result?.idea_id) {
      const { title, body } = parsed.data
      after(async () => {
        try {
          await sendOwnerIdeaNotification(title, body)
        } catch (e) {
          console.error('[ideas] owner notify failed', e)
        }
      })
    }
  }, MESSAGES.idea)
}

/** Comment on an idea (email-gated; double opt-in). */
export async function commentIdea(
  _prev: unknown,
  formData: FormData,
): Promise<CaptureResult> {
  return withNeutralResult(async () => {
    if (honeypotTripped(formData)) return
    const parsed = commentSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      ideaId: formData.get('ideaId'),
      parentId: formData.get('parentId') || undefined,
      body: formData.get('body'),
    })
    if (!parsed.success) return
    if (!captureEnabled || !env) return

    const { args, confirmRaw, unsubRaw, ipHash, ip } = await ensureArgs(
      parsed.data.email,
      parsed.data.name,
      'comment',
      (formData.get('sourcePage') as string) || null,
    )
    if (!(await rateOk('comment', ipHash, 10, 300))) return
    if (!(await verifyTurnstile(formData.get('cf-turnstile-response') as string, ip))) return

    const result = await rpcComment({
      ...args,
      ideaId: parsed.data.ideaId,
      parentId: parsed.data.parentId ?? null,
      body: parsed.data.body,
    })
    if (result?.confirm_needed) queueConfirmation(parsed.data.email, confirmRaw, unsubRaw)
  }, MESSAGES.comment)
}

/** Upvote — frictionless: fingerprint-throttled, no email, no Turnstile. */
export async function voteIdea(
  _prev: unknown,
  formData: FormData,
): Promise<CaptureResult> {
  return withNeutralResult(async () => {
    if (honeypotTripped(formData)) return
    const parsed = voteSchema.safeParse({ ideaId: formData.get('ideaId') })
    if (!parsed.success) return
    if (!captureEnabled) return

    const { ip, ua } = await getRequestMeta()
    const ipH = hmacIp(ip)
    if (!(await rateOk('vote', ipH, 30, 60))) return
    await rpcVote(parsed.data.ideaId, voterFingerprint(ip, ua))
  }, MESSAGES.vote)
}
