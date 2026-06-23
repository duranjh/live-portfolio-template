'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Project } from '@/lib/content'
import { MediaTile } from './media-tile'

type Item = Project['gallery'][number]
type Phase = 'build' | 'live'

const PHASE_LABEL: Record<Phase, string> = { build: 'Build progress', live: 'Live demo' }
const MIX_BASE: Record<Phase, number> = { build: 50, live: 48 }
const MIX_STEP: Record<Phase, number> = { build: 8, live: 7 }

function mixFor(phase: Phase, i: number) {
  return Math.max(20, MIX_BASE[phase] - i * MIX_STEP[phase])
}

/**
 * Phased media gallery (build vs live) with an accessible frosted lightbox.
 * Mounted only when there are items (the empty state is server-rendered). Thumbs
 * are real buttons; the lightbox traps focus, supports Esc/arrow keys, locks
 * scroll, and restores focus to the triggering thumb on close.
 */
export function ProjectGallery({ gallery }: { gallery: Project['gallery'] }) {
  const groups: Record<Phase, Item[]> = {
    build: gallery.filter((g) => g.phase === 'build'),
    live: gallery.filter((g) => g.phase === 'live'),
  }
  const [active, setActive] = useState<{ phase: Phase; index: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const open = (phase: Phase, index: number, el: HTMLButtonElement) => {
    triggerRef.current = el
    setActive({ phase, index })
  }
  const close = useCallback(() => {
    setActive(null)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }, [])

  return (
    <div className="mt-5">
      {(['build', 'live'] as Phase[]).map((phase) =>
        groups[phase].length === 0 ? null : (
          <div key={phase} className="mt-6 first:mt-0">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-accent">
              {PHASE_LABEL[phase]}
            </p>
            <ul className="grid grid-cols-2 gap-3.5 lg:grid-cols-3">
              {groups[phase].map((item, i) => (
                <li key={`${phase}-${i}`}>
                  <button
                    type="button"
                    onClick={(e) => open(phase, i, e.currentTarget)}
                    aria-label={
                      item.type === 'video'
                        ? `Play video${item.caption ? `: ${item.caption}` : ''}`
                        : `Open ${item.caption ?? 'media'}`
                    }
                    className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[13px] border border-border transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_26px_50px_-28px_rgba(0,0,0,0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <MediaTile
                      src={item.src}
                      type={item.type}
                      alt={item.caption ?? ''}
                      label={item.caption}
                      mix={mixFor(phase, i)}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ),
      )}

      {active && (
        <Lightbox
          phase={active.phase}
          items={groups[active.phase]}
          index={active.index}
          onIndex={(index) => setActive({ phase: active.phase, index })}
          onClose={close}
        />
      )}
    </div>
  )
}

function Lightbox({
  phase,
  items,
  index,
  onIndex,
  onClose,
}: {
  phase: Phase
  items: Item[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const item = items[index]
  const many = items.length > 1

  const go = useCallback(
    (d: number) => onIndex((index + d + items.length) % items.length),
    [index, items.length, onIndex],
  )

  // Scroll lock + focus the close button on open.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  // Keyboard: Esc closes, arrows navigate, Tab is trapped within the dialog.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowLeft' && many) {
        e.preventDefault()
        go(-1)
      } else if (e.key === 'ArrowRight' && many) {
        e.preventDefault()
        go(1)
      } else if (e.key === 'Tab') {
        // Include video + links + tabbables, not just buttons: a single-video gallery has
        // only the close button plus a focusable <video controls>, so a button-only query
        // would let Tab fall through past the video and escape the modal (aria-modal break).
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), video, [tabindex]:not([tabindex="-1"])',
        )
        if (!focusables || focusables.length === 0) return
        const list = Array.from(focusables)
        const first = list[0]
        const last = list[list.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [go, many, onClose])

  return (
    <div
      className="glass animate-glass-in fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Media viewer"
        className="relative w-full max-w-[880px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-fg-2">
            {PHASE_LABEL[phase]} · {index + 1} / {items.length}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close media viewer"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-fg transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border shadow-[0_50px_120px_-40px_rgba(0,0,0,0.8)]">
          {item.type === 'video' && item.src ? (
            <video
              src={item.src}
              controls
              aria-label={item.caption || 'Project video'}
              className="absolute inset-0 h-full w-full bg-black object-contain"
            />
          ) : (
            <MediaTile
              src={item.src}
              type={item.type}
              alt={item.caption ?? ''}
              mix={52}
              sizes="(max-width: 880px) 100vw, 880px"
            />
          )}

          {many && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous"
                className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/80 text-fg backdrop-blur transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next"
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/80 text-fg backdrop-blur transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {item.caption && (
          <p className="mt-3 text-center text-[13px] text-fg-2">{item.caption}</p>
        )}
      </div>
    </div>
  )
}
