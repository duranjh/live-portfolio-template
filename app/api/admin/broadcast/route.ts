import { NextResponse, type NextRequest } from 'next/server'
import { isAdmin, adminConfigured } from '@/lib/admin/access'
import { rpcSegmentRecipients } from '@/lib/db/rpc'
import { sendBroadcast } from '@/lib/email/send'
import { makeUnsubToken } from '@/lib/security/unsub'
import { broadcastSchema } from '@/lib/validation/schemas'
import { captureEnabled, env } from '@/lib/env'

export const runtime = 'nodejs'

/** Mask an email for the dry-run preview: `m***@example.com`. */
function mask(email: string): string {
  return email.replace(/^(.).*(@.*)$/, '$1***$2')
}

/**
 * Owner-only segment broadcast. Guarded by Cloudflare Access / ADMIN_SECRET.
 *
 * Body: { segment: 'newsletter' | '*' | 'follow:<slug>', subject, body, confirm? }
 *
 * DRY-RUN by default (`confirm` absent/false): returns the live recipient count + a masked
 * sample, sends nothing. Re-POST with `confirm: true` to actually send. Recipients are resolved
 * at THIS moment via `rpc_segment_recipients` (confirmed AND not suppressed AND in-segment), so a
 * mid-window unsubscribe is honored. Each email carries a stateless one-click unsubscribe link.
 */
export async function POST(req: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: 'admin not configured' }, { status: 503 })
  }
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
  const parsed = broadcastSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid', issues: parsed.error.flatten() }, { status: 400 })
  }
  const { segment, subject, body, confirm } = parsed.data

  if (!captureEnabled || !env) {
    return NextResponse.json({ mode: 'demo', sent: 0, note: 'capture disabled — nothing sent' })
  }

  let recipients: { email: string; name: string | null; email_hash: string | null }[]
  try {
    recipients = await rpcSegmentRecipients(segment)
  } catch (e) {
    console.error('[admin/broadcast] recipients error', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }

  // Dry-run (default): report who WOULD receive it; send nothing.
  if (!confirm) {
    return NextResponse.json({
      mode: 'dry-run',
      segment,
      subject,
      recipientCount: recipients.length,
      sample: recipients.slice(0, 3).map((r) => mask(r.email)),
      note: 'Re-POST with { "confirm": true } to send.',
    })
  }

  // Confirmed send. Sequential + error-isolated (one bad address never aborts the batch); each
  // recipient gets a stateless one-click unsubscribe. (For large lists, swap in a throttled
  // batch send to respect the provider's rate limit — the demo never reaches this path.)
  let sent = 0
  let failed = 0
  const now = Date.now()
  for (const r of recipients) {
    if (!r.email_hash) {
      failed++
      continue
    }
    const unsubUrl = `${env.SITE_URL}/unsubscribe?token=${makeUnsubToken(r.email_hash, now)}`
    try {
      await sendBroadcast(r.email, subject, body, unsubUrl)
      sent++
    } catch (e) {
      console.error('[admin/broadcast] send failed', e)
      failed++
    }
  }
  return NextResponse.json({ mode: 'sent', segment, subject, sent, failed })
}
