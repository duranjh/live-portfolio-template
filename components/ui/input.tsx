import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** Shared text input — token-styled with accent focus ring. */
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm text-fg',
        'placeholder:text-muted transition-[border-color,box-shadow]',
        'focus-visible:border-accent focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--accent-soft)]',
        className,
      )}
      {...props}
    />
  )
}
