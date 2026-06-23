import type { Project, Experience } from '@/lib/content'

/**
 * Resume view-model builder. Pure, synchronous, server-run — it takes the
 * already-sorted content selectors (`allProjects()` / `allExperience()`) and
 * derives everything the Resume page renders: the 3-way lens view-models, the
 * focus-grouped skill cloud, and the "currently / next up" blocks.
 *
 * Why server-side: the result is plain JSON (strings/numbers/arrays only — no
 * `Date` objects), so it serializes cleanly across the RSC → client-island
 * boundary, and time-derived labels (e.g. "day 12") are computed once on the
 * server to avoid a client/server hydration mismatch.
 *
 * DATA > DESIGN: every field here is derived from real frontmatter the selectors
 * expose. The design export's named skill sub-groups (Languages / Frameworks …)
 * are NOT in the data model, so skills are grouped by the real `focus` enum.
 */

export type View = 'technical' | 'business' | 'general'
export const VIEWS: readonly View[] = ['technical', 'business', 'general'] as const

/** Narrow an unknown `?view=` value to a `View` (server-side validation). */
export function isView(v: string | undefined): v is View {
  return v === 'technical' || v === 'business' || v === 'general'
}

type Focus = Project['focus'] // 'technical' | 'business' | 'both'
type BadgeTone = 'neutral' | 'accent'

/** A normalized timeline row — a project or a job, same shape. */
export type Entry = {
  kind: 'project' | 'experience'
  id: string
  title: string
  /** Second line: your role on a project ("Founder & Maker") or the employer for a job. */
  org: string
  /** Optional location (jobs); shown on the downloadable PDF only. */
  location?: string
  /** "May 2026 – Present" / "Jan 2020 – Dec 2022" / a single month when start === end. */
  dateRange: string
  summary: string
  /** Numeric sort key (ms since epoch); newest first. Never a Date (RSC-safe). */
  sortKey: number
  chips: string[]
  focus: Focus
  /** Status pill — projects only (Building/Shipped); jobs carry no pill. */
  badge?: { text: string; pulse: boolean; tone: BadgeTone }
  /** Internal link for project entries (`/projects/{slug}`); jobs have none. */
  href?: string
}

export type SkillItem = { name: string; count: number }
export type SkillGroup = { label: string; focus: Focus; items: SkillItem[] }

export type ViewModel = {
  skillsHint: string
  lensTag: string
  skillGroups: SkillGroup[]
  spine: Entry[]
  /** Business lens only: projects shown as a "Selected work" tile strip. */
  selectedWork: Project[]
}

export type CurrentlyItem = {
  slug: string
  title: string
  summary: string
  href: string
  /** "day N" since startDate, computed server-side; null when not sensible. */
  dayLabel: string | null
}

export type NextUpItem = { slug: string; title: string; summary: string; href: string }

