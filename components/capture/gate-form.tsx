'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Mail } from 'lucide-react'
import { unlockGuide } from '@/app/actions/unlock'
import { Input } from '@/components/ui/input'
import { Turnstile } from '@/components/capture/turnstile'

/**
 * Guide gate form. On unlock the action sets the scoped cookie; we `router.refresh()`
 * so the server re-renders the page WITH the cookie and reveals the gated MDX (the body
 * is never in the client until then). If the visitor has used their one free guide, the
 * action returns `needsConfirm` and we show the "confirm your email" notice instead.
 */
export function GateForm({ guideSlug }: { guideSlug: string }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(unlockGuide, null)
  const refreshed = useRef(false)

  useEffect(() => {
    if (state?.unlocked && !refreshed.current) {
      refreshed.current = true
      router.refresh()
    }
  }, [state?.unlocked, router])

  if (state?.needsConfirm) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <p className="text-sm text-fg-2">{state.message}</p>
      </div>
    )
  }

  if (state?.unlocked) {
    return (
      <p className="flex items-center gap-2 text-sm text-fg-2" role="status">
        <Loader2 className="h-4 w-4 animate-spin" /> Unlocking… if the guide doesn’t appear, reload the page.
      </p>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-2.5">
      <input type="hidden" name="guideSlug" value={guideSlug} />
      <input
        type="text"
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <Input name="name" required placeholder="Your name" autoComplete="name" aria-label="Your name" />
      <Input
        name="email"
        type="email"
        required
        pattern="[^@\s]+@[^@\s]+\.[^@\s]{2,}"
        title="Enter a valid email, e.g. name@example.com"
        placeholder="you@email.com"
        autoComplete="email"
        aria-label="Email address"
      />
      <label className="flex items-start gap-2 text-[11px] leading-relaxed text-fg-2">
        <input type="checkbox" required className="mt-0.5 h-[15px] w-[15px] accent-[var(--accent)]" />
        <span>Send me the guide and occasional maker notes. Unsubscribe anytime.</span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-accent px-4 py-3 text-sm font-medium text-accent-ink transition hover:brightness-110 disabled:opacity-70"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            <Lock className="h-3.5 w-3.5" /> Unlock the guide
          </>
        )}
      </button>
      <Turnstile />
    </form>
  )
}
