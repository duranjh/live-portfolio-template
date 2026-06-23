import { Download } from 'lucide-react'
import { site } from '@/config/site'
import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/capture/follow-button'
import { ViewToggle } from './view-toggle'
import type { View } from './resume-data'

/** Initials from the configured name (no avatar field in SiteConfig). */
function initials(name: string): string {
  const words = name
    .replace(/[^\p{L}\s]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  return (
    words
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || '·'
  )
}

export function ResumeHero({
  view,
  onSelect,
  lensTag,
  followTarget,
}: {
  view: View
  onSelect: (v: View) => void
  lensTag: string
  followTarget: { slug: string; title: string } | null
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="grid h-14 w-14 flex-none place-items-center rounded-full bg-accent-soft font-mono text-lg font-semibold text-accent"
        >
          {initials(site.name)}
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{site.name}</h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Resume · {lensTag}
          </p>
        </div>
      </div>

      <p className="max-w-2xl text-[15px] leading-relaxed text-fg-2">{site.bioLong}</p>

      <div className="resume-no-print flex flex-wrap items-center gap-3">
        <ViewToggle value={view} onSelect={onSelect} />
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => window.print()}>
            <Download className="h-3.5 w-3.5" /> Download PDF
          </Button>
          {followTarget && (
            <FollowButton projectSlug={followTarget.slug} projectTitle={followTarget.title} />
          )}
        </div>
      </div>
    </div>
  )
}
