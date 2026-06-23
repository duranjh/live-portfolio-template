'use server'

import { after } from 'next/server'
import { cookies } from 'next/headers'
import { honeypotTripped } from '@/lib/security/honeypot'
import { verifyTurnstile } from '@/lib/security/turnstile'
import { rateOk } from '@/lib/security/ratelimit'
import { guideGateSchema } from '@/lib/validation/schemas'
import { getRequestMeta } from '@/lib/request'
import { hmacIp, emailHash } from '@/lib/security/hash'
import { generateToken, hashToken } from '@/lib/security/tokens'
import { rpcUnlockGuide } from '@/lib/db/rpc'
import { sendConfirmation } from '@/lib/email/send'
import { captureEnabled, env } from '@/lib/env'
import { CONSENT_TEXT_VERSION } from '@/lib/constants'
import { UNLOCK_COOKIE, makeUnlockToken, type UnlockScope } from '@/lib/security/unlock'

/**
 * Guide gate — the 1-free-then-verify unlock. Captures name+email, applies the rule
 * server-side (DB-authoritative), sets a SCOPED httpOnly unlock cookie, and reports
 * back whether the guide is unlocked or the visitor must confirm their email first.
 * Demo mode (no DB/keys) simply grants the requested guide. The 350ms floor keeps the
 * security branches timing-uniform.
 */
export type UnlockState = {
  ok: true
  unlocked: boolean
  needsConfirm: boolean
  message: string
}

const FLOOR_MS = 350
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export async function unlockGuide(_prev: unknown, formData: FormData): Promise<UnlockState> {
  const start = Date.now()
  let result: UnlockState
  try {
    result = await run(formData)
  } catch (e) {
    // Never surface internals (DB/cookie throw); log server-side, return neutral.
    console.error('[unlock] error', e)
    result = invalid
  }
  const elapsed = Date.now() - start
  if (elapsed < FLOOR_MS) await sleep(FLOOR_MS - elapsed)
  return result
}

const invalid: UnlockState = {
  ok: true,
  unlocked: false,
  needsConfirm: false,
  message: 'Please check your details and try again.',
}

async function run(formData: FormData): Promise<UnlockState> {
  if (honeypotTripped(formData)) return invalid

  const parsed = guideGateSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    guideSlug: formData.get('guideSlug'),
  })
  if (!parsed.success) return invalid

  // Demo mode: no DB/keys to enforce or sign with → grant the requested guide.
  if (!captureEnabled || !env) {
    return { ok: true, unlocked: true, needsConfirm: false, message: 'Unlocked — enjoy the guide.' }
  }

  const { ip, country } = await getRequestMeta()
  const ipH = hmacIp(ip)
  if (!(await rateOk('unlock', ipH))) {
    return { ok: true, unlocked: false, needsConfirm: false, message: 'Please try again in a moment.' }
  }
  if (!(await verifyTurnstile(formData.get('cf-turnstile-response') as string, ip))) {
    return invalid
  }

  const confirmRaw = generateToken()
  const unsubRaw = generateToken()

  const res = await rpcUnlockGuide({
    name: parsed.data.name,
    email: parsed.data.email,
    emailHash: emailHash(parsed.data.email),
    source: `guide:${parsed.data.guideSlug}`,
    confirmTokenHash: hashToken(confirmRaw),
    unsubTokenHash: hashToken(unsubRaw),
    consentVersion: CONSENT_TEXT_VERSION,
    sourcePage: (formData.get('sourcePage') as string) || null,
    ipHash: ipH,
    country,
    guideSlug: parsed.data.guideSlug,
  })

  // Fire-and-forget confirmation email when a (re)send is due (post-response).
  if (res?.confirm_needed) {
    const confirmUrl = `${env.SITE_URL}/confirm?token=${confirmRaw}`
    const unsubUrl = `${env.SITE_URL}/unsubscribe?token=${unsubRaw}`
    after(async () => {
      try {
        await sendConfirmation(parsed.data.email, confirmUrl, unsubUrl)
      } catch (e) {
        console.error('[unlock] confirmation send failed', e)
      }
    })
  }

  if (res?.unlocked && res.scope) {
    const scope: UnlockScope = res.scope
    const jar = await cookies()
    jar.set(UNLOCK_COOKIE, makeUnlockToken(scope, Date.now()), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 90 * 24 * 60 * 60,
    })
    return { ok: true, unlocked: true, needsConfirm: false, message: 'Unlocked — enjoy the guide.' }
  }

  // Pending visitor tried a 2nd guide → must confirm their email first.
  return {
    ok: true,
    unlocked: false,
    needsConfirm: true,
    message:
      "You've used your free guide. Check your inbox to confirm your email — then every guide unlocks.",
  }
}
