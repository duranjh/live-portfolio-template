'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

/**
 * Route-segment error boundary. The visitor sees a generic message + the framework `digest`
 * as a reference id; the real cause is logged server-side keyed by that same digest (lib/log).
 * No stack traces, DB, or framework internals leak. Self-contained (no server imports) so it
 * always renders, even if a shared module is what failed.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[error boundary]', error)
  }, [error])

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-5 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(540px_360px_at_50%_14%,var(--accent-soft),transparent_70%)]"
      />
      <div className="glass animate-glass-in relative z-[1] w-full max-w-[440px] rounded-xl border border-border p-9 text-center shadow-[var(--shadow-pop)]">
        <div
          aria-hidden
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] border border-border bg-subtle text-accent"
        >
          <AlertTriangle className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <h1 className="mt-5 text-[26px] font-semibold tracking-[-0.02em] text-fg">
          Something went wrong
        </h1>
        <p className="mx-auto mt-3 max-w-[34ch] text-[15px] leading-relaxed text-fg-2">
          A hiccup on our end — not you. Try again, and if it keeps happening, the reference below
          helps us track it down.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-[10px] border border-border bg-surface px-5 py-2.5 text-sm font-medium text-fg transition hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Try again
          </button>
          {error.digest && <p className="font-mono text-[11px] text-muted">ref: {error.digest}</p>}
          <Link
            href="/"
            className="rounded-sm text-[14px] font-medium text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Back home
          </Link>
        </div>
      </div>
    </section>
  )
}
