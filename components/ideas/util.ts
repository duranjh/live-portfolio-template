/**
 * Shared helpers for the Ideas board. Server-safe: no `'use client'` / `'use server'`,
 * and no runtime imports from server-only modules (types only), so this can be pulled
 * into both the server card shell and the client comment thread.
 */

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Absolute date with a fixed locale + UTC → identical output on server and client (no hydration drift). */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : dateFmt.format(d)
}

/** The idea lifecycle, mirroring the DB `idea_status` enum (migration 0002). The board
 *  reads `idea.status` straight from the sanitized `public_ideas` view (no client derivation). */
export type IdeaStatus = 'open' | 'accepted' | 'building' | 'shipped' | 'declined'

/** Badge presentation per status. `tone` maps to the shared <Badge> tones; `pulse` adds a live dot. */
export const STATUS_META: Record<
  IdeaStatus,
  { label: string; tone: 'neutral' | 'accent'; pulse?: boolean }
> = {
  open: { label: 'Open', tone: 'neutral' },
  accepted: { label: 'Accepted', tone: 'accent' },
  building: { label: 'Building', tone: 'accent', pulse: true },
  shipped: { label: 'Shipped', tone: 'accent' },
  declined: { label: 'Declined', tone: 'neutral' },
}

/** Sort + status filter option sets (single source of truth for the controls + page guards). */
export const SORT_OPTIONS = [
  { value: 'top', label: 'Most voted' },
  { value: 'new', label: 'Newest' },
  { value: 'old', label: 'Oldest' },
  { value: 'discussed', label: 'Most discussed' },
] as const
export type SortKey = (typeof SORT_OPTIONS)[number]['value']

export const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'building', label: 'Building' },
  { value: 'shipped', label: 'Shipped' },
] as const
export type StatusFilter = (typeof STATUS_FILTERS)[number]['value']
