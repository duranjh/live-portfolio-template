'use client'

import { useActionState, useEffect, useId, useRef, useState } from 'react'
import { CheckCircle2, Loader2, Plus, X } from 'lucide-react'
import { submitIdea } from '@/app/actions/ideas'
import { Turnstile } from '@/components/capture/turnstile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const fieldCls =
  'w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm text-fg ' +
  'placeholder:text-muted transition-[border-color,box-shadow] focus-visible:border-accent ' +
  'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--accent-soft)]'

/**
 * "Suggest an idea" trigger + modal. Uses the native `<dialog>` element (`showModal()`),
 * which gives focus trapping, Esc-to-close, top-layer stacking (above the sticky header),
 * and focus restoration for free. The form lives in a keyed child so re-opening after a
 * successful submit always starts fresh.
 */
export function SubmitIdea({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [renderKey, setRenderKey] = useState(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descId = useId()

  function openModal() {
    setRenderKey((k) => k + 1)
    setOpen(true)
  }
  function closeModal() {
    setOpen(false)
  }

  // Open/close the native dialog + lock background scroll while open.
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    if (open && !dlg.open) {
      dlg.showModal()
      const prev = document.documentElement.style.overflow
      document.documentElement.style.overflow = 'hidden'
      return () => {
        document.documentElement.style.overflow = prev
      }
    }
    if (!open && dlg.open) dlg.close()
  }, [open])

  // Esc / native close → keep React state in sync.
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    const onClose = () => setOpen(false)
    dlg.addEventListener('close', onClose)
    return () => dlg.removeEventListener('close', onClose)
  }, [])

  return (
    <>
      <Button onClick={openModal} className={className}>
        <Plus className="h-4 w-4" aria-hidden="true" /> Suggest an idea
      </Button>

      <dialog
        ref={dialogRef}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeModal()
        }}
        className="m-auto w-[min(520px,calc(100vw-2rem))] max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-[18px] border border-border bg-raised p-0 text-fg backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="animate-glass-in p-6">
          <SubmitIdeaForm key={renderKey} titleId={titleId} descId={descId} onClose={closeModal} />
        </div>
      </dialog>
    </>
  )
}

function SubmitIdeaForm({
  titleId,
  descId,
  onClose,
}: {
  titleId: string
  descId: string
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState(submitIdea, null)
  const uid = useId()
  const nameId = `${uid}-name`
  const emailId = `${uid}-email`
  const titleFieldId = `${uid}-title`
  const bodyId = `${uid}-body`

  if (state?.ok) {
    return (
      <div className="py-4 text-center" role="status">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-border bg-accent-soft text-accent">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 id={titleId} className="mt-4 text-lg font-semibold tracking-[-0.01em] text-fg">
          Idea received — pending moderation
        </h2>
        <p id={descId} className="mx-auto mt-2 max-w-[40ch] text-sm leading-relaxed text-fg-2">
          {state.message}
        </p>
        <div className="mt-5 flex justify-center">
          <Button onClick={onClose}>Back to board</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h2 id={titleId} className="text-lg font-semibold tracking-[-0.01em] text-fg">
          Suggest an idea
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-surface text-fg-2 transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p id={descId} className="mt-1 text-[13px] leading-relaxed text-fg-2">
        Tell me what you wish existed. The community votes; the top ideas get built in public.
      </p>

      <form action={formAction} className="mt-4 flex flex-col gap-2.5">
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
          <div className="min-w-[130px] flex-1">
            <label htmlFor={nameId} className="sr-only">
              Your name
            </label>
            <Input id={nameId} name="name" required placeholder="Your name" autoComplete="name" />
          </div>
          <div className="min-w-[130px] flex-1">
            <label htmlFor={emailId} className="sr-only">
              Email address
            </label>
            <Input
              id={emailId}
              name="email"
              type="email"
              required
              pattern="[^@\s]+@[^@\s]+\.[^@\s]{2,}"
              title="Enter a valid email, e.g. name@example.com"
              placeholder="Email"
              autoComplete="email"
            />
          </div>
        </div>

        <label htmlFor={titleFieldId} className="sr-only">
          Idea title
        </label>
        <Input id={titleFieldId} name="title" required minLength={3} placeholder="Idea title" />

        <label htmlFor={bodyId} className="sr-only">
          Idea details
        </label>
        <textarea
          id={bodyId}
          name="body"
          required
          minLength={10}
          rows={4}
          placeholder="Idea details — what is it, and why does it need to exist?"
          className={`${fieldCls} resize-y`}
        />

        <label className="flex items-start gap-2 text-[12px] leading-relaxed text-fg-2">
          <input
            type="checkbox"
            name="ossConsent"
            required
            aria-required="true"
            className="mt-0.5 h-[15px] w-[15px] accent-[var(--accent)]"
          />
          <span>
            I&apos;m OK with this idea being built in the open and credited to me.{' '}
            <span className="text-muted">(required)</span>
          </span>
        </label>

        <Turnstile className="text-[11px] text-muted" />

        <button
          type="submit"
          disabled={pending}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-[10px] bg-accent px-4 py-3 text-sm font-medium text-accent-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : 'Submit idea'}
        </button>
      </form>
    </>
  )
}
