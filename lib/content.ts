import { projects, guides, posts, legal, experience } from '#site/content'
import type { Project, Guide, Post, Legal, Experience } from '#site/content'

/**
 * Static content selectors over the Velite collections (`#site/content`).
 *
 * These are PURE, SYNCHRONOUS reads of build-time MDX data — no I/O — so Server
 * Components call them directly (no `await`). This is deliberately separate from
 * `lib/db/reads.ts` (the `server-only` async Supabase reads): content is public and
 * static, the database holds user data. `draft` items are excluded in production.
 */

const isProd = process.env.NODE_ENV === 'production'

/** Descending compare for ISO date strings (lexicographic works for ISO-8601). */
function byDateDesc(a: string, b: string): number {
  return a < b ? 1 : a > b ? -1 : 0
}

// ---- Projects (the portfolio) ----

/** Non-draft (in prod) projects, newest shipped/started first. */
export function allProjects(): Project[] {
  return projects
    .filter((p) => !isProd || !p.draft)
    .slice()
    .sort((a, b) => byDateDesc(a.shippedDate ?? a.startDate, b.shippedDate ?? b.startDate))
}

export function featuredProjects(): Project[] {
  return allProjects().filter((p) => p.featured)
}

/** `null` for a missing slug — and for a draft slug in production (→ `notFound()`). */
export function getProjectBySlug(slug: string): Project | null {
  const p = projects.find((x) => x.slug === slug)
  if (!p) return null
  if (isProd && p.draft) return null
  return p
}

// ---- Guides (lead-magnet) ----

export function allGuides(): Guide[] {
  return guides.slice().sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export function freeGuides(): Guide[] {
  return allGuides().filter((g) => g.tier === 'free')
}

export function premiumGuides(): Guide[] {
  return allGuides().filter((g) => g.tier === 'premium')
}

export function getGuideBySlug(slug: string): Guide | null {
  return guides.find((g) => g.slug === slug) ?? null
}

// ---- Experience (resume timeline) ----

/** Resume jobs, by explicit `order` then newest first. */
export function allExperience(): Experience[] {
  return experience.slice().sort((a, b) => a.order - b.order || byDateDesc(a.start, b.start))
}

// ---- Posts (optional blog) ----

export function allPosts(): Post[] {
  return posts
    .filter((p) => !isProd || !p.draft)
    .slice()
    .sort((a, b) => byDateDesc(a.date, b.date))
}

export function getPostBySlug(slug: string): Post | null {
  const p = posts.find((x) => x.slug === slug)
  if (!p) return null
  if (isProd && p.draft) return null
  return p
}

// ---- Legal ----

export function getLegalBySlug(slug: string): Legal | null {
  return legal.find((l) => l.slug === slug) ?? null
}

export type { Project, Guide, Post, Legal, Experience }
