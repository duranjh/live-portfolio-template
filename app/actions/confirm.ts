'use server'

import { redirect } from 'next/navigation'
import { hashToken } from '@/lib/security/tokens'
import { rpcConfirm, rpcUnfollow } from '@/lib/db/rpc'
import { processUnsubscribe } from '@/lib/capture/unsubscribe'
import { captureEnabled } from '@/lib/env'

/**
 * Confirm / unsubscribe run as POST (the email links open a GET interstitial that POSTs
 * here), so email-scanner prefetch can't auto-trigger them. Each redirects to a neutral,
 * idempotent status page. `redirect()` throws by design — never wrap it in try/catch.
 */

export async function confirmAction(formData: FormData): Promise<void> {
  const token = (formData.get('token') as string) || ''
  let ok = false
  if (captureEnabled) {
    try {
      const r = await rpcConfirm(hashToken(token))
      ok = r?.state === 'confirmed'
    } catch (e) {
      console.error('[confirm] error', e)
    }
  } else {
    ok = true // demo mode
  }
  redirect(ok ? '/confirmed' : '/link-invalid')
}

export async function unsubscribeAction(formData: FormData): Promise<void> {
  const token = (formData.get('token') as string) || ''
  if (captureEnabled) {
    try {
      await processUnsubscribe(token)
    } catch (e) {
      console.error('[unsubscribe] error', e)
    }
  }
  redirect('/unsubscribed') // neutral + idempotent
}

export async function unfollowAction(formData: FormData): Promise<void> {
  const token = (formData.get('token') as string) || ''
  if (captureEnabled) {
    try {
      await rpcUnfollow(hashToken(token))
    } catch (e) {
      console.error('[unfollow] error', e)
    }
  }
  redirect('/unsubscribed')
}
