import 'server-only'
import { headers } from 'next/headers'

/**
 * Per-request client metadata, read from Cloudflare-injected headers (the site is
 * fronted by Cloudflare). `cf-connecting-ip` is the real client IP; we hash it before
 * storage and never persist the raw value.
 */
export async function getRequestMeta(): Promise<{
  ip: string
  country: string | null
  ua: string
}> {
  const h = await headers()
  const ip =
    h.get('cf-connecting-ip') ??
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '0.0.0.0'
  const country = h.get('cf-ipcountry')
  const ua = h.get('user-agent') ?? ''
  return { ip, country: country && country !== 'XX' ? country : null, ua }
}
