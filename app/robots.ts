import type { MetadataRoute } from 'next'
import { site } from '@/config/site'

/** Allow indexing of public content; keep the capture/system + api routes out of search. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/confirm',
        '/confirmed',
        '/unsubscribe',
        '/unsubscribed',
        '/link-invalid',
      ],
    },
    sitemap: `${site.baseUrl}/sitemap.xml`,
    host: site.baseUrl,
  }
}
