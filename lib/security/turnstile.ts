import 'server-only'
import { captureEnabled, requireCaptureEnv } from '@/lib/env'

/**
 * Server-side Cloudflare Turnstile verification. The client widget alone protects
 * nothing — the token MUST be verified here. In demo mode (no secrets) verification is
 * skipped. When capture is enabled the secret is guaranteed present (env validation),
 * so a missing token simply fails closed.
 */
export async function verifyTurnstile(
  token: string | null,
  ip: string | null,
): Promise<boolean> {
  if (!captureEnabled) return true // demo mode
  if (!token) return false
  const secret = requireCaptureEnv().TURNSTILE_SECRET_KEY

  const form = new URLSearchParams()
  form.set('secret', secret)
  form.set('response', token)
  if (ip) form.set('remoteip', ip)

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    })
    if (!res.ok) return false
    const data = (await res.json()) as { success: boolean }
    return data.success === true
  } catch {
    return false // fail closed
  }
}
