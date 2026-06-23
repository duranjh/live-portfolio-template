'use client'

import { useActionState, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Loader2, Plus } from 'lucide-react'
import { subscribe, rememberedFollow } from '@/app/actions/subscribe'
import { Input } from '@/components/ui/input'
import { Turnstile } from '@/components/capture/turnstile'

const POPOVER_WIDTH = 264
const AUTO_CLOSE_MS = 5000

/**
 * "Follow this app" — button → popover wired to the real `subscribe` action with the project
 * slug (an interest signal). When this browser is already "remembered" (the readable `lp_known`
 * flag, set after any prior verified signup), the popover skips the form and offers a one-click
 * follow via `rememberedFollow` (the server reads the signed identity cookie — no email re-entry,
 * and following never subscribes you to the newsletter). The popover renders in a portal on
 * `document.body` (solid surface, above every section) and dismisses on outside click, Escape, and
 * ~5s of inactivity. Demo-safe.
 */
export function FollowButton({
  projectSlug,
  projectTitle,
  direction = 'down',
}: {
  projectSlug: string
  projectTitle: string
  /** Which way the popover opens — `'up'` for buttons low in the viewport (e.g. grid tiles). */
  direction?: 'up' | 'down'
}) {
  const [open, setOpen] = useState(false)
  const [known, setKnown] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const [state, formAction, pending] = useActionState(subscribe, null)
  const [oneClickState, oneClickAction, oneClickPending] = useActionState(rememberedFollow, null)

  const btnRef = useRef<HTMLButtonElement | null>(null)
  const popRef = useRef<HTMLDivElement | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const succeeded = state?.ok || oneClickState?.ok

  const close = useCallback(() => {
    setOpen(false)
    setCoords(null)
  }, [])

  // Re-read the remembered flag every time the popover opens (so a follow elsewhere this
  // session flips later buttons to one-click). Reading a cookie in a handler is not an effect.
  const openPopover = useCallback(() => {
    setKnown(
      typeof document !== 'undefined' &&
        document.cookie.split('; ').some((c) => c.startsWith('lp_known=')),
    )
    setOpen(true)
  }, [])

  const place = useCallback(() => {
    const b = btnRef.current
    if (!b) return
    const r = b.getBoundingClientRect()
    setCoords({
      top: direction === 'up' ? r.top - 8 : r.bottom + 8,
      left: Math.max(8, r.right - POPOVER_WIDTH),
    })
  }, [direction])

  // Position after open (rAF, not synchronously) and keep glued to the trigger on scroll/resize.
  useEffect(() => {
    if (!open) return
    let raf = requestAnimationFrame(place)
    const onMove = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(place)
    }
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [open, place])

  // Dismiss on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node
      if (popRef.current?.contains(t) || btnRef.current?.contains(t)) return
      close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  // Auto-close ~5s after the pointer/focus last leaves the popover (cancelled while engaged).
  const cancelClose = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])
  const armClose = useCallback(() => {
    cancelClose()
    timer.current = setTimeout(close, AUTO_CLOSE_MS)
  }, [cancelClose, close])
  useEffect(() => {
    if (open) armClose()
    return cancelClose
  }, [open, armClose, cancelClose])

  const body = succeeded ? (
    <p className="flex items-center gap-2 text-[13px] font-medium text-accent" role="status">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-ink">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      Following {projectTitle}
    </p>
  ) : known ? (
    <form action={oneClickAction} className="flex flex-col gap-2">
      <p className="text-[13px] font-semibold">Follow {projectTitle}?</p>
      <p className="text-[12px] text-fg-2">You&apos;re signed in — one click to follow. No spam.</p>
      <input type="hidden" name="projectSlug" value={projectSlug} />
      <button
        type="submit"
        disabled={oneClickPending}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-[9px] bg-accent px-3 py-2.5 text-[13px] font-medium text-accent-ink transition hover:brightness-110 disabled:opacity-70"
      >
        {oneClickPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Follow app'}
      </button>
    </form>
  ) : (
    <form action={formAction} className="flex flex-col gap-2">
      <p className="text-[13px] font-semibold">Follow {projectTitle}</p>
      <p className="text-[12px] text-fg-2">Get an email on every release.</p>
      <input type="hidden" name="projectSlug" value={projectSlug} />
      <input type="hidden" name="source" value={`follow:${projectSlug}`} />
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
        <input type="checkbox" required className="mt-0.5 h-[14px] w-[14px] accent-[var(--accent)]" />
        <span>Email me about this app. Unsubscribe anytime.</span>
      </label>
      <Turnstile className="text-[10px] text-muted" />
      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-[9px] bg-accent px-3 py-2.5 text-[13px] font-medium text-accent-ink transition hover:brightness-110 disabled:opacity-70"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Follow app'}
      </button>
    </form>
  )

  const popover =
    open && coords ? (
      <div
        ref={popRef}
        role="dialog"
        aria-label={`Follow ${projectTitle}`}
        onMouseEnter={cancelClose}
        onMouseLeave={armClose}
        onFocusCapture={cancelClose}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) armClose()
        }}
        style={{
          position: 'fixed',
          top: coords.top,
          left: coords.left,
          width: POPOVER_WIDTH,
          transform: direction === 'up' ? 'translateY(-100%)' : undefined,
        }}
        className="animate-glass-in z-[1000] rounded-[13px] border border-border bg-raised p-4 shadow-[var(--shadow-pop)]"
      >
        {body}
      </div>
    ) : null

  return (
    <div className="inline-block">
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? close() : openPopover())}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-1.5 rounded-[9px] bg-accent px-3.5 py-2 text-[13px] font-medium text-accent-ink transition hover:brightness-110"
      >
        <Plus className="h-3.5 w-3.5" /> Follow
      </button>
      {popover ? createPortal(popover, document.body) : null}
    </div>
  )
}
