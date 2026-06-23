'use client'

import { Fragment, useMemo, useState, type ReactNode } from 'react'
import { Lightbulb, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { SubmitIdea } from './submit-idea'
import { SORT_OPTIONS, STATUS_FILTERS, type SortKey, type StatusFilter } from './util'

/** Serializable, client-safe metadata the explorer uses to search/sort/filter a card. */
export type IdeaItemMeta = {
  id: string
  /** Lowercased `title + body`, for case-insensitive text search. */
  search: string
  votes: number
  comments: number
  /** epoch ms of created_at. */
  created: number
  status: string
}

/** A pre-rendered IdeaCard (server) + its filter metadata — no PII / no `body` re-derivation. */
export type IdeaItem = { meta: IdeaItemMeta; node: ReactNode }

const SORTERS: Record<SortKey, (a: IdeaItem, b: IdeaItem) => number> = {
  top: (a, b) => b.meta.votes - a.meta.votes || b.meta.created - a.meta.created,
  new: (a, b) => b.meta.created - a.meta.created,
  old: (a, b) => a.meta.created - b.meta.created,
  discussed: (a, b) => b.meta.comments - a.meta.comments || b.meta.votes - a.meta.votes,
}

/**
 * Client island for the idea board — instant text search + sort (votes/new/old/discussed) +
 * status filter over server-rendered IdeaCards, with no `Idea` ever crossing the client boundary.
 */
export function IdeasExplorer({ items }: { items: IdeaItem[] }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('top')
  const [status, setStatus] = useState<StatusFilter>('all')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matched = items.filter((it) => {
      if (status !== 'all' && it.meta.status !== status) return false
      if (q && !it.meta.search.includes(q)) return false
      return true
    })
    return matched.sort(SORTERS[sort])
  }, [items, query, sort, status])

  const anyFilter = status !== 'all' || query.trim() !== ''
  const signature = `${status}|${sort}`

  return (
    <div>
      <div className="sticky top-14 z-40 px-5">
        <div className="glass mx-auto mt-3 flex max-w-6xl flex-wrap items-center gap-3 rounded-2xl border border-border px-4 py-3 shadow-[var(--shadow-card)]">
          <div
            role="group"
            aria-label="Filter by status"
            className="inline-flex rounded-full border border-border bg-subtle p-0.5"
          >
            {STATUS_FILTERS.map((o) => {
              const active = o.value === status
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStatus(o.value)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                    active ? 'bg-accent text-accent-ink' : 'text-fg-2 hover:text-fg',
                  )}
                >
                  {o.label}
                </button>
              )
            })}
          </div>

          <div className="relative min-w-[180px] flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ideas…"
              aria-label="Search ideas"
              className="rounded-full pl-9 pr-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:bg-subtle hover:text-fg"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 font-mono text-xs">
            <span className="text-muted">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort ideas"
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
      </div>

      <section className="mx-auto max-w-6xl px-5 pt-6">
        <p className="mb-4 font-mono text-xs text-fg-2" aria-live="polite">
          Showing {visible.length} of {items.length} {items.length === 1 ? 'idea' : 'ideas'}
        </p>

        {visible.length > 0 ? (
          <ul key={signature} className="flex flex-col gap-3.5">
            {visible.map((it) => (
              <Fragment key={it.meta.id}>{it.node}</Fragment>
            ))}
          </ul>
        ) : (
          <div className="mx-auto max-w-lg rounded-[18px] border border-dashed border-border bg-surface px-7 py-14 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border bg-accent-soft text-accent">
              <Lightbulb className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.01em] text-fg">
              {anyFilter ? 'No ideas match your search.' : 'No ideas yet — be the first.'}
            </h2>
            <p className="mx-auto mt-2 max-w-[38ch] text-sm leading-relaxed text-fg-2">
              {anyFilter
                ? 'Try a different search or filter, or suggest something new.'
                : "Got something you wish existed? Suggest it. If it gets traction, I'll build it in the open and credit you."}
            </p>
            <div className="mt-6 flex justify-center">
              <SubmitIdea />
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
