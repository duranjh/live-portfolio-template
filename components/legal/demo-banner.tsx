'use client'

import { useEffect, useState } from 'react'
import { Settings, X } from 'lucide-react'

const DISMISS_KEY = 'lp-demo-banner-dismissed'

/**
 * Subtle "demo mode" strip shown on system + legal pages when capture is off
 * (`!captureEnabled`). The server decides whether to mount it — this component
 * takes no env. Renders visible by default (matching SSR) and only hides after a
 * mount-time `sessionStorage` read, so there's no hydration mismatch.
 */
export function DemoBanner() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let dismissed = false
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      // sessionStorage can throw in private-mode / sandboxed contexts — ignore.
    }
    if (dismissed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read persisted dismissal on mount
      setHidden(true)
    }
  }, [])

  if (hidden) return null

  return (
    <div className="flex items-center gap-3 border-b border-border bg-[color-mix(in_srgb,var(--accent)_12%,var(--bg))] px-5 py-2.5 text-[13px] text-fg-2">
      <Settings aria-hidden className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      <span className="leading-snug">
        <strong className="font-semibold text-fg">Demo mode</strong> — forms work, but nothing is sent or
        stored. Add your env keys to go live.
      </span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          try {
            sessionStorage.setItem(DISMISS_KEY, '1')
          } catch {
            // ignore — dismissal just won't persist
          }
          setHidden(true)
        }}
        className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border bg-surface text-fg-2 transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <X aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}
