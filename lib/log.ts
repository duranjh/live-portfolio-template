import 'server-only'
import { randomBytes } from 'node:crypto'

/**
 * Error reference IDs. Visitors see only a short ref + a generic message; the full
 * detail is logged here, server-side, keyed by the same ref. A reported ref is looked
 * up in the logs (or the optional error-monitoring dashboard) to find the real cause.
 * Never log raw emails/IPs/tokens — callers pass already-masked context.
 */

export function newRef(): string {
  return randomBytes(4).toString('hex')
}

export function logError(ref: string, context: string, err: unknown): void {
  console.error(`[err ${ref}] ${context}:`, err)
}
