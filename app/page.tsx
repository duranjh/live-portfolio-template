import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { site } from '@/config/site'
import { allGuides, allProjects } from '@/lib/content'
import { NewsletterForm } from '@/components/capture/newsletter-form'
import { Hero, type HeroMedia, type HeroStat } from '@/components/home/hero'
import { SectionHeading } from '@/components/home/section-heading'
import { Reveal } from '@/components/home/reveal'
import { BuildingCard } from '@/components/home/building-card'
import { LatestShip } from '@/components/home/latest-ship'
import { ProjectCard } from '@/components/projects/card'
import { ExploreTeasers } from '@/components/home/explore-teasers'
import { daysSince, monthYear } from '@/components/home/format'
import { JsonLd } from '@/components/seo/json-ld'

const NEWSLETTER_ID = 'newsletter'

/** Home / landing. Server Component — reads the static content selectors directly and
 * degrades gracefully: any section with no data is hidden, and the page renders fully
 * in demo mode (zero env). Metadata comes from the root layout default. */
export default function Home() {
  const projects = allProjects()
  const shipped = projects.filter((p) => p.status === 'shipped')
  const building = projects.filter((p) => p.status === 'building')

  const featuredBuilding = building.find((p) => p.featured) ?? building[0] ?? null
  const latest = shipped[0] ?? null
  const more = shipped.slice(1, 4)
  const guideCount = site.sections.guides ? allGuides().length : 0
  const showEmpty = !featuredBuilding && !latest

  // Honest, content-derived hero stats — no fabricated follower counts. Shown only
  // when at least two are non-zero, so the row never looks sparse.
  const { singular, plural } = site.entityLabel
  const heroStats = (
    [
      { value: String(shipped.length), label: `${shipped.length === 1 ? singular : plural} shipped` },
      { value: String(building.length), label: 'in progress' },
      { value: String(guideCount), label: guideCount === 1 ? 'guide published' : 'guides published' },
    ] satisfies HeroStat[]
  ).filter((s) => s.value !== '0')
  const stats = heroStats.length >= 2 ? heroStats : []

  const heroMedia: HeroMedia | null = featuredBuilding
    ? {
        title: featuredBuilding.title,
        statusLabel: 'Building',
        meta: `day ${daysSince(featuredBuilding.startDate)}`,
        caption: `${featuredBuilding.title} — live preview`,
        cover: featuredBuilding.cover,
        href: featuredBuilding.url,
      }
    : latest
      ? {
          title: latest.title,
          statusLabel: 'Live',
          meta: `shipped ${monthYear(latest.shippedDate ?? latest.startDate)}`,
          caption: `${latest.title} — latest ship`,
          cover: latest.cover,
          href: latest.url,
        }
      : null

  // Sequential section numbers ("01" = hero) computed over only the sections shown.
  let n = 1
  const next = () => String(++n).padStart(2, '0')
  const buildingNum = featuredBuilding ? next() : ''
  const latestNum = latest ? next() : ''
  const moreNum = more.length > 0 ? next() : ''
  const emptyNum = showEmpty ? next() : ''
  const exploreNum = next()
  const newsletterNum = next()

  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: site.baseUrl,
    description: site.bioShort,
    sameAs: site.socials.map((s) => s.href),
  }

  return (
    <>
      <JsonLd data={personLd} />
      <Hero
        eyebrow={`Building in public · ${new Date().getFullYear()}`}
        name={site.name}
        subhead={site.bioShort}
        tagline={site.tagline}
        bio={site.bioLong}
        stats={stats}
        media={heroMedia}
        newsletterId={NEWSLETTER_ID}
      />

      {featuredBuilding && (
        <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <SectionHeading
            index={buildingNum}
            eyebrow="Currently building"
            title="Watch it happen, in real time."
          />
          <Reveal kind="media">
            <BuildingCard project={featuredBuilding} />
          </Reveal>
        </section>
      )}

      {latest && (
        <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <SectionHeading index={latestNum} eyebrow="Latest ship" title="Just shipped." />
          <Reveal kind="media">
            <LatestShip project={latest} />
          </Reveal>
        </section>
      )}

      {more.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <SectionHeading
            index={moreNum}
            eyebrow="Recently shipped"
            title="More from the last few months."
            action={
              <Link
                href="/projects"
                className="whitespace-nowrap rounded-full border border-[var(--hairline)] bg-accent-soft px-4 py-2 text-sm font-medium text-accent transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                View all {plural} <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p, i) => (
              <Reveal key={p.slug} className="h-full" delay={i * 70}>
                <ProjectCard project={p} className="h-full" />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {showEmpty && (
        <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <SectionHeading index={emptyNum} eyebrow="Work" title="Shipping soon." />
          <Reveal>
            <div className="rounded-[18px] border border-dashed border-border bg-surface px-6 py-14 text-center">
              <p className="text-lg font-semibold text-fg">The first ship is on its way.</p>
              <p className="mx-auto mt-2 max-w-[46ch] text-sm leading-[1.6] text-fg-2">
                Projects show up here as they’re built and shipped. Follow along below to get the
                ship list as soon as the first one lands.
              </p>
            </div>
          </Reveal>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <SectionHeading index={exploreNum} eyebrow="Explore" title="Go deeper." />
        <ExploreTeasers />
      </section>

      <section id={NEWSLETTER_ID} className="mx-auto max-w-6xl scroll-mt-24 px-5 py-12 sm:py-16">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[22px] border border-accent/30 p-8 text-center shadow-[var(--shadow-pop)] ring-1 ring-accent/10 sm:p-14"
            style={{ background: 'color-mix(in srgb, var(--accent) 8%, var(--surface))' }}
          >
            {/* Soft accent glow so the "Follow along" destination is unmistakable on arrival. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-20 mx-auto h-44 w-3/4 blur-3xl"
              style={{ background: 'radial-gradient(closest-side, var(--accent-soft), transparent)' }}
            />
            <p className="relative font-mono text-xs uppercase tracking-[0.12em] text-accent">
              {newsletterNum} · Newsletter
            </p>
            <h2 className="relative mt-3 text-3xl font-semibold tracking-[-0.02em] text-fg sm:text-4xl">
              Get the ship list.
            </h2>
            <p className="relative mx-auto mt-2.5 max-w-[46ch] text-[15px] leading-[1.55] text-fg-2">
              One short email whenever a new {singular.toLowerCase()} goes live. No noise.
            </p>
            {/* Box spans the full section width; the form stays in a narrow centered column. */}
            <div className="relative mx-auto mt-7 max-w-md text-left">
              <NewsletterForm source="home" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
