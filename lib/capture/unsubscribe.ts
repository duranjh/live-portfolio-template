import 'server-only'
import { hashToken } from '@/lib/security/tokens'
import { verifyUnsubToken } from '@/lib/security/unsub'
import { rpcUnsubscribe, rpcUnsubscribeByHash } from '@/lib/db/rpc'

/**
 * Unsubscribe via EITHER token type, so the same endpoints serve both email flows:
 *  • `u1.…`  → stateless broadcast token: verify HMAC + expiry, unsubscribe by email-hash.
 *  • otherwise → stored confirm/welcome token: hash it, match `unsubscribe_token_hash`.
 * Always idempotent + neutral; callers guard on `captureEnabled`.
 */
export async function processUnsubscribe(token: string): Promise<void> {
  if (!token) return
  if (token.startsWith('u1.')) {
    const hash = verifyUnsubToken(token, Date.now())
    if (hash) await rpcUnsubscribeByHash(hash)
    return
  }
  await rpcUnsubscribe(hashToken(token))
}
