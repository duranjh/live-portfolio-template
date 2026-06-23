import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { captureEnabled, env } from '@/lib/env'

/**
 * The ONLY place the Supabase service-role key is read. Lazy singleton. Returns
 * `null` in demo mode (no env) so callers degrade gracefully instead of crashing.
 * The service-role key bypasses RLS by design and must never reach the client — this
 * module is server-only and is never imported by a Client Component.
 */
let cached: SupabaseClient | null | undefined

export function db(): SupabaseClient | null {
  if (cached !== undefined) return cached
  if (!captureEnabled || !env) {
    cached = null
    return cached
  }
  cached = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}
