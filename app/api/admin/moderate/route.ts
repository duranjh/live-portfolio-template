import { NextResponse, type NextRequest } from 'next/server'
import { isAdmin, adminConfigured } from '@/lib/admin/access'
import { rpcModerateIdea, rpcModerateComment } from '@/lib/db/rpc'

export const runtime = 'nodejs'

/**
 * Owner-only moderation. Approve/hide/reject an idea or comment, optionally set an
 * idea's status + the built-app credit link. Guarded by Cloudflare Access / ADMIN_SECRET.
 *
 * Body: { kind: 'idea', id, moderation, status?, builtProjectSlug? }
 *     | { kind: 'comment', id, moderation }
 */
export async function POST(req: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: 'admin not configured' }, { status: 503 })
  }
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
  }

  let body: {
    kind?: string
    id?: string
    moderation?: string
    status?: string
    builtProjectSlug?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }

  try {
    if (body.kind === 'idea' && body.id) {
      await rpcModerateIdea(
        body.id,
        body.moderation ?? null,
        body.status ?? null,
        body.builtProjectSlug ?? null,
      )
    } else if (body.kind === 'comment' && body.id && body.moderation) {
      await rpcModerateComment(body.id, body.moderation)
    } else {
      return NextResponse.json({ error: 'bad request' }, { status: 400 })
    }
  } catch (e) {
    console.error('[admin/moderate] error', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
