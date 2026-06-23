'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { MediaPlaceholder, MediaGlyph } from './media-placeholder'

export type HeroStat = { value: string; label: string }
export type HeroMedia = {
  title: string
  statusLabel: string
  meta: string
  caption: string
  cover?: string
  /** Detail page for the project this card represents — makes the whole card a link. */
  href?: string
}

/**
 * The landing hero — the signature motion moment. Text + CTAs on the left, a glass
 * media card on the right. Content/CTAs are config-driven and the entrance is pure
 * CSS (`animate-fade-up`, staggered) so it plays without JS and survives hydration.
 * The client effect only layers ambient enhancements (drifting gradient mesh +
 * subtle scroll parallax) and smooth-scrolls the "Follow along" CTA — all gated
 * behind `prefers-reduced-motion`.
 */
export function Hero({
  eyebrow,
  name,
  subhead,
  tagline,
  bio,
  stats,
  media,
  newsletterId,
}: {
  eyebrow: string
  name: string
  subhead: string
  tagline: string
  bio: string
  stats: HeroStat[]
  media: HeroMedia | null
  newsletterId: string
}) {
  const glowRef = useRef<HTMLDivElement | null>(null)
  const orbRef = useRef<HTMLDivElement | null>(null)
  const mediaRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const glow = glowRef.current
    const orb = orbRef.current
    const card = mediaRef.current

    const anims = [
      glow?.animate(
        [
          { transform: 'translate3d(0,0,0) scale(1)' },
          { transform: 'translate3d(3%,-2%,0) scale(1.08)' },
          { transform: 'translate3d(0,0,0) scale(1)' },
        ],
        { duration: 18000, iterations: Infinity, easing: 'ease-in-out' },
      ),
      orb?.animate(
        [
          { transform: 'translate3d(0,0,0) scale(1)' },
          { transform: 'translate3d(-4%,3%,0) scale(1.12)' },
          { transform: 'translate3d(0,0,0) scale(1)' },
        ],
        { duration: 22000, iterations: Infinity, easing: 'ease-in-out' },
      ),
    ]

    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const y = window.scrollY
        // `translate` composes with the WAAPI `transform` drift without clobbering it.
        if (glow) glow.style.translate = `0 ${(y * -0.05).toFixed(1)}px`
        if (orb) orb.style.translate = `0 ${(y * 0.03).toFixed(1)}px`
        if (card) card.style.translate = `0 ${(y * 0.04).toFixed(1)}px`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      anims.forEach((a) => a?.cancel())
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const scrollToNewsletter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(newsletterId)
    if (!el) return // let the browser fall back to the native hash jump
    e.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  const d = (i: number) => ({ animationDelay: `${i * 70}ms` })

  // The hero media represents a specific project (the featured build, else the latest ship).
  // When we have its detail URL, the whole card becomes a link there; `group-hover` styles
  // on the inner card only activate under the <Link>'s `group` (static otherwise).
  const mediaInner = (
    <div className="glass overflow-hidden rounded-[18px] shadow-[var(--shadow-pop)] transition-[transform,filter] duration-200 group-hover:-translate-y-1 group-hover:brightness-[1.02]">
      <MediaPlaceholder aspect="aspect-[4/3]" cover={media?.cover} alt={media?.title}>
        {!media?.cover && <MediaGlyph caption={media?.caption ?? `${name} — building in public`} />}
      </MediaPlaceholder>
      <div className="flex items-center gap-2.5 border-t border-[var(--hairline)] px-4 py-3.5">
        <span className="flex items-center gap-1.5 text-xs text-fg-2">
          <span className="pulse-dot h-[7px] w-[7px] rounded-full bg-accent" />
          {media?.statusLabel ?? 'Live'}
        </span>
        <span className="text-[13px] font-medium text-fg">{media?.title ?? name}</span>
        {media?.meta && <span className="ml-auto font-mono text-[11px] text-fg-2">{media.meta}</span>}
        {media?.href && (
          <ArrowUpRight
            aria-hidden
            className={`h-3.5 w-3.5 shrink-0 text-fg-2 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${media.meta ? 'ml-1.5' : 'ml-auto'}`}
          />
        )}
      </div>
    </div>
  )

  return (
    <section className="relative overflow-hidden pb-10 pt-14 sm:pb-14 sm:pt-20">
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-[-10%] top-[-12%] -z-10 h-[560px]"
        style={{
          backgroundImage:
            'radial-gradient(420px 320px at 22% 24%, var(--accent-soft), transparent 70%), radial-gradient(460px 360px at 82% 8%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 72%)',
        }}
      />
      <div
        ref={orbRef}
        aria-hidden
        className="pointer-events-none absolute right-[6%] top-[8%] -z-10 h-[360px] w-[360px] rounded-full blur-[10px]"
        style={{
          backgroundImage:
            'radial-gradient(circle, color-mix(in srgb, var(--accent) 16%, transparent), transparent 64%)',
        }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div>
          <span
            className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-accent-soft px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-accent"
            style={d(0)}
          >
            {eyebrow}
          </span>
          <h1
            className="animate-fade-up mt-4 text-[clamp(40px,8vw,66px)] font-semibold leading-[1.02] tracking-[-0.035em] text-fg"
            style={d(1)}
          >
            <span className="block">{name}</span>
            <span className="block font-light tracking-[-0.02em] text-fg-2">{subhead}</span>
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-[26ch] text-lg font-medium leading-[1.5] text-fg sm:text-xl"
            style={d(2)}
          >
            {tagline}
          </p>
          <p
            className="animate-fade-up mt-3 max-w-[46ch] text-base leading-[1.65] text-fg-2"
            style={d(3)}
          >
            {bio}
          </p>
          <div className="animate-fade-up mt-7 flex flex-wrap gap-3" style={d(4)}>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-ink shadow-[0_12px_30px_-12px_var(--accent)] transition-[transform,filter] duration-150 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              See my work <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <a
              href={`#${newsletterId}`}
              onClick={scrollToNewsletter}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-medium text-fg transition-[transform,background-color] duration-150 hover:-translate-y-0.5 hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Follow along
            </a>
          </div>
          {stats.length > 0 && (
            <dl className="animate-fade-up mt-8 flex flex-wrap items-center gap-x-6 gap-y-4" style={d(5)}>
              {stats.map((s, i) => (
                <div key={s.label} className="flex items-center gap-6">
                  {i > 0 && <span aria-hidden className="hidden h-8 w-px bg-border sm:block" />}
                  {/* col-reverse keeps the value on top visually while emitting
                      spec-correct dt-before-dd order for assistive tech. */}
                  <div className="flex flex-col-reverse">
                    <dt className="mt-1.5 font-mono text-xs text-fg-2">{s.label}</dt>
                    <dd className="text-[22px] font-semibold leading-none tracking-[-0.02em] text-fg">
                      {s.value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div ref={mediaRef} className="animate-fade-up" style={d(2)}>
          {media?.href ? (
            <Link
              href={media.href}
              aria-label={`View ${media.title}`}
              className="group block rounded-[18px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {mediaInner}
            </Link>
          ) : (
            mediaInner
          )}
        </div>
      </div>
    </section>
  )
}
