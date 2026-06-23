import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Project } from '@/lib/content'
import { FollowButton } from '@/components/capture/follow-button'
import { MediaPlaceholder, MediaGlyph } from './media-placeholder'
import { daysSince, fullDate, monthYear } from './format'

/**
 * "Currently building" feature card — the in-progress project shown live. Two-up:
 * a placeholder/cover media on the left, project details + the latest build update +
 * a "Follow this app" capture on the right. Progress is expressed honestly from real
 * data ("day N" since start) rather than a fabricated percentage.
 */
export function BuildingCard({ project }: { project: Project }) {
  const day = daysSince(project.startDate)
  const latest =
    [...project.updates].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))[0] ?? null

  return (
    <div className="glass grid rounded-[18px] shadow-[var(--shadow-pop)] md:grid-cols-2">
      <MediaPlaceholder
        className="min-h-[260px] rounded-t-[18px] sm:min-h-[300px] md:rounded-tr-none md:rounded-bl-[18px]"
        cover={project.cover}
        alt={project.title}
      >
        <span className="absolute left-3.5 top-3.5 z-10 inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-[rgba(12,10,34,0.5)] px-2.5 py-1.5 font-mono text-[11px] text-white">
          <span className="pulse-dot h-[7px] w-[7px] rounded-full bg-accent" />
          Building · day {day}
        </span>
        {!project.cover && <MediaGlyph caption={`${project.title} — live preview`} />}
        {/* Whole-media click-through to the detail page (badge/glyph sit beneath this overlay). */}
        <Link
          href={project.url}
          aria-label={`View ${project.title}`}
          className="absolute inset-0 z-20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        />
      </MediaPlaceholder>

      <div className="flex flex-col p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] border border-[var(--hairline)] bg-accent-soft">
            <span className="h-[15px] w-[15px] rounded-[5px] bg-accent" />
          </span>
          <div>
            <div className="text-[19px] font-semibold tracking-[-0.01em] text-fg">{project.title}</div>
            <div className="text-[13px] text-fg-2">{project.summary}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="rounded-full border border-[var(--hairline)] bg-accent-soft px-2.5 py-1 font-mono text-[11px] text-accent">
            In progress
          </span>
          <span className="font-mono text-[11px] text-fg-2">
            Started {monthYear(project.startDate)} · day {day}
          </span>
        </div>

        {latest && (
          <div className="mt-4 rounded-[12px] border border-border bg-surface px-3.5 py-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-fg-2">
              Latest update · {fullDate(latest.date)}
            </div>
            <div className="mt-1.5 text-[13px] leading-[1.55] text-fg">{latest.note}</div>
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
          <FollowButton projectSlug={project.slug} projectTitle={project.title} />
          <Link
            href={project.url}
            className="inline-flex items-center gap-1.5 rounded-[9px] border border-border bg-surface px-3.5 py-2 text-[13px] font-medium text-fg transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            View project <ArrowRight aria-hidden className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
