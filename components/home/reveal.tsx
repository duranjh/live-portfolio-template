'use client'

import { useEffect, useRef, type ReactNode } from 'react'

const EASE = 'cubic-bezier(0.16,1,0.3,1)'

/**
 * Scroll-reveal wrapper — content fades + rises (or de-blurs, for `kind="media"`)
 * as it enters the viewport, matching the design's scroll-storytelling.
 *
 * Built defensively, with no React state so it never fights React's render:
 * - **No-JS / pre-hydration safe:** the markup renders fully visible; only the client
 *   effect introduces the hidden start state, so content never depends on JS to show.
 * - **No flash:** elements already in (or above) the viewport at load are left visible
 *   and un-animated; only genuinely below-the-fold elements are hidden and revealed.
 * - **Reduced-motion:** respects `prefers-reduced-motion` — the effect bails and the
 *   content simply stays visible.
 */
export function Reveal({
  children,
  className,
  kind = 'default',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  kind?: 'default' | 'media'
  delay?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const vh = window.innerHeight || document.documentElement.clientHeight || 0
    // Already in / above the viewport → show immediately (no hide, no flash).
    if (el.getBoundingClientRect().top < vh) return

    const isMedia = kind === 'media'
    const dur = isMedia ? 900 : 720

    el.style.opacity = '0'
    el.style.transform = isMedia ? 'translateY(40px) scale(0.96)' : 'translateY(26px)'
    if (isMedia) el.style.filter = 'blur(10px)'
    el.style.willChange = 'opacity, transform'

    const reveal = () => {
      el.style.transition =
        `opacity ${dur}ms ${EASE} ${delay}ms, transform ${dur}ms ${EASE} ${delay}ms` +
        (isMedia ? `, filter ${dur}ms ${EASE} ${delay}ms` : '')
      el.style.opacity = '1'
      el.style.transform = 'none'
      if (isMedia) el.style.filter = 'none'
      const done = () => {
        el.style.willChange = ''
        el.removeEventListener('transitionend', done)
      }
      el.addEventListener('transitionend', done)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            reveal()
            io.disconnect()
            break
          }
        }
      },
      // threshold 0 (any-pixel) + negative bottom margin reveals reliably even for
      // elements taller than the viewport, which a ratio threshold could never satisfy.
      { threshold: 0, rootMargin: '0px 0px -12% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [kind, delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
