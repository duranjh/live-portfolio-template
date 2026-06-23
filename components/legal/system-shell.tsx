import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { captureEnabled } from '@/lib/env'
import { DemoBanner } from '@/components/legal/demo-banner'

type Tone = 'accent' | 'success' | 'warn'

/** Cool teal-green for success states (never warm). No token exists — inline color-mix. */
const SUCCESS = '#3FB8A0'

const toneTile: Record<Tone, { className: string; style?: CSSProperties }> = {
  accent: { className: 'bg-accent-soft text-accent' },
  warn: { className: 'bg-subtle text-accent' },
  success: {
    className: '',
    style: {
      backgroundColor: `color-mix(in srgb, ${SUCCESS} 18%, transparent)`,
      color: `color-mix(in srgb, ${SUCCESS} 70%, var(--text))`,
    },
  },
}

/**
 * Shared shell for the single-focus system pages (confirm / confirmed / unsubscribe /
 * unsubscribed / link-invalid / 404): a centered glass card with a tone-tinted icon
 * tile, headline, body, and an action slot. Server component — reads `captureEnabled`
 * to show the demo banner. Mirrors `docs/design/System.dc.html`.
 */
export function SystemShell({
  tone,
  icon,
  title,
  body,
  children,
}: {
  tone: Tone
  icon: ReactNode
  title: string
  body: string
  children?: ReactNode
}) {
  const tile = toneTile[tone]
  return (
    <>
      {!captureEnabled && <DemoBanner />}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-5 py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(540px_360px_at_50%_14%,var(--accent-soft),transparent_70%)]"
        />
        <div className="glass animate-glass-in relative z-[1] w-full max-w-[440px] rounded-xl border border-border p-9 text-center shadow-[var(--shadow-pop)]">
          <div
            aria-hidden
            className={cn(
              'mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] border border-border',
              tile.className,
            )}
            style={tile.style}
          >
            {icon}
          </div>
          <h1 className="mt-5 text-[26px] font-semibold tracking-[-0.02em] text-fg">{title}</h1>
          <p className="mx-auto mt-3 max-w-[34ch] text-[15px] leading-relaxed text-fg-2">{body}</p>
          {children && <div className="mt-7 flex flex-col items-center gap-3">{children}</div>}
        </div>
      </section>
    </>
  )
}

/** Accent text link for the "links only" action rows on system pages. */
export function SystemLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-sm text-[14px] font-medium text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {children}
    </Link>
  )
}
