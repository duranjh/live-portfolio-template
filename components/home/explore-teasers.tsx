import Link from 'next/link'
import { ArrowRight, BookOpen, FileText, LayoutGrid, Lightbulb, PenLine } from 'lucide-react'
import { navItems } from '@/config/site'
import { Reveal } from './reveal'

/** One-line teaser copy per destination, keyed by route so it survives label edits
 * (e.g. renaming "Apps" → "Work" via `entityLabel`). */
const COPY: Record<string, string> = {
  '/projects': 'Everything I’ve shipped, and what’s in progress.',
  '/resume': 'My work history, kept live and current.',
  '/ideas': 'A public board of what might come next.',
  '/guides': 'How I design, build, and ship in public.',
  '/blog': 'Notes and essays from the workshop.',
}

/** Per-section icon, keyed by route (same route-keying as COPY so it survives relabels). */
const ICON: Record<string, typeof LayoutGrid> = {
  '/projects': LayoutGrid,
  '/resume': FileText,
  '/ideas': Lightbulb,
  '/guides': BookOpen,
  '/blog': PenLine,
}

/** "Explore" teaser grid — links into the other sections, driven by `navItems()` so
 * it automatically respects the site's section toggles. */
export function ExploreTeasers() {
  const items = navItems()
  if (items.length === 0) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((it, i) => {
        const Icon = ICON[it.href] ?? LayoutGrid
        return (
          <Reveal key={it.href} delay={i * 60}>
            <Link
              href={it.href}
              className="group flex h-full items-center gap-4 rounded-[16px] border border-border bg-surface p-5 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-[var(--hairline)] bg-accent-soft">
                <Icon aria-hidden className="h-[18px] w-[18px] text-accent" strokeWidth={2} />
              </span>
              <span className="flex-1">
                <span className="block text-[17px] font-semibold text-fg">{it.label}</span>
                <span className="mt-0.5 block text-[13px] leading-[1.5] text-fg-2">
                  {COPY[it.href] ?? 'Take a closer look.'}
                </span>
              </span>
              <ArrowRight
                aria-hidden
                className="h-[18px] w-[18px] text-muted transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Reveal>
        )
      })}
    </div>
  )
}
