import { ArrowUpRight } from 'lucide-react'
import type { Project } from '@/lib/content'
import { Card } from '@/components/ui/card'
import { Toc } from '@/components/ui/toc'
import { FollowButton } from '@/components/capture/follow-button'
import { STATUS_META } from './status-badge'
import { monthYear } from './format'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{children}</p>
  )
}

const LINK_FIELDS: { key: keyof Project['links']; label: string }[] = [
  { key: 'live', label: 'Live app' },
  { key: 'repo', label: 'Repository' },
  { key: 'demo', label: 'Demo' },
  { key: 'video', label: 'Walkthrough video' },
]

/** Sticky metadata sidebar: timeline, stack, links, follow, and the shared TOC. */
export function MetaSidebar({ project }: { project: Project }) {
  const meta = STATUS_META[project.status]
  const links = LINK_FIELDS.map((f) => ({ ...f, href: project.links[f.key] })).filter(
    (l): l is typeof l & { href: string } => typeof l.href === 'string' && l.href.length > 0,
  )
  const timelineEnd =
    project.status === 'shipped' && project.shippedDate ? monthYear(project.shippedDate) : 'now'
  const caption =
    project.status === 'shipped' && project.shippedDate
      ? `Shipped ${monthYear(project.shippedDate)}`
      : meta.label

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-20">
      <Card variant="surface" className="flex flex-col">
        <Label>Timeline</Label>
        <div className="mt-2.5 flex items-center gap-2">
          <span className="text-[13px] font-medium">{monthYear(project.startDate) || '—'}</span>
          <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-subtle">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-accent"
              style={{ width: `${Math.round(meta.progress * 100)}%` }}
            />
          </div>
          <span className="text-[12px] text-muted">{timelineEnd}</span>
        </div>
        <p className="mt-2 font-mono text-[11px] text-fg-2">{caption}</p>

        {project.tech.length > 0 && (
          <>
            <div className="my-4 h-px bg-border" />
            <Label>Stack</Label>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-subtle px-2.5 py-1 font-mono text-[11px] text-fg-2"
                >
                  {t}
                </span>
              ))}
            </div>
          </>
        )}

        {links.length > 0 && (
          <>
            <div className="my-4 h-px bg-border" />
            <Label>Links</Label>
            <div className="mt-1.5 flex flex-col">
              {links.map((l) => (
                <a
                  key={l.key}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border-b border-border py-2 text-[13px] text-fg transition-colors last:border-b-0 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {l.label}
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                </a>
              ))}
            </div>
          </>
        )}

        <div className="mt-4">
          <FollowButton projectSlug={project.slug} projectTitle={project.title} />
        </div>
      </Card>

      <Card variant="surface" className="hidden lg:block">
        <Toc />
      </Card>
    </aside>
  )
}
