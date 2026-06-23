'use client'

import { useActionState, useId } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { commentIdea } from '@/app/actions/ideas'
import { Turnstile } from '@/components/capture/turnstile'
import { Input } from '@/components/ui/input'

const fieldCls =
  'w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm text-fg ' +
  'placeholder:text-muted transition-[border-color,box-shadow] focus-visible:border-accent ' +
  'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--accent-soft)]'

/**
 * Top-level comment form (email-gated, double opt-in). The server swallows every failure
 * into the same neutral `{ok}` (anti-enumeration), so client-side `required`/`type=email`
 * is the only feedback a real user gets. Ids are namespaced via `useId` because many of
 * these render on one page (one per expanded card).
 */
export function CommentForm({ ideaId }: { ideaId: string }) {
  const [state, formAction, pending] = useActionState(commentIdea, null)
  const uid = useId()
  const nameId = `${uid}-name`
  const emailId = `${uid}-email`
  const bodyId = `${uid}-body`

  if (state?.ok) {
    return (
      <p className="flex items-center gap-2 text-[13px] font-medium text-accent" role="status">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-ink">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
        {state.message}
      </p>
    )
  }

  return (
    <form action={formAction} className="rounded-[12px] border border-border bg-surface p-3.5">
      <p className="mb-2.5 text-xs font-semibold text-fg">Add a comment</p>
      <input type="hidden" name="ideaId" value={ideaId} />
      <input type="hidden" name="sourcePage" value="/ideas" />
      {/* Honeypot — must stay empty (matches server HONEYPOT_FIELD). */}
      <input
        type="text"
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <div className="flex flex-wrap gap-2">
        <div className="min-w-[110px] flex-1">
          <label htmlFor={nameId} className="sr-only">
            Your name
          </label>
          <Input id={nameId} name="name" required placeholder="Name" autoComplete="name" />
        </div>
        <div className="min-w-[110px] flex-1">
          <label htmlFor={emailId} className="sr-only">
            Email (kept private)
          </label>
          <Input
            id={emailId}
            name="email"
            type="email"
            required
            pattern="[^@\s]+@[^@\s]+\.[^@\s]{2,}"
            title="Enter a valid email, e.g. name@example.com"
            placeholder="Email (kept private)"
            autoComplete="email"
          />
        </div>
      </div>
      <label htmlFor={bodyId} className="sr-only">
        Comment
      </label>
      <textarea
        id={bodyId}
        name="body"
        required
        minLength={1}
        rows={2}
        placeholder="Add to the discussion…"
        className={`${fieldCls} mt-2 resize-y`}
      />
      <Turnstile className="mt-2.5 text-[11px] text-muted" />
      <div className="mt-2.5 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-[9px] bg-accent px-4 py-2 text-[13px] font-medium text-accent-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Post comment'}
        </button>
      </div>
    </form>
  )
}
