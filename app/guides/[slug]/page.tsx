import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Lock } from 'lucide-react'
import { getGuideBySlug, type Guide } from '@/lib/content'
import { captureEnabled } from '@/lib/env'
import { UNLOCK_COOKIE, verifyUnlockToken } from '@/lib/security/unlock'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { MDXContent } from '@/components/mdx-content'
import { Toc } from '@/components/ui/toc'
import { GateForm } from '@/components/capture/gate-form'
import { NewsletterForm } from '@/components/capture/newsletter-form'
import { GuideCover } from '@/components/guides/guide-cover'
import { ShareButton } from '@/components/ui/share-button'
import { GuideDownload } from '@/components/guides/guide-download'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide || slug === 'premium') return {}
  return { title: guide.title, description: guide.summary }
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  // `premium` is a reserved route (handled by app/guides/premium); the static
  // segment wins over [slug], so this guard is belt-and-suspenders.
  if (!guide || slug === 'premium') notFound()

  // Per-request gate (reading the cookie opts this route into dynamic rendering).
  const token = (await cookies()).get(UNLOCK_COOKIE)?.value
  // eslint-disable-next-line react-hooks/purity -- request-time expiry check in a dynamic Server Component
  const unlocked = !captureEnabled || !guide.gated || verifyUnlockToken(token, slug, Date.now())

  return (
    <article className="guide-doc mx-auto w-full max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
      <header className="animate-fade-up">
        <div className="guide-no-print flex items-center justify-between gap-3">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-[13px] text-fg-2 transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All guides
          </Link>
          <div className="flex items-center gap-2">
            {unlocked && <GuideDownload slug={slug} title={guide.title} raw={guide.raw} />}
            <ShareButton title={guide.title} />
          </div>
        </div>

        <div className="guide-no-print mt-5 flex flex-wrap items-center gap-2">
          {guide.category && <Badge tone="accent">{guide.category}</Badge>}
          {unlocked && (
            <Badge tone="accent">
              <Check className="h-3 w-3" strokeWidth={3} />
              Unlocked
            </Badge>
          )}
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{guide.title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-fg-2">{guide.summary}</p>

        <GuideCover
          cover={guide.cover}
          aspectRatio="21 / 9"
          sizes="(max-width: 1024px) 100vw, 1024px"
          priority
          className="guide-no-print mt-6 rounded-lg border border-border"
        />
      </header>

      {unlocked ? <UnlockedBody guide={guide} /> : <LockedBody guide={guide} slug={slug} />}

      {unlocked && (
        <Card variant="accent" className="guide-no-print mx-auto mt-16 max-w-xl text-center">
          <h2 className="text-lg font-semibold tracking-tight">Liked this guide?</h2>
          <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-fg-2">
            I send one every few weeks, plus what I&apos;m shipping. No fluff — unsubscribe anytime.
          </p>
          <div className="mx-auto mt-4 max-w-sm text-left">
            <NewsletterForm source="guide-footer" />
          </div>
        </Card>
      )}
    </article>
  )
}

/** Locked: teaser preview only (never the gated body) + the email gate. */
function LockedBody({ guide, slug }: { guide: Guide; slug: string }) {
  const teaser = guide.teaser ?? guide.summary
  return (
    <div className="relative mt-10">
      <div className="[mask-image:linear-gradient(180deg,#000,transparent_88%)] [-webkit-mask-image:linear-gradient(180deg,#000,transparent_88%)]">
        <div className="prose-lp max-w-2xl">
          <p>{teaser}</p>
          <p className="text-muted">Enter your email below to read the full guide.</p>
        </div>
      </div>

      <Card variant="glass" className="relative z-10 -mt-6 max-w-xl">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-[9px] border border-border bg-accent-soft text-accent">
            <Lock className="h-4 w-4" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
            Free · instant access
          </span>
        </div>
        <h2 className="mt-3 text-xl font-semibold tracking-tight">
          Read the full guide — instant access
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-fg-2">
          Drop your email and the rest unlocks right now — no inbox wait. One unlock opens every guide
          on the site.
        </p>
        <div className="mt-4">
          <GateForm guideSlug={slug} />
        </div>
      </Card>
    </div>
  )
}

/** Unlocked: full MDX (server-rendered) + sticky scroll-spy TOC + a follow CTA. */
function UnlockedBody({ guide }: { guide: Guide }) {
  return (
    <div className="mt-10 grid gap-10 print:block lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start">
      <aside className="guide-no-print hidden lg:sticky lg:top-24 lg:block">
        <Toc />
      </aside>

      <div className="min-w-0" data-toc>
        <MDXContent code={guide.body} />
      </div>
    </div>
  )
}
