import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CurrentlyItem, NextUpItem } from './resume-data'

/**
 * "Currently working on" (building projects → prominent accent card) and "Next up"
 * (planned projects → dashed rows). Both derive from project `status`; each section
 * renders only when non-empty (demo ships no `building` project, so Currently hides).
 * These headings are view-independent, keeping the shared <Toc> stable across lenses.
 */
export function CurrentlyNext({
  currently,
  nextUp,
}: {
  currently: CurrentlyItem[]
  nextUp: NextUpItem[]
}) {
  return (
    <>
      {currently.length > 0 && (
        <section id="currently" aria-labelledby="resume-currently-h" className="scroll-mt-20">
          <h2 id="resume-currently-h" className="text-2xl font-semibold tracking-tight">
            Currently working on
          </h2>
          <div className="mt-5 flex flex-col gap-4">
            {currently.map((c) => (
              <Card key={c.slug} variant="accent" className="relative overflow-hidden">
                <div
                  aria-hidden
                  className="resume-decor pointer-events-none absolute -right-8 -top-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,var(--accent-soft),transparent_65%)]"
                />
                <div className="relative flex flex-wrap items-center gap-3">
                  <span
                    aria-hidden
                    className="grid h-10 w-10 flex-none place-items-center rounded-md bg-accent"
                  >
                    <span className="h-3.5 w-3.5 rounded-[5px] bg-accent-ink" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold tracking-tight">{c.title}</p>
                    <p className="line-clamp-1 text-[13px] text-fg-2">{c.summary}</p>
                  </div>
                  <Badge tone="accent">
                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-current" />
                    Building{c.dayLabel ? ` · ${c.dayLabel}` : ''}
                  </Badge>
                </div>
                <Link
                  href={c.href}
                  aria-label={`View ${c.title}`}
                  className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-accent before:absolute before:inset-0 before:content-[''] hover:underline"
                >
                  View project <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      {nextUp.length > 0 && (
        <section id="next-up" aria-labelledby="resume-next-h" className="scroll-mt-20">
          <h2 id="resume-next-h" className="text-2xl font-semibold tracking-tight">
            Next up
          </h2>
          <div className="mt-5 flex flex-col gap-3">
            {nextUp.map((n) => (
              <div
                key={n.slug}
                className="relative flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border p-5"
              >
                <span
                  aria-hidden
                  className="grid h-9 w-9 flex-none place-items-center rounded-md border border-border bg-subtle"
                >
                  <span className="h-3.5 w-3.5 rounded-[4px] border-[1.5px] border-accent" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      href={n.href}
                      className="text-[17px] font-semibold tracking-tight before:absolute before:inset-0 before:content-[''] hover:text-accent"
                    >
                      {n.title}
                    </Link>
                    <Badge tone="neutral">Planned</Badge>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[13px] text-fg-2">{n.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
