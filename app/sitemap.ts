import type { MetadataRoute } from 'next'
import { site } from '@/config/site'
import { allProjects, allGuides } from '@/lib/content'

/** Sitemap of the public, indexable routes (system + api routes are excluded). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.baseUrl
  const s = site.sections
  const routes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'weekly', priority: 1 },
  ]

  if (s.apps) {
    routes.push({ url: `${base}/projects`, changeFrequency: 'weekly', priority: 0.9 })
    for (const p of allProjects()) {
      routes.push({
        url: `${base}${p.url}`,
        lastModified: p.shippedDate ?? p.startDate,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }
  if (s.resume) routes.push({ url: `${base}/resume`, changeFrequency: 'monthly', priority: 0.8 })
  if (s.ideas) routes.push({ url: `${base}/ideas`, changeFrequency: 'weekly', priority: 0.6 })
  if (s.guides) {
    routes.push({ url: `${base}/guides`, changeFrequency: 'weekly', priority: 0.7 })
    for (const g of allGuides()) {
      routes.push({ url: `${base}${g.url}`, changeFrequency: 'monthly', priority: 0.6 })
    }
  }

  routes.push(
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  )
  return routes
}
