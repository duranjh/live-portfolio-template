import { site } from '@/config/site'
import { allProjects } from '@/lib/content'

/** RSS 2.0 feed of shipped/in-progress work (the build-in-public log). Static-friendly. */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function GET() {
  const base = site.baseUrl
  const items = allProjects()
    .slice(0, 30)
    .map((p) => {
      const when = p.shippedDate ?? p.startDate
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${base}${p.url}</link>
      <guid isPermaLink="true">${base}${p.url}</guid>
      <description>${escapeXml(p.summary)}</description>
      ${when ? `<pubDate>${new Date(when).toUTCString()}</pubDate>` : ''}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${base}</link>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(site.bioShort)}</description>
    <language>en</language>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
