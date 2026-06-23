/**
 * Inline JSON-LD structured data. The payload is our own object, JSON.stringified — not
 * executable script — and the CSP allows inline scripts, so it renders cleanly for crawlers.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
