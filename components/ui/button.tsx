import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium cursor-pointer ' +
  'transition-[filter,background-color,color,box-shadow,transform] duration-150 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:brightness-110 shadow-[0_8px_18px_-8px_var(--accent)]',
  secondary: 'bg-surface text-fg border border-border hover:bg-subtle',
  ghost: 'bg-transparent text-fg-2 hover:bg-surface hover:text-fg',
}

const sizes: Record<Size, string> = {
  sm: 'text-[13px] px-3.5 py-2',
  md: 'text-sm px-5 py-2.5',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
}
