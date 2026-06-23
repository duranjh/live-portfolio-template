'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { subscribe } from '@/app/actions/subscribe'
import { Turnstile } from '@/components/capture/turnstile'

const inputCls =
  'w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm text-fg ' +
  'placeholder:text-muted transition-[border-color,box-shadow] focus-visible:border-accent ' +
  'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--accent-soft)]'

/**
 * Newsletter / capture form, wired to the real `subscribe` Server Action.
 * Collects name + email + consent. Works in demo mode (neutral success, nothing
 * persisted). Honeypot + the Turnstile token field match the server contract.
 */
export function NewsletterForm({
  source = 'newsletter',
  redirectTo,
  redirectDelayMs = 3500,
}: {
  source?: string
  /** When set, navigate here a few seconds after a successful submit (e.g. premium → /guides). */
  redirectTo?: string
  redirectDelayMs?: number
}) {
  const [state, formAction, pending] = useActionState(subscribe, null)
  const router = useRouter()

  // Optional auto-return after success — a navigation side effect, not state.
  useEffect(() => {
    if (!state?.ok || !redirectTo) return
    const t = setTimeout(() => router.push(redirectTo), redirectDelayMs)
    return () => clearTimeout(t)
  }, [state?.ok, redirectTo, redirectDelayMs, router])

  if (state?.ok) {
    return (
      <p className="flex items-center gap-2 text-[13px] font-medium text-accent" role="status">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-ink">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
        <span>
          {state.message}
          {redirectTo && <span className="text-fg-2"> Taking you back…</span>}
        </span>
      </p>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-2.5">
      <input type="hidden" name="source" value={source} />
      {/* Honeypot — must match HONEYPOT_FIELD ('company_url'); hidden from humans. */}
      <input
        type="text"
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <label className="sr-only" htmlFor={`nl-name-${source}`}>
        Your name
      </label>
      <input
        id={`nl-name-${source}`}
        name="name"
        required
        placeholder="Your name"
        autoComplete="name"
        className={inputCls}
      />
      <label className="sr-only" htmlFor={`nl-email-${source}`}>
        Email address
      </label>
      <input
        id={`nl-email-${source}`}
        name="email"
        type="email"
        required
        pattern="[^@\s]+@[^@\s]+\.[^@\s]{2,}"
        title="Enter a valid email, e.g. name@example.com"
        placeholder="you@email.com"
        autoComplete="email"
        className={inputCls}
      />
      <label className="flex items-start gap-2 text-[11px] leading-relaxed text-fg-2">
        <input
          type="checkbox"
          required
          className="mt-0.5 h-[15px] w-[15px] accent-[var(--accent)]"
        />
        <span>Send me an email when something ships. Unsubscribe anytime.</span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-accent px-4 py-3 text-sm font-medium text-accent-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Subscribing…
          </>
        ) : (
          'Subscribe'
        )}
      </button>
      <Turnstile />
    </form>
  )
}
