'use server'

import { after } from 'next/server'
import { withNeutralResult, type CaptureResult } from '@/lib/security/neutral'
import { honeypotTripped } from '@/lib/security/honeypot'
import { verifyTurnstile } from '@/lib/security/turnstile'
import { rateOk } from '@/lib/security/ratelimit'
import { subscribeSchema } from '@/lib/validation/schemas'
import { getRequestMeta } from '@/lib/request'
import { hmacIp, emailHash } from '@/lib/security/hash'
import { generateToken, hashToken } from '@/lib/security/tokens'
import { rpcSubscribe } from '@/lib/db/rpc'
import { sendConfirmation } from '@/lib/email/send'
import { captureEnabled, env } from '@/lib/env'
import { CONSENT_TEXT_VERSION, MESSAGES } from '@/lib/constants'
import { cookies } from 'next/headers'
import {
  IDENTITY_COOKIE,
  KNOWN_FLAG_COOKIE,
  IDENTITY_MAX_AGE,
  makeIdentityToken,
  readIdentityToken,
} from '@/lib/security/identity'

const secureCookie = process.env.NODE_ENV === 'production'

/** Readable, non-PII UI hint ('1') — drives the one-click UI; gates NOTHING server-side. */
async function setKnownFlag() {
  ;(await cookies()).set(KNOWN_FLAG_COOKIE, '1', {
    httpOnly: false,
    secure: secureCookie,
    sameSite: 'lax',
    path: '/',
    maxAge: IDENTITY_MAX_AGE,
  })
}

/**
 * Remember this VERIFIED browser so a later follow is one-click ("verify once, reused
 * everywhere"). Called ONLY after Turnstile + rate-limit pass, so the signed httpOnly identity
 * cookie is genuine proof of human verification — exactly what `rememberedFollow` relies on.
 * Also sets the readable `lp_known` UI hint.
 */
async function rememberIdentity(email: string) {
  const store = await cookies()
  store.set(IDENTITY_COOKIE, makeIdentityToken(email, Date.now()), {
    httpOnly: true,
    secure: secureCookie,
    sameSite: 'lax',
    path: '/',
    maxAge: IDENTITY_MAX_AGE,
  })
  store.set(KNOWN_FLAG_COOKIE, '1', {
    httpOnly: false,
    secure: secureCookie,
    sameSite: 'lax',
    path: '/',
    maxAge: IDENTITY_MAX_AGE,
  })
}

/**
 * Newsletter signup AND per-app "follow" (one unified action — a `projectSlug` field
 * makes it a follow). Always returns the same neutral result. The confirmation email is
 * sent post-response via `after()` so send-vs-no-send is never a timing oracle and the
 * work isn't cut off when the response returns.
 */
export async function subscribe(
  _prev: unknown,
  formData: FormData,
): Promise<CaptureResult> {
  return withNeutralResult(async () => {
    if (honeypotTripped(formData)) return

    const parsed = subscribeSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      projectSlug: formData.get('projectSlug') || undefined,
      source: formData.get('source') || undefined,
    })
    if (!parsed.success) return

    if (!captureEnabled || !env) {
      // Demo mode: set only the cosmetic flag (gates nothing) so the one-click UX is demoable.
      await setKnownFlag()
      return
    }

    const { ip, country } = await getRequestMeta()
    const ipH = hmacIp(ip)
    if (!(await rateOk('subscribe', ipH))) return
    if (!(await verifyTurnstile(formData.get('cf-turnstile-response') as string, ip))) return

    // Turnstile + rate-limit passed → a verified human. Remember this browser NOW (signed
    // identity cookie + flag) so the next follow is one-click. Minting only here is what makes
    // the cookie genuine proof of verification (a bogus-Turnstile submit gets nothing).
    await rememberIdentity(parsed.data.email)

    const confirmRaw = generateToken()
    const unsubRaw = generateToken()
    const { projectSlug } = parsed.data

    const result = await rpcSubscribe({
      name: parsed.data.name,
      email: parsed.data.email,
      emailHash: emailHash(parsed.data.email),
      source: parsed.data.source ?? (projectSlug ? `follow:${projectSlug}` : 'newsletter'),
      confirmTokenHash: hashToken(confirmRaw),
      unsubTokenHash: hashToken(unsubRaw),
      consentVersion: CONSENT_TEXT_VERSION,
      sourcePage: (formData.get('sourcePage') as string) || null,
      ipHash: ipH,
      country,
      projectSlug: projectSlug ?? null,
    })

    if (result?.confirm_needed) {
      const confirmUrl = `${env.SITE_URL}/confirm?token=${confirmRaw}`
      const unsubUrl = `${env.SITE_URL}/unsubscribe?token=${unsubRaw}`
      after(async () => {
        try {
          await sendConfirmation(parsed.data.email, confirmUrl, unsubUrl)
        } catch (e) {
          console.error('[subscribe] confirmation send failed', e)
        }
      })
    }
  }, MESSAGES.subscribe)
}

/**
 * One-click follow for a remembered browser — no email re-entry. Reads the signed identity
 * cookie (the proof of a prior verification) and records the interest for that email via the
 * idempotent subscribe RPC. Following records ONLY an app interest, never a newsletter
 * subscription. Returns the same neutral result; demo-mode is a cosmetic no-op.
 */
export async function rememberedFollow(_prev: unknown, formData: FormData): Promise<CaptureResult> {
  return withNeutralResult(async () => {
    const slug = String(formData.get('projectSlug') || '').trim()
    if (!slug || slug.length > 120) return
    if (!captureEnabled || !env) return // demo mode: cosmetic success (no identity to read)

    const email = readIdentityToken((await cookies()).get(IDENTITY_COOKIE)?.value, Date.now())
    if (!email) return // cleared cookie / new device → the client shows the full form instead

    const { ip, country } = await getRequestMeta()
    const ipH = hmacIp(ip)
    if (!(await rateOk('subscribe', ipH))) return

    // The signed identity cookie IS the proof of prior human verification → no Turnstile.
    // `name: ''` is coalesced server-side (a real stored name is never overwritten by blank).
    await rpcSubscribe({
      name: '',
      email,
      emailHash: emailHash(email),
      source: `follow:${slug}`,
      confirmTokenHash: hashToken(generateToken()),
      unsubTokenHash: hashToken(generateToken()),
      consentVersion: CONSENT_TEXT_VERSION,
      sourcePage: null,
      ipHash: ipH,
      country,
      projectSlug: slug,
    })
  }, MESSAGES.subscribe)
}
