import Link from 'next/link'
import Image from 'next/image'
import type { Project } from '@/lib/content'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusLabel: Record<Project['status'], string> = {
  shipped: 'Shipped',
  building: 'Building',
  planned: 'Planned',
}

/**
 * Shared project tile — used by Home (recently-shipped), Apps (grid), and Project
 * detail (prev/next). Server-rendered. A consumer can pass a `footer` (e.g. a Follow
 * button) and `priority` for the LCP image. Remote cover URLs need `remotePatterns`
 * in next.config; the template demo ships coverless (gradient placeholder).
 */
export function ProjectCard({
  project,
  footer,
  priority = false,
  className,
}: {
  project: Project
  footer?: React.ReactNode
  priority?: boolean
  className?: string
}) {
  return (
    <article
      className={cn(
        // NB: clip is on the cover only (below), NOT the article — so a FollowButton popover in the
        // `footer` slot can overflow the card instead of being cut off.
        'group flex flex-col rounded-lg border border-border bg-surface transition-colors hover:border-accent/60',
        className,
      )}
    >
      <Link href={project.url} className="block" aria-label={project.title}>
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-lg bg-subtle">
          {project.cover ? (
            <Image
              src={project.cover}
              alt=""
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_0%,var(--accent-soft),var(--surface)_60%)]" />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={project.url}
            className="text-[15px] font-semibold tracking-tight transition-colors hover:text-accent"
          >
            {project.title}
          </Link>
          <Badge tone={project.status === 'shipped' ? 'accent' : 'neutral'} dot>
            {statusLabel[project.status]}
          </Badge>
        </div>
        <p className="line-clamp-2 text-[13px] text-fg-2">{project.summary}</p>
        {project.tech.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {project.tech.slice(0, 4).map((t) => (
              <Link
                key={t}
                href={`/projects?tech=${encodeURIComponent(t)}`}
                className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted transition-colors hover:border-accent hover:text-accent"
              >
                {t}
              </Link>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center gap-3 pt-2 text-[13px]">
          {project.links.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent hover:underline"
            >
              Live app ↗
            </a>
          )}
          <Link href={project.url} className="text-fg-2 transition-colors hover:text-fg">
            Details →
          </Link>
        </div>
        {footer}
      </div>
    </article>
  )
}
