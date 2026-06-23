import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, Code2, MonitorPlay, Video } from 'lucide-react'
import type { Project } from '@/lib/content'
import { site } from '@/config/site'
import { ShareButton } from '@/components/ui/share-button'
import { StatusBadge } from './status-badge'

const ACTION_BASE =
  'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

/** Hero: back link, project mark, title + status, summary, and external action links. */
export function ProjectHero({ project }: { project: Project }) {
  const { links } = project
  const actions = [
    { href: links.live, label: 'Live app', Icon: ExternalLink, primary: true },
    { href: links.repo, label: 'Repo', Icon: Code2, primary: false },
    { href: links.demo, label: 'Demo', Icon: MonitorPlay, primary: false },
    { href: links.video, label: 'Walkthrough', Icon: Video, primary: false },
  ].filter((a): a is typeof a & { href: string } => typeof a.href === 'string' && a.href.length > 0)

  return (
    <section className="relative overflow-hidden border-b border-border pb-9 pt-12 sm:pt-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 z-0 h-[380px]"
        style={{
          background:
            'radial-gradient(420px 280px at 24% 30%, var(--accent-soft), transparent 70%), radial-gradient(420px 300px at 86% 0%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 72%)',
        }}
      />
      <div className="animate-fade-up relative z-[1]">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 rounded-sm text-[13px] text-fg-2 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> All {site.entityLabel.plural}
        </Link>

        <div className="mt-3.5 flex flex-wrap items-center gap-3">
          <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[13px] bg-accent shadow-[0_14px_34px_-10px_var(--accent)]">
            {project.cover ? (
              <Image src={project.cover} alt="" fill sizes="48px" className="object-cover" />
            ) : (
              <span className="h-4 w-4 rounded-[5px] bg-accent-ink" aria-hidden="true" />
            )}
          </span>
          <h1 className="text-balance break-words text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[3.25rem]">
            {project.title}
          </h1>
          <StatusBadge status={project.status} />
        </div>

        <p className="mt-3.5 max-w-[54ch] text-[1.25rem] leading-[1.5] text-fg-2">{project.summary}</p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          {actions.map(({ href, label, Icon, primary }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={
                primary
                  ? `${ACTION_BASE} bg-accent text-accent-ink shadow-[0_8px_18px_-8px_var(--accent)] hover:brightness-110`
                  : `${ACTION_BASE} border border-border bg-surface text-fg hover:bg-subtle`
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </a>
          ))}
          <ShareButton title={project.title} className="px-4 py-2.5 text-sm" />
        </div>
      </div>
    </section>
  )
}
