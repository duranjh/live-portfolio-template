'use client'

import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Copy-link / native-share button. Prefers the OS share sheet (mobile via `navigator.share`)
 * and falls back to copying the current URL to the clipboard with an inline "Copied"
 * confirmation. Sharing a link to a gated resource never bypasses its gate — access is
 * always re-verified server-side per request — so this is purely a convenience affordance.
 */
export function ShareButton({ title, className }: { title?: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  async function onShare() {
    const url = window.location.href
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: title ?? document.title, url })
        return
      } catch {
        // user cancelled or payload unsupported → fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked (rare) — no-op
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      aria-label="Share this page"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-fg-2 transition-colors hover:border-accent hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        className,
      )}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-accent" aria-hidden /> Copied
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" aria-hidden /> Share
        </>
      )}
    </button>
  )
}
