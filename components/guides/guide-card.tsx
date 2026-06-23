import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { GuideCover } from './guide-cover'
import type { GuideCardData } from './guides-browser'

/**
 * Guide index card — cover (or gradient placeholder), title, summary, "Read free →".
 * Stagger-revealed via the global `.animate-fade-up` with a per-index delay (capped),
 * reduced-motion-safe by the global media query in globals.css.
 */
export function GuideCard({ guide, index = 0 }: { guide: GuideCardData; index?: number }) {
  return (
    <article
      className="group animate-fade-up overflow-hidden rounded-lg border border-border bg-surface transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-[var(--shadow-card)]"
      style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
    >
      <Link href={guide.url} className="block" aria-label={guide.title}>
        <GuideCover cover={guide.cover} category={guide.category} aspectRatio="16 / 9" />
        <div className="p-4">
          <h2 className="text-[17px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">
            {guide.title}
          </h2>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-fg-2">{guide.summary}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent">
            Read free
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </article>
  )
}
