'use client'

import { useMemo, useRef, useState } from 'react'
import { SearchX } from 'lucide-react'
import { FilterBar } from './filter-bar'
import { SORT_OPTIONS, type ProjectItem, type SortKey, type StatusFilter } from './types'

/** Comparators for each sort option. Unshipped items sort to the bottom of date-shipped sorts. */
const SORTERS: Record<SortKey, (a: ProjectItem, b: ProjectItem) => number> = {
  'created-desc': (a, b) => b.meta.created - a.meta.created,
  'created-asc': (a, b) => a.meta.created - b.meta.created,
  'title-asc': (a, b) => a.meta.title.localeCompare(b.meta.title),
  'title-desc': (a, b) => b.meta.title.localeCompare(a.meta.title),
  'shipped-desc': (a, b) => (b.meta.shipped ?? -Infinity) - (a.meta.shipped ?? -Infinity),
  'shipped-asc': (a, b) => (a.meta.shipped ?? Infinity) - (b.meta.shipped ?? Infinity),
}

/**
 * Client filter island for the Apps grid. Receives pre-rendered ProjectCard nodes +
 * serializable filter metadata from the server page, and filters by index (status +
 * tech + text) + sorts (date/name) without ever touching a non-serializable `Project`.
 * `initialTech` seeds the tech filter from `/projects?tech=…` (tech-pill deep links).
 */
export function ProjectsExplorer({
  items,
  techOptions,
  entityPlural,
  initialTech,
}: {
  items: ProjectItem[]
  techOptions: string[]
  entityPlural: string
  initialTech?: string
}) {
  const [status, setStatus] = useState<StatusFilter>('all')
  const [selectedTech, setSelectedTech] = useState<Set<string>>(() =>
    initialTech && techOptions.includes(initialTech) ? new Set([initialTech]) : new Set(),
  )
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('created-desc')
  const barRef = useRef<HTMLDivElement>(null)

  const noun = entityPlural.toLowerCase()

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matched = items.filter((it) => {
      if (status !== 'all' && it.meta.status !== status) return false
      for (const t of selectedTech) if (!it.meta.tech.includes(t)) return false
      if (q && !it.meta.search.includes(q)) return false
      return true
    })
    return matched.sort(SORTERS[sort])
  }, [items, status, selectedTech, query, sort])

  const anyFilter = status !== 'all' || selectedTech.size > 0 || query.trim() !== ''
  // Re-key the grid on the discrete filters + sort (not the query) so tiles re-stagger on
  // those changes but not on every keystroke.
  const signature = `${status}|${[...selectedTech].sort().join(',')}|${sort}`

  function toggleTech(tech: string) {
    setSelectedTech((prev) => {
      const next = new Set(prev)
      if (next.has(tech)) next.delete(tech)
      else next.add(tech)
      return next
    })
  }

  function clearAll() {
    setStatus('all')
    setSelectedTech(new Set())
    setQuery('')
    // Return focus to the status group after a reset.
    barRef.current?.querySelector<HTMLButtonElement>('[role="radio"]')?.focus()
  }

  return (
    <div>
      <div className="sticky top-14 z-40 px-5">
        <div
          ref={barRef}
          className="glass mx-auto mt-3 max-w-6xl rounded-2xl border border-border px-4 py-3 shadow-[var(--shadow-card)]"
        >
          <FilterBar
            status={status}
            onStatusChange={setStatus}
            techOptions={techOptions}
            selectedTech={selectedTech}
            onToggleTech={toggleTech}
            query={query}
            onQueryChange={setQuery}
            anyFilter={anyFilter}
            onClearAll={clearAll}
            entityPlural={entityPlural}
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-fg-2">
          <span aria-live="polite">
            Showing {visible.length} of {items.length} {noun}
          </span>
          <label className="flex items-center gap-2">
            <span className="text-muted">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label={`Sort ${noun}`}
              className="cursor-pointer rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-fg transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {visible.length > 0 ? (
          <div key={signature} className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((it, i) => (
              <div
                key={it.meta.slug}
                className="animate-fade-up"
                style={{ animationDelay: `${(i % 3) * 80}ms` }}
              >
                {it.node}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
            <SearchX className="h-10 w-10 text-accent" aria-hidden />
            <p className="mt-4 text-lg font-semibold">No {noun} match those filters.</p>
            <p className="mt-2 max-w-md text-sm text-fg-2">
              Try removing a tech tag, switching status, or clearing your search to see everything
              again.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-accent-ink transition hover:brightness-110"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
