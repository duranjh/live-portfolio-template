import type { Project } from '@/lib/content'
import { cn } from '@/lib/utils'

type Status = Project['status']

/**
 * Per-status presentation, derived only from `status` + dates (the schema has no
 * progress/day fields — we never invent them). `live` pulses the dot; `progress`
 * fills the sidebar timeline bar.
 */
export const STATUS_META: Record<Status, { label: string; live: boolean; progress: number }> = {
  shipped: { label: 'Shipped', live: false, progress: 1 },
  building: { label: 'Building', live: true, progress: 0.6 },
  planned: { label: 'Planned', live: false, progress: 0.12 },
}

/** Mono status pill used in the hero (pulsing dot while building). */
export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { label, live } = STATUS_META[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-accent-soft px-2.5 py-1 font-mono text-[11px] text-accent',
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full bg-current', live && 'pulse-dot')} aria-hidden="true" />
      {label}
    </span>
  )
}
