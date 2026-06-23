import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Project } from '@/lib/content'
import { MediaPlaceholder } from './media-placeholder'
import { monthYear } from './format'

/** "Latest ship" feature — the most recently shipped project, shown two-up with a
 * cover/placeholder and the headline details + a link through to the case study. */
export function LatestShip({ project }: { project: Project }) {
  const shipped = project.shippedDate ?? project.startDate

  return (
    <div className="grid overflow-hidden rounded-[18px] border border-border bg-surface shadow-[var(--shadow-card)] md:grid-cols-2">
      <MediaPlaceholder className="min-h-[240px] sm:min-h-[280px]" cover={project.cover} alt={project.title}>
        {!project.cover && (
          <span className="absolute bottom-4 left-4 z-10 font-mono text-[11px] uppercase tracking-[0.1em] text-white/75">
            {project.title} — cover shot
          </span>
        )}
        <Link
          href={project.url}
          aria-label={`View ${project.title}`}
          className="absolute inset-0 z-20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        />
      </MediaPlaceholder>

      <div className="flex flex-col justify-center p-7 sm:p-8">
        <span className="self-start rounded-full border border-[var(--hairline)] bg-accent-soft px-2.5 py-1 font-mono text-[11px] text-accent">
          Shipped · {monthYear(shipped)}
        </span>
        <h3 className="mt-3.5 text-2xl font-semibold tracking-[-0.02em] text-fg">{project.title}</h3>
        <p className="mt-2 max-w-[42ch] text-[15px] leading-[1.6] text-fg-2">{project.summary}</p>

        {project.tech.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.tech.slice(0, 4).map((t) => (
              <li key={t}>
                <Link
                  href={`/projects?tech=${encodeURIComponent(t)}`}
                  className="inline-block rounded-full border border-border bg-subtle px-2.5 py-1 font-mono text-[11px] text-fg-2 transition-colors hover:border-accent hover:text-accent"
                >
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link
          href={project.url}
          className="mt-6 inline-flex items-center gap-2 self-start rounded-full border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          View project <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
