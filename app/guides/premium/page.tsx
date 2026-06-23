import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { NewsletterForm } from '@/components/capture/newsletter-form'

export const metadata: Metadata = {
  title: 'Premium guides',
  description: 'In-depth premium guides are on the way — join the waitlist to hear first.',
}

/** Front-end "coming soon" splash. `premium` is a reserved slug (this static route
 *  wins over /guides/[slug]). Optional notify-me via the real newsletter action. */
export default function PremiumGuidesPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-5 py-20 sm:px-6">
      <Link
        href="/guides"
        className="inline-flex items-center gap-1.5 text-[13px] text-fg-2 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All guides
      </Link>

      <Card variant="glass" className="animate-fade-up mt-8 p-8 text-center sm:p-10">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-border bg-accent-soft text-accent">
          <Sparkles className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
          Premium guides are coming
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-fg-2">
          Longer, in-depth playbooks with templates and code are in the works. Join the waitlist and
          I&apos;ll let you know the moment the first one drops.
        </p>
        <div className="mx-auto mt-6 max-w-sm text-left">
          <NewsletterForm source="premium-waitlist" redirectTo="/guides" />
        </div>
      </Card>
    </section>
  )
}
