'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, SunMedium } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Flash-free light/dark knob. Renders neutrally until mounted to avoid mismatch. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  // Intentional one-shot mount guard: the resolved theme isn't known on the
  // server, so we render neutrally until mounted to avoid a hydration mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      aria-label={mounted ? `Switch to ${isDark ? 'light' : 'dark'} mode` : 'Toggle theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative h-7 w-[50px] shrink-0 rounded-full border border-border bg-surface transition-colors"
    >
      <span
        className={cn(
          'absolute top-[2px] grid h-[21px] w-[21px] place-items-center rounded-full bg-accent text-accent-ink',
          'shadow-[0_1px_4px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isDark ? 'translate-x-[25px]' : 'translate-x-[2px]',
        )}
      >
        {mounted ? (
          isDark ? <Moon className="h-3 w-3" strokeWidth={2.2} /> : <SunMedium className="h-3.5 w-3.5" strokeWidth={2.2} />
        ) : null}
      </span>
    </button>
  )
}
