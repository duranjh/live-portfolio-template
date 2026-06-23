import type { Project } from '@/lib/content'
import { fullDate } from './format'

/**
 * "Build in public" — a dated log of updates with milestone emphasis. The schema
 * exposes `{ date, note, milestone }` (no separate title/body), so the note is the
 * entry. Hidden entirely when there are no updates.
 */
export function UpdatesLog({ updates }: { updates: Project['updates'] }) {
  if (updates.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold tracking-tight">Build in public</h2>
      <div className="relative mt-6 pl-7">
        <div className="absolute bottom-1.5 left-1.5 top-1.5 w-px bg-border" aria-hidden="true" />
        <ol>
          {updates.map((u, i) => (
            <li key={`${u.date}-${i}`} className="relative pb-6 last:pb-0">
              <span
                className="absolute -left-[26px] top-1 h-3.5 w-3.5 rounded-full border-2 border-bg"
                style={{
                  background: u.milestone ? 'var(--accent)' : 'var(--subtle)',
                  boxShadow: `0 0 0 1px ${u.milestone ? 'var(--accent)' : 'var(--border)'}`,
                }}
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-center gap-2.5">
                <time dateTime={u.date} className="font-mono text-[11px] text-muted">
                  {fullDate(u.date)}
                </time>
                {u.milestone && (
                  <span className="rounded-full border border-border bg-accent-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-accent">
                    Milestone
                  </span>
                )}
              </div>
              <p className="mt-1.5 max-w-[60ch] text-[15px] font-medium leading-snug tracking-[-0.01em] text-fg">
                {u.note}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
