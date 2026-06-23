import 'server-only'
import { rpcRateCheck } from '@/lib/db/rpc'

/**
 * App-level fixed-window rate limit, keyed by the hashed IP, as a fallback under the
 * Cloudflare WAF rule. Returns true when the request is allowed. Fails open on infra
 * error (Cloudflare is the primary defense). No-op (allowed) in demo mode.
 */
export async function rateOk(
  action: string,
  ipHash: string,
  limit = 5,
  windowSeconds = 60,
): Promise<boolean> {
  return rpcRateCheck(`${action}:${ipHash}`, limit, windowSeconds)
}
