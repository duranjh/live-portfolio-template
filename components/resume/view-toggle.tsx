'use client'

import { useRef, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { VIEWS, type View } from './resume-data'

const LABELS: Record<View, string> = {
  technical: 'Technical',
  business: 'Business',
  general: 'General',
}

/**
 * The locked 3-way lens. A `radiogroup` (you're picking a filter, not switching
 * tab panels): single tab stop on the active option, Arrow keys move + activate,
 * matching native radio-group behavior for AA keyboard nav.
 */
export function ViewToggle({ value, onSelect }: { value: View; onSelect: (v: View) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const dir = e.key === 'ArrowRight' ? 1 : -1
    const next = (index + dir + VIEWS.length) % VIEWS.length
    onSelect(VIEWS[next])
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label="Resume view"
      className="inline-flex rounded-full border border-border bg-subtle p-1"
    >
      {VIEWS.map((v, i) => {
        const active = v === value
        return (
          <button
            key={v}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(v)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'cursor-pointer rounded-full px-4 py-2 text-[13px] font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              active ? 'bg-accent text-accent-ink' : 'text-fg-2 hover:text-fg',
            )}
          >
            {LABELS[v]}
          </button>
        )
      })}
    </div>
  )
}
