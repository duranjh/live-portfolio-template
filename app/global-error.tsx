'use client'

/**
 * Last-resort boundary — replaces the ROOT layout when the layout itself throws, so it must
 * render its own <html>/<body> and can rely on NOTHING (no theme tokens, no shared components).
 * Inline styles only, light palette. Rare; the per-segment `error.tsx` handles the common case.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          background: '#fbfafd',
          color: '#1a1a22',
        }}
      >
        <div style={{ maxWidth: 440, padding: 36, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 12px' }}>Something went wrong</h1>
          <p style={{ fontSize: 15, lineHeight: 1.5, color: '#55555f', margin: '0 0 24px' }}>
            A hiccup on our end. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: '1px solid #ddd',
              background: '#fff',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#999', marginTop: 16 }}>
              ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
