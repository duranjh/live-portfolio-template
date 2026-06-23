import type { ReactNode } from 'react'

/**
 * The numbered section header used down the home page ("02 · Currently building").
 * Mirrors the design export: mono accent eyebrow + large tracked-tight title, with
 * an optional right-aligned action (e.g. "View all apps →").
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  action,
}: {
  index: string
  eyebrow: string
  title: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent">
          {index} · {eyebrow}
        </p>
        <h2 className="mt-2.5 text-[27px] font-semibold leading-[1.1] tracking-[-0.025em] text-fg sm:text-[40px]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}
