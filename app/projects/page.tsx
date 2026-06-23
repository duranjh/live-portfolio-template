import type { Metadata } from 'next'
import { site } from '@/config/site'
import { allProjects } from '@/lib/content'
import { cn } from '@/lib/utils'
import { ProjectCard } from '@/components/projects/card'
import { FollowButton } from '@/components/capture/follow-button'
import { ProjectsExplorer } from '@/components/projects/grid/projects-explorer'
import type { CardFilterMeta, ProjectItem, StatusCounts } from '@/components/projects/grid/types'

export const metadata: Metadata = { title: site.entityLabel.plural }

/** Status-count chip in the hero: solid (shipped), pulsing (building), hollow (planned). */
function StatusCount({
  n,
  label,
  variant,
}: {
  n: number
  label: string
  variant: 'shipped' | 'building' | 'planned'
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {variant === 'planned' ? (
        <span className="h-2 w-2 rounded-full border border-current" aria-hidden />
      ) : (
        <span
          className={cn('h-2 w-2 rounded-full bg-accent', variant === 'building' && n > 0 && 'pulse-dot')}
          aria-hidden
        />
      )}
      <span>
        <span className="text-fg">{n}</span> {label}
      </span>
    </span>
  )
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const initialTech = Array.isArray(sp.tech) ? sp.tech[0] : sp.tech
  const projects = allProjects()
  const label = site.entityLabel.plural

  const items: ProjectItem[] = projects.map((p, i) => ({
    meta: {
      slug: p.slug,
      status: p.status,
      tech: p.tech,
      title: p.title,
      created: new Date(p.startDate).getTime(),
      shipped: p.shippedDate ? new Date(p.shippedDate).getTime() : null,
      search: `${p.title} ${p.summary}`.toLowerCase(),
    } satisfies CardFilterMeta,
    node: (
      <ProjectCard
        project={p}
        priority={i === 0}
        footer={
          <div className="mt-1">
            <FollowButton projectSlug={p.slug} projectTitle={p.title} direction="up" />
          </div>
        }
      />
    ),
  }))

  const counts: StatusCounts = { shipped: 0, building: 0, planned: 0 }
  for (const p of projects) counts[p.status]++

  const techOptions = Array.from(new Set(projects.flatMap((p) => p.tech))).sort((a, b) =>
    a.localeCompare(b),
  )

  return (
    <div className="pb-20">
      <header className="mx-auto max-w-6xl px-5 pt-12 pb-8 sm:pt-16">
        <span className="inline-flex items-center rounded-full border border-[color:var(--hairline)] bg-accent-soft px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
          {label} · the index
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
          Everything I&rsquo;ve built.
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-fg-2">
          Small, finished software — one a month, shipped in public. Browse the lot, filter to what
          you care about, and dive in.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-fg-2">
          <StatusCount n={counts.shipped} label="shipped" variant="shipped" />
          <StatusCount n={counts.building} label="building" variant="building" />
          <StatusCount n={counts.planned} label="planned" variant="planned" />
        </div>
      </header>

      <ProjectsExplorer
        key={initialTech ?? 'all'}
        items={items}
        techOptions={techOptions}
        entityPlural={label}
        initialTech={initialTech}
      />
    </div>
  )
}
