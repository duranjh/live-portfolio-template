import type { Metadata } from 'next'
import { BookOpen } from 'lucide-react'
import { freeGuides, premiumGuides, type Guide } from '@/lib/content'
import { Badge } from '@/components/ui/badge'
import { GuidesBrowser, type GuideCardData } from '@/components/guides/guides-browser'

export const metadata: Metadata = {
  title: 'Guides',
  description: 'Free, no-fluff playbooks for shipping apps — straight from the build log.',
}

/** Strip to card fields — never pass the compiled `body` into the client bundle. */
function toCardData(g: Guide): GuideCardData {
  return {
    title: g.title,
    slug: g.slug,
    summary: g.summary,
    url: g.url,
    cover: g.cover,
    category: g.category,
    tier: g.tier,
  }
}

export default function GuidesPage() {
  const free = freeGuides().map(toCardData)
  const premium = premiumGuides().map(toCardData)

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
      <header className="animate-fade-up max-w-2xl">
        <Badge tone="accent">
          <BookOpen className="h-3.5 w-3.5" />
          Guides
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Guides for makers.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-fg-2 sm:text-lg">
          No fluff — just the playbooks and checklists I use to take an idea from zero to shipped.
        </p>
      </header>

      <div className="mt-10">
        <GuidesBrowser free={free} premium={premium} />
      </div>
    </section>
  )
}
