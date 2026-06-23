import type { ComponentType } from 'react'
import Link from 'next/link'
import {
  FaGithub,
  FaXTwitter,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaTwitch,
  FaDiscord,
  FaMastodon,
  FaThreads,
  FaBluesky,
  FaEnvelope,
} from 'react-icons/fa6'
import { site, navItems } from '@/config/site'
import { NewsletterForm } from '@/components/capture/newsletter-form'

/** Real brand icons (react-icons / Font Awesome) keyed by each social's `icon` value. */
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  github: FaGithub,
  x: FaXTwitter,
  twitter: FaXTwitter,
  linkedin: FaLinkedin,
  instagram: FaInstagram,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  twitch: FaTwitch,
  discord: FaDiscord,
  bluesky: FaBluesky,
  mastodon: FaMastodon,
  threads: FaThreads,
  email: FaEnvelope,
}

export function Footer() {
  const nav = navItems()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <span className="text-[15px] font-semibold">{site.name}</span>
          <p className="max-w-[30ch] text-[13px] leading-relaxed text-fg-2">{site.bioShort}</p>
          <div className="flex flex-wrap gap-2">
            {site.socials.map((s) => {
              const Icon = ICONS[s.icon]
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-8 w-8 place-items-center rounded-[9px] border border-border bg-surface text-fg-2 transition-colors hover:border-accent hover:text-fg"
                >
                  {Icon ? <Icon className="h-4 w-4" /> : <span className="text-[11px] font-medium">↗</span>}
                </a>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Site</span>
          {nav.map((it) => (
            <Link key={it.href} href={it.href} className="text-[13px] text-fg-2 transition-colors hover:text-fg">
              {it.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Newsletter</span>
          <p className="text-[13px] text-fg-2">One email when something ships.</p>
          <NewsletterForm source="footer" />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-4 text-[12px] text-muted sm:flex-row">
          <span>
            © {year} {site.name} ·{' '}
            <Link href="/privacy" className="transition-colors hover:text-fg">
              Privacy
            </Link>{' '}
            ·{' '}
            <Link href="/terms" className="transition-colors hover:text-fg">
              Terms
            </Link>
          </span>
          <span className="font-mono text-[11px]">Built with care · Geist</span>
        </div>
      </div>
    </footer>
  )
}
