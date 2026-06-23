import type { MetadataRoute } from 'next'
import { site } from '@/config/site'

/** Minimal web manifest. The template ships no icon files — a forker adds favicon/icons. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.bioShort,
    start_url: '/',
    display: 'standalone',
    background_color: '#fbfafd',
    theme_color: '#5b53d6',
  }
}
