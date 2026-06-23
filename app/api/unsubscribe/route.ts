import { NextResponse, type NextRequest } from 'next/server'
import { processUnsubscribe } from '@/lib/capture/unsubscribe'
import { captureEnabled } from '@/lib/env'

export const runtime = 'nodejs'

/**
 * RFC 8058 one-click unsubscribe target (mail providers POST here with
 * `List-Unsubscribe=One-Click`). Accepts both the stored confirm-email token and the stateless
 * broadcast token. Always 200, idempotent, neutral.
 */
export async function POST(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token') ?? ''
  if (captureEnabled && token) {
    try {
      await processUnsubscribe(token)
    } catch (e) {
      console.error('[api/unsubscribe] error', e)
    }
  }
  return new NextResponse(null, { status: 200 })
}
