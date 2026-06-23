import 'server-only'

/**
 * Neutral-result wrapper for every public capture action.
 *
 * Anti-enumeration: every branch — validation failure, honeypot trip, rate
 * limit, Turnstile failure, suppressed/confirmed/unsubscribed, or demo mode —
 * converges on ONE identical success shape behind a uniform minimum response
 * time, so an attacker can't distinguish "new email" from "already exists" by
 * the body or the timing. Email sending happens fire-and-forget *inside* `fn`
 * (never awaited), so send-vs-no-send is not a timing oracle either.
 */

export type CaptureResult = { ok: true; message: string }

const FLOOR_MS = 350

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export async function withNeutralResult(
  fn: () => Promise<void>,
  message: string,
): Promise<CaptureResult> {
  const start = Date.now()
  try {
    await fn()
  } catch (err) {
    // Never surface internals to the caller; log server-side only.
    console.error('[capture] suppressed error:', err)
  }
  const elapsed = Date.now() - start
  if (elapsed < FLOOR_MS) await sleep(FLOOR_MS - elapsed)
  return { ok: true, message }
}
