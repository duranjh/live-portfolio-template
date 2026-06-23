'use client'

import { useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { StatusFilter } from './types'

const STATUS_OPTIONS: { value: StatusFilter; label: string; pulse?: boolean }[] = [
  { value: 'all', label: 'All' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'building', label: 'Building', pulse: true },
  { value: 'planned', label: 'Planned' },
]

export function FilterBar({
  status,
  onStatusChange,
  techOptions,
  selectedTech,
  onToggleTech,
  query,
  onQueryChange,
  anyFilter,
  onClearAll,
  entityPlural,
}: {
  status: StatusFilter
  onStatusChange: (s: StatusFilter) => void
  techOptions: string[]
  selectedTech: Set<string>
  onToggleTech: (t: string) => void
  query: string
  onQueryChange: (q: string) => void
  anyFilter: boolean
  onClearAll: () => void
  entityPlural: string
}) {
  const searchWrapRef = useRef<HTMLDivElement>(null)

  // Roving-tabindex arrow-key nav across the status radiogroup.
  function onStatusKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const idx = STATUS_OPTIONS.findIndex((o) => o.value === status)
    let next = idx
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % STATUS_OPTIONS.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
      next = (idx - 1 + STATUS_OPTIONS.length) % STATUS_OPTIONS.length
    else return
    e.preventDefault()
    onStatusChange(STATUS_OPTIONS[next].value)
    e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus()
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: status pills + text search */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="radiogroup"
          aria-label="Filter by status"
          onKeyDown={onStatusKeyDown}
          className="inline-flex rounded-full border border-border bg-subtle p-1"
        >
          {STATUS_OPTIONS.map((o) => {
            const active = status === o.value
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => onStatusChange(o.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
                  active ? 'bg-accent text-accent-ink' : 'text-fg-2 hover:text-fg',
                )}
              >
                {o.pulse && (
                  <span
                    className={cn('h-1.5 w-1.5 rounded-full bg-current', !active && 'pulse-dot')}
                    aria-hidden
                  />
                )}
                {o.label}
              </button>
            )
          })}
        </div>

        <div ref={searchWrapRef} className="relative min-w-[200px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <Input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by name or summary…"
            aria-label={`Search ${entityPlural} by name or summary`}
            className="rounded-full pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                onQueryChange('')
                searchWrapRef.current?.querySelector('input')?.focus()
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:bg-subtle hover:text-fg"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: tech chips + clear (only when there are chips or an active filter) */}
      {(techOptions.length > 0 || anyFilter) && (
        <div className="flex items-center gap-2">
          {techOptions.length > 0 && (
            <>
              <span
                className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
                aria-hidden
              >
                Tech
              </span>
              <div
                role="group"
                aria-label="Filter by tech"
                className="flex flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {techOptions.map((t) => {
                  const selected = selectedTech.has(t)
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onToggleTech(t)}
                      className={cn(
                        'shrink-0 rounded-full border px-3 py-1 font-mono text-[11px] transition-colors',
                        selected
                          ? 'border-[color:var(--accent)] bg-accent-soft font-medium text-fg'
                          : 'border-border bg-surface text-fg-2 hover:text-fg',
                      )}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </>
          )}
          {anyFilter && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1 text-[12px] text-fg-2 transition-colors hover:border-accent hover:text-accent"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
