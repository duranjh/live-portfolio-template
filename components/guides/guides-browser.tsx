'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { GuideCard } from './guide-card'

/** Trimmed guide shape passed to the client — no `body`, so the gated MDX never
 *  ships in the index bundle. The server page derives this from the selectors. */
export type GuideCardData = {
  title: string
  slug: string
  summary: string
  url: string
  cover?: string
  category?: string
  tier: 'free' | 'premium'
}

type Tab = 'all' | 'free' | 'premium'
const TABS: { value: Tab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'premium', label: 'Premium' },
]

type Sort = 'default' | 'az' | 'za'
const SORTS: { value: Sort; label: string }[] = [
  { value: 'default', label: 'Featured' },
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
]

/**
 * Interactive guide index — All|Free|Premium tier toggle (All = default), instant text
 * search, sort (featured order / A→Z / Z→A), and a category filter derived from the guides
 * themselves. Cards remount on the discrete filters (keyed grid) so the stagger replays;
 * the query is excluded from the key so it doesn't re-animate per keystroke. Demo-safe.
 */
export function GuidesBrowser({ free, premium }: { free: GuideCardData[]; premium: GuideCardData[] }) {
  const [tab, setTab] = useState<Tab>('all')
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('default')

  const tierList = tab === 'free' ? free : tab === 'premium' ? premium : [...free, ...premium]
  const categories = useMemo(
    () => Array.from(new Set(tierList.map((g) => g.category).filter((c): c is string => Boolean(c)))),
    [tierList],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = tierList.filter((g) => {
      if (category !== 'all' && g.category !== category) return false
      if (q && !`${g.title} ${g.summary}`.toLowerCase().includes(q)) return false
      return true
    })
    if (sort === 'az') return [...list].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'za') return [...list].sort((a, b) => b.title.localeCompare(a.title))
    return list
  }, [tierList, category, query, sort])

  const hasFilter = query.trim() !== '' || category !== 'all'

  function selectTab(next: Tab) {
    setTab(next)
    setCategory('all')
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label="Guide tier"
          className="inline-flex rounded-full border border-border bg-surface p-1"
        >
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={tab === t.value}
              onClick={() => selectTab(t.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors',
                tab === t.value ? 'bg-accent text-accent-ink' : 'text-fg-2 hover:text-fg',
              )}
            >
              {t.label}
            </button>
          ))}
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
            placeholder="Search guides…"
            aria-label="Search guides"
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
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Sort guides"
            className="cursor-pointer rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-fg transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {SORTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {categories.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {['all', ...categories].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full border px-3 py-1 text-[12px] font-medium transition-colors',
                category === c
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-border text-fg-2 hover:text-fg',
              )}
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div key={`${tab}:${category}:${sort}`} className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((g, i) => (
            <GuideCard key={g.slug} guide={g} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState tab={tab} hasFilter={hasFilter} />
      )}
    </div>
  )
}

function EmptyState({ tab, hasFilter }: { tab: Tab; hasFilter: boolean }) {
  const premiumSoon = tab === 'premium' && !hasFilter
  return (
    <div className="mt-6 rounded-lg border border-dashed border-border bg-surface p-10 text-center">
      <p className="text-sm text-fg-2">
        {premiumSoon
          ? 'Premium guides are coming soon.'
          : hasFilter
            ? 'No guides match your search.'
            : 'No guides published yet. Check back soon.'}
      </p>
      {premiumSoon && (
        <Link
          href="/guides/premium"
          className="mt-3 inline-block text-[13px] font-medium text-accent hover:underline"
        >
          Join the waitlist →
        </Link>
      )}
    </div>
  )
}