export type ResumeData = {
  views: Record<View, ViewModel>
  currently: CurrentlyItem[]
  nextUp: NextUpItem[]
  /** Hero "Follow" target: newest building project, else newest project. */
  followTarget: { slug: string; title: string } | null
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** ISO date → "Mon YYYY" (UTC, locale-independent so SSR === client). */
function fmtMonthYear(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** "Mon YYYY – Mon YYYY" range; "– Present" when ongoing; a single month when start === end. */
function fmtRange(startIso: string, endIso: string | null, ongoing: boolean): string {
  const start = fmtMonthYear(startIso)
  if (ongoing) return `${start} – Present`
  if (!endIso) return start
  const end = fmtMonthYear(endIso)
  return end && end !== start ? `${start} – ${end}` : start
}

const byKeyDesc = (a: Entry, b: Entry) => b.sortKey - a.sortKey
const isTechnical = (f: Focus) => f === 'technical' || f === 'both'
const isBusiness = (f: Focus) => f === 'business' || f === 'both'

function projectToEntry(p: Project): Entry {
  // Planned projects are filtered out before this runs, so it's Building or Shipped.
  const badge =
    p.status === 'building'
      ? { text: 'Building', pulse: true, tone: 'accent' as const }
      : { text: 'Shipped', pulse: false, tone: 'accent' as const }
  const when = p.shippedDate ?? p.startDate
  return {
    kind: 'project',
    id: `project:${p.slug}`,
    title: p.title,
    org: p.role ?? 'Founder & Maker',
    dateRange: fmtRange(p.startDate, p.shippedDate ?? null, p.status === 'building'),
    summary: p.summary,
    sortKey: Date.parse(when),
    chips: p.tech,
    focus: p.focus,
    badge,
    href: p.url,
  }
}

function expToEntry(e: Experience): Entry {
  return {
    kind: 'experience',
    id: `experience:${e.company}:${e.role}`,
    title: e.role,
    org: e.company,
    location: e.location,
    dateRange: fmtRange(e.start, e.end ?? null, !e.end),
    summary: e.summary,
    sortKey: Date.parse(e.start),
    chips: e.skills,
    focus: e.focus,
    // Jobs carry no status pill.
  }
}

/** Aggregate skills across projects + experience, bucketed by focus, ×count. */
function aggregateSkills(projects: Project[], experience: Experience[]): SkillGroup[] {
  const acc = new Map<string, { name: string; count: number; foci: Set<Focus> }>()
  const add = (skills: string[], focus: Focus) => {
    for (const raw of skills) {
      const name = raw.trim()
      if (!name) continue
      const key = name.toLowerCase()
      const cur = acc.get(key)
      if (cur) {
        cur.count += 1
        cur.foci.add(focus)
      } else {
        acc.set(key, { name, count: 1, foci: new Set([focus]) })
      }
    }
  }
  for (const p of projects) add(p.skills, p.focus)
  for (const e of experience) add(e.skills, e.focus)

  const eng: SkillItem[] = []
  const ops: SkillItem[] = []
  const cross: SkillItem[] = []
  for (const a of acc.values()) {
    const item: SkillItem = { name: a.name, count: a.count }
    // Cross-cutting = touches more than one focus, or comes from a `both` item.
    if (a.foci.size > 1 || a.foci.has('both')) cross.push(item)
    else if (a.foci.has('technical')) eng.push(item)
    else ops.push(item)
  }
  const sortItems = (arr: SkillItem[]) =>
    arr.sort((x, y) => y.count - x.count || x.name.localeCompare(y.name))

  const groups: SkillGroup[] = []
  if (eng.length) groups.push({ label: 'Engineering', focus: 'technical', items: sortItems(eng) })
  if (ops.length) groups.push({ label: 'Operating', focus: 'business', items: sortItems(ops) })
  if (cross.length) groups.push({ label: 'Cross-cutting', focus: 'both', items: sortItems(cross) })
  return groups
}

function groupsForView(all: SkillGroup[], view: View): SkillGroup[] {
  if (view === 'general') return all
  if (view === 'technical') return all.filter((g) => isTechnical(g.focus))
  return all.filter((g) => isBusiness(g.focus))
}

function dayLabelFor(startDate: string): string | null {
  const start = Date.parse(startDate)
  if (Number.isNaN(start)) return null
  const days = Math.floor((Date.now() - start) / 86_400_000)
  return days >= 0 ? `day ${days + 1}` : null
}

const LENS: Record<View, { skillsHint: string; lensTag: string }> = {
  technical: { skillsHint: 'technical groups', lensTag: 'the technical lens' },
  business: { skillsHint: 'business & ops groups', lensTag: 'the business lens' },
  general: { skillsHint: 'a trimmed mix', lensTag: 'a balanced view' },
}

/**
 * Build the full resume view-model. `projects` / `experience` are expected to be
 * the selector outputs (already sorted newest-first / by `order`). Demo-safe:
 * empty inputs yield empty groups, spines, and currently/nextUp lists.
 */
export function buildResumeData(projects: Project[], experience: Experience[]): ResumeData {
  // Planned projects don't belong on a resume — only Building + Shipped do.
  const resumeProjects = projects.filter((p) => p.status !== 'planned')
  const projectEntries = resumeProjects.map(projectToEntry)
  const expEntries = experience.map(expToEntry)
  const allSkillGroups = aggregateSkills(projects, experience)

  const technicalSpine = [...projectEntries, ...expEntries.filter((e) => isTechnical(e.focus))].sort(
    byKeyDesc,
  )
  const businessSpine = expEntries.filter((e) => isBusiness(e.focus)).sort(byKeyDesc)

  const topProjects = [...projectEntries].sort(byKeyDesc).slice(0, 3)
  const topExperience = [...expEntries].sort(byKeyDesc).slice(0, 3)
  const generalSpine = [...topProjects, ...topExperience].sort(byKeyDesc)

  const spineFor: Record<View, Entry[]> = {
    technical: technicalSpine,
    business: businessSpine,
    general: generalSpine,
  }

  const views = {} as Record<View, ViewModel>
  for (const view of VIEWS) {
    views[view] = {
      skillsHint: LENS[view].skillsHint,
      lensTag: LENS[view].lensTag,
      skillGroups: groupsForView(allSkillGroups, view),
      spine: spineFor[view],
      selectedWork: view === 'business' ? resumeProjects : [],
    }
  }

  const currently: CurrentlyItem[] = projects
    .filter((p) => p.status === 'building')
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      href: p.url,
      dayLabel: dayLabelFor(p.startDate),
    }))

  const nextUp: NextUpItem[] = projects
    .filter((p) => p.status === 'planned')
    .map((p) => ({ slug: p.slug, title: p.title, summary: p.summary, href: p.url }))

  // `projects` is newest-first, so `find(building)` is the newest in-progress one;
  // fall back to the newest project overall so the capture CTA is always present.
  const followSource = projects.find((p) => p.status === 'building') ?? projects[0]
  const followTarget = followSource
    ? { slug: followSource.slug, title: followSource.title }
    : null

  return { views, currently, nextUp, followTarget }
}
