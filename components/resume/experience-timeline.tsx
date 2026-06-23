import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Entry } from './resume-data'

/**
 * Merged projects + jobs as one vertical-spine timeline, newest first. Project
 * entries link back to their case study; a `building` entry pulses. The spine line
 * + decorative bits carry `.resume-decor` so they drop out of the print stylesheet.
 */
export function ExperienceTimeline({ spine }: { spine: Entry[] }) {
  if (spine.length === 0) {
    return <p className="mt-4 text-sm text-muted">No experience to show yet.</p>
  }

  return (
    <div className="relative mt-6 pl-7">
      <div
        aria-hidden
        className="resume-decor absolute bottom-1 left-[6px] top-1 w-px bg-[var(--hairline)]"
      />
      <ol className="flex flex-col gap-7">
        {spine.map((e) => (
          <li key={e.id} className="resume-entry relative">
            <span
              aria-hidden
              className={cn(
                'absolute -left-7 top-1.5 h-3 w-3 rounded-full border-2 border-bg',
                e.badge?.tone === 'accent' ? 'bg-accent' : 'bg-subtle ring-1 ring-border',
              )}
            />
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-base font-semibold tracking-tight">{e.title}</span>
              {e.badge && (
                <Badge tone={e.badge.tone}>
                  {e.badge.pulse && <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-current" />}
                  {e.badge.text}
                </Badge>
              )}
              <span className="ml-auto font-mono text-[11px] text-muted">{e.dateRange}</span>
            </div>
            <p className="mt-0.5 text-[13px] font-medium text-fg-2">{e.org}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-2">{e.summary}</p>
            {(e.chips.length > 0 || e.href) && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {e.chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-border bg-subtle px-2 py-0.5 font-mono text-[10px] text-fg-2"
                  >
                    {c}
                  </span>
                ))}
                {e.href && (
                  <Link
                    href={e.href}
                    className="ml-1 inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:underline"
                  >
                    View app <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
