'use client'

import Script from 'next/script'

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

/**
 * Cloudflare Turnstile. When `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set, loads the CF script
 * and renders the widget — CF injects the hidden `cf-turnstile-response` token into the
 * enclosing <form> on completion (the Server Action verifies it). When unset (demo /
 * unconfigured), renders only the cookieless disclosure — no third-party script. Drop
 * inside any capture <form>.
 */
export function Turnstile({ className }: { className?: string }) {
  if (!siteKey) {
    return (
      <p className={className ?? 'text-[11px] text-muted'}>
        Protected by Cloudflare Turnstile. Cookieless — we never sell your data.
      </p>
    )
  }
  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div className="cf-turnstile" data-sitekey={siteKey} data-theme="auto" />
      <p className="mt-1.5 text-[11px] text-muted">Protected by Cloudflare Turnstile. Cookieless.</p>
    </div>
  )
}
