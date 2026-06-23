import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'surface' | 'raised' | 'glass' | 'accent'

const variants: Record<Variant, string> = {
  surface: 'bg-surface border border-border',
  raised: 'bg-raised border border-border shadow-[var(--shadow-card)]',
  glass: 'glass shadow-[var(--shadow-pop)]',
  accent:
    'border border-border bg-[radial-gradient(135%_120%_at_100%_0%,var(--accent-soft),var(--surface)_60%)]',
}

export function Card({
  variant = 'surface',
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  return <div className={cn('rounded-lg p-5', variants[variant], className)} {...props} />
}
