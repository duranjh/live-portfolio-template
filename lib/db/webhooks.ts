import 'server-only'
import { db } from './client'

/**
 * Webhook idempotency: insert the Svix message id; a unique-violation means we've
 * already processed this delivery (at-least-once safety). Returns true if new.
 */
export async function markWebhookSeen(svixId: string, type: string): Promise<boolean> {
  const c = db()
  if (!c) return true
  const { error } = await c.from('webhook_events').insert({ svix_id: svixId, type })
  if (error) {
    if ((error as { code?: string }).code === '23505') return false // already seen
    throw error
  }
  return true
}
