'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Item = { id: string; label: string; level: number }

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

/**
 * Sticky "On this page" table of contents — shared by Project detail, Resume, and
 * Guides. Self-deriving: it scans the headings inside the `[data-toc]` container,
 * assigns ids if missing, and scroll-spies the active section (IntersectionObserver).
 * Wrap the long-form content in `<div data-toc>…</div>` and drop `<Toc />` in the
 * sidebar — no per-page wiring needed.
 */
export function Toc({
  title = 'On this page',
  selector = '[data-toc]',
  className,
}: {
  title?: string
  selector?: string
  className?: string
}) {
  const [items, setItems] = useState<Item[]>([])
  const [active, setActive] = useState('')

  useEffect(() => {
    const root = document.querySelector(selector)
    if (!root) return
    const headings = Array.from(root.querySelectorAll('h2, h3')) as HTMLElement[]
    const list = headings
      .map((h) => {
        if (!h.id) h.id = slugify(h.textContent ?? '')
        return { id: h.id, label: h.textContent ?? '', level: h.tagName === 'H3' ? 3 : 2 }
      })
      .filter((i) => i.id && i.label)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- derive from DOM on mount
    setItems(list)

    // On a page too short to scroll, scroll-spy has nothing to track — leave every item
    // un-highlighted rather than pinning the first one permanently "active" (big-screen nit).
    if (document.documentElement.scrollHeight <= window.innerHeight + 8) return

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -70% 0px' },
    )
    headings.forEach((h) => obs.observe(h))
    return () => obs.disconnect()
  }, [selector])

  if (items.length === 0) return null

  return (
    <nav className={cn('text-[13px]', className)} aria-label={title}>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{title}</p>
      <ul className="flex flex-col border-l border-border">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={cn(
                '-ml-px block border-l-2 py-1 transition-colors',
                it.level === 3 ? 'pl-6' : 'pl-3',
                active === it.id ? 'border-accent text-accent' : 'border-transparent text-fg-2 hover:text-fg',
              )}
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
