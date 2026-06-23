import type { ReactNode } from 'react'
import type { Project } from '@/lib/content'

/** Single-select status filter (plus the "all" pass-through). */
export type StatusFilter = 'all' | Project['status']

/** Serializable, client-safe metadata the filter island uses to match a card. */
export type CardFilterMeta = {
  slug: string
  status: Project['status']
  tech: string[]
  title: string
  /** epoch ms of startDate (date created) — for sorting. */
  created: number
  /** epoch ms of shippedDate, or null if not yet shipped — for sorting. */
  shipped: number | null
  /** Lowercased `title + summary`, for case-insensitive text search. */
  search: string
}

/** Sort options for the Apps grid (single source of truth for the control + sorter map). */
export const SORT_OPTIONS = [
  { value: 'created-desc', label: 'Newest first' },
  { value: 'created-asc', label: 'Oldest first' },
  { value: 'title-asc', label: 'Name: A → Z' },
  { value: 'title-desc', label: 'Name: Z → A' },
  { value: 'shipped-desc', label: 'Recently shipped' },
  { value: 'shipped-asc', label: 'Shipped: oldest' },
] as const
export type SortKey = (typeof SORT_OPTIONS)[number]['value']

/**
 * A pre-rendered ProjectCard (server) paired with its filter metadata. The page
 * renders the card on the server and hands the element + meta to the client island,
 * so no non-serializable `Project` (MDX `body`) crosses the client boundary.
 */
export type ProjectItem = {
  meta: CardFilterMeta
  node: ReactNode
}

export type StatusCounts = Record<Project['status'], number>
