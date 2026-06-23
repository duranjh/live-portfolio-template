'use client'

import { useActionState, useRef, useState } from 'react'
import { ChevronUp } from 'lucide-react'
import { voteIdea } from '@/app/actions/ideas'
import { cn } from '@/lib/utils'

/**
 * Frictionless upvote. `voteIdea` returns only a neutral `{ok,message}` (no new count, no
 * failure signal — anti-enumeration by design), so the +1 is optimistic + client-only; the
 * server fingerprint-throttles the real dedupe. One vote per mount in the UI.
 */
export function VoteButton({ ideaId, voteCount }: { ideaId: string; voteCount: number }) {
  const [, formAction, pending] = useActionState(voteIdea, null)
  const [voted, setVoted] = useState(false)
  const [count, setCount] = useState(voteCount)
  const [pop, setPop] = useState(false)
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function onSubmit() {
    if (voted) return
    setVoted(true)
    setCount((c) => c + 1)
    // CSS-transition pop, guarded for reduced motion (the global media query also collapses it).
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPop(true)
      if (popTimer.current) clearTimeout(popTimer.current)
      popTimer.current = setTimeout(() => setPop(false), 220)
    }
  }

  return (
    <form action={formAction} onSubmit={onSubmit} className="flex-none">
      <input type="hidden" name="ideaId" value={ideaId} />
      {/* Honeypot — must stay empty (matches server HONEYPOT_FIELD). */}
      <input
        type="text"
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <button
        type="submit"
        disabled={pending || voted}
        aria-pressed={voted}
        aria-label="Upvote this idea"
        className={cn(
          'flex w-14 flex-col items-center gap-0.5 rounded-md border py-2.5',
          'transition-[background-color,border-color,transform] duration-150',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
          'enabled:hover:border-accent disabled:cursor-default',
          voted ? 'border-accent bg-accent text-accent-ink' : 'border-border bg-subtle text-fg-2',
          pop && 'scale-110',
        )}
      >
        <ChevronUp className="h-4 w-4" aria-hidden="true" />
        <span className="font-mono text-[15px] font-semibold leading-none" aria-live="polite">
          {count}
        </span>
      </button>
    </form>
  )
}
