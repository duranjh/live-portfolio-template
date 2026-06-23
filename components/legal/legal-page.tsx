import { Info } from 'lucide-react'
import type { Legal } from '@/lib/content'
import { captureEnabled } from '@/lib/env'
import { DemoBanner } from '@/components/legal/demo-banner'
import { MDXContent } from '@/components/mdx-content'
import { Toc } from '@/components/ui/toc'

/** ISO date → "June 2026" (UTC so the displayed month never drifts by timezone). */
function fmtMonth(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

/**
 * Shared legal-document template (privacy / terms): a header with the version /
 * effective / last-updated line and a not-legal-advice disclaimer, then a sticky
 * "On this page" TOC beside the long-form MDX prose. Demo-safe: when `doc` is null
 * (content not yet authored) it renders a graceful placeholder instead of crashing.
 */
export function LegalPage({ doc, title, slug }: { doc: Legal | null; title: string; slug: string }) {
  return (
    <>
      {!captureEnabled && <DemoBanner />}

      <header className="border-b border-border">
        <div className="animate-fade-up mx-auto max-w-[920px] px-5 pt-14 pb-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">Legal</p>
          <h1 className="mt-3 text-[34px] leading-[1.05] font-semibold tracking-[-0.03em] text-fg md:text-[42px]">
            {doc?.title ?? title}
          </h1>
          {doc && (
            <p className="mt-3 font-mono text-[12px] text-muted">
              Version {doc.version} · Effective {fmtMonth(doc.effectiveDate)} · Last updated{' '}
              {fmtMonth(doc.lastUpdated)}
            </p>
          )}
          <div
            role="note"
            className="mt-5 flex max-w-[72ch] items-start gap-3 rounded-md border border-border bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] px-4 py-3.5"
          >
            <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
            <p className="text-[13px] leading-relaxed text-fg-2">
              This is a starting template, not legal advice — adapt it for your jurisdiction and business
              before you launch.
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[920px] px-5 py-10">
        <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:gap-11">
          <aside className="hidden md:block">
            <div className="sticky top-24">
              <Toc />
            </div>
          </aside>
          <article className="min-w-0 max-w-[72ch]">
            {doc ? (
              <div data-toc>
                <MDXContent code={doc.body} />
              </div>
            ) : (
              <div className="prose-lp">
                <p>
                  This document hasn’t been published yet. Add <code>content/legal/{slug}.mdx</code> to
                  populate this page.
                </p>
              </div>
            )}
          </article>
        </div>
      </section>
    </>
  )
}
