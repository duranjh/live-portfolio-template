import { type NextRequest } from 'next/server'
import { Webhook } from 'svix'
import { captureEnabled, requireCaptureEnv } from '@/lib/env'
import { markWebhookSeen } from '@/lib/db/webhooks'
import { rpcSuppress } from '@/lib/db/rpc'
import { emailHash } from '@/lib/security/hash'
import { normalizeEmail } from '@/lib/validation/schemas'

export const runtime = 'nodejs'

// Suppress only on hard signals; soft bounces (email.delivery_delayed) are ignored.
const SUPPRESS_TYPES = new Set(['email.bounced', 'email.complained'])

type ResendEvent = { type: string; data?: { to?: string[] | string } }

export async function POST(req: NextRequest) {
  if (!captureEnabled) return new Response('ok', { status: 200 })

  // Raw body is required: Svix verifies the exact bytes.
  const raw = await req.text()
  const headers = {
    'svix-id': req.headers.get('svix-id') ?? '',
    'svix-timestamp': req.headers.get('svix-timestamp') ?? '',
    'svix-signature': req.headers.get('svix-signature') ?? '',
  }

  let evt: ResendEvent
  try {
    const wh = new Webhook(requireCaptureEnv().RESEND_WEBHOOK_SECRET)
    evt = wh.verify(raw, headers) as ResendEvent
  } catch {
    return new Response('invalid signature', { status: 400 })
  }

  // Dedupe at-least-once delivery.
  if (headers['svix-id']) {
    const fresh = await markWebhookSeen(headers['svix-id'], evt.type)
    if (!fresh) return new Response('ok', { status: 200 })
  }

  if (SUPPRESS_TYPES.has(evt.type)) {
    const to = evt.data?.to
    const recipients = Array.isArray(to) ? to : to ? [to] : []
    for (const addr of recipients) {
      try {
        await rpcSuppress(emailHash(normalizeEmail(addr)), evt.type)
      } catch (e) {
        console.error('[webhook] suppress failed', e)
      }
    }
  }

  return new Response('ok', { status: 200 })
}
