import 'server-only'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { adminSecret } from '@/lib/env'
import { safeEqual } from '@/lib/security/tokens'

/**
 * Admin authorization without an auth system of our own. Two accepted paths:
 *   1. Human: a Cloudflare Access JWT (`Cf-Access-Jwt-Assertion`) verified against
 *      Cloudflare's JWKS — Cloudflare runs the login; we just verify the signed
 *      assertion (defense-in-depth, so a direct-to-Vercel hit can't bypass the edge).
 *   2. Machine/cron: `Authorization: Bearer <ADMIN_SECRET>` (constant-time compared).
 * No passwords, no sessions, no accounts.
 */

const teamDomain = process.env.CF_ACCESS_TEAM_DOMAIN // e.g. myteam.cloudflareaccess.com
const aud = process.env.CF_ACCESS_AUD

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null
function getJwks() {
  if (!teamDomain) return null
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`))
  }
  return jwks
}

/** True if admin protection is configured at all (otherwise routes return 503). */
export function adminConfigured(): boolean {
  return Boolean(adminSecret) || Boolean(teamDomain && aud)
}

export async function isAdmin(req: Request): Promise<boolean> {
  // Machine/cron path
  const auth = req.headers.get('authorization')
  if (adminSecret && auth?.startsWith('Bearer ') && safeEqual(auth.slice(7), adminSecret)) {
    return true
  }
  // Human path (Cloudflare Access)
  const cfJwt = req.headers.get('cf-access-jwt-assertion')
  const set = getJwks()
  if (cfJwt && set && aud && teamDomain) {
    try {
      await jwtVerify(cfJwt, set, { issuer: `https://${teamDomain}`, audience: aud })
      return true
    } catch {
      /* fall through to deny */
    }
  }
  return false
}
