import Link from 'next/link'
import { site, navItems } from '@/config/site'
import { allProjects } from '@/lib/content'
import { ThemeToggle } from './theme-toggle'
import { MobileNav } from './mobile-nav'

/** Sticky frosted-glass header: logo, nav, "currently building" indicator, theme toggle. */
export function Header() {
  const nav = navItems()
  const building = allProjects().find((p) => p.status === 'building') ?? null

  return (
    <header className="glass sticky top-0 z-50 border-b border-border">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="h-[18px] w-[18px] rotate-45 rounded-[5px] bg-accent shadow-[0_0_14px_-2px_var(--accent)]" />
          <span className="text-[15px] font-semibold tracking-tight">{site.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="rounded-lg px-3 py-1.5 text-[13px] text-fg-2 transition-colors hover:bg-surface hover:text-fg"
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3.5">
          {building && (
            <Link
              href={building.url}
              className="hidden items-center gap-2 text-xs text-fg-2 transition-colors hover:text-fg sm:flex"
            >
              <span className="pulse-dot h-[7px] w-[7px] rounded-full bg-accent" />
              Building {building.title}
            </Link>
          )}
          <ThemeToggle />
          <MobileNav nav={nav} building={building?.title ?? null} />
        </div>
      </div>
    </header>
  )
}
