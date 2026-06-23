'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

type NavItem = { href: string; label: string }

/** Hamburger + frosted-glass overlay menu for small screens. */
export function MobileNav({ nav, building }: { nav: NavItem[]; building: string | null }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface text-fg"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>
      {open && (
        <div className="animate-glass-in glass fixed inset-x-0 top-14 bottom-0 z-40 flex flex-col gap-1 p-4">
          {nav.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-[17px] text-fg-2 transition-colors hover:bg-surface hover:text-fg"
            >
              {it.label}
            </Link>
          ))}
          {building && (
            <span className="mt-auto flex items-center gap-2 px-3 py-3 text-sm text-fg-2">
              <span className="pulse-dot h-[7px] w-[7px] rounded-full bg-accent" />
              Building {building}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
