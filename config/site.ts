/**
 * Central site config — the ONE place a forker personalizes the template.
 * Edit this file + the `content/**` MDX, and never touch components. Ships with
 * placeholder values; no personal data lives in the template repo. Secrets
 * (OWNER_EMAIL, provider keys) stay in `.env`, never here.
 */

export type SocialLink = { label: string; href: string; icon: string }

export type SiteConfig = {
  name: string
  handle: string
  tagline: string
  bioShort: string
  bioLong: string
  /** Canonical site origin (no trailing slash). */
  baseUrl: string
  /** Label for the showcased entity — change to Projects / Work / Experiences. */
  entityLabel: { singular: string; plural: string }
  theme: { accent: string; default: 'light' | 'dark' | 'system' }
  /** Which sections/tabs are shown. */
  sections: {
    home: boolean
    apps: boolean
    resume: boolean
    ideas: boolean
    guides: boolean
    blog: boolean
  }
  socials: SocialLink[]
  /** Contact line for the downloadable resume PDF. Placeholders by default; the owner
   *  fills these in their own deployment — never committed to the public template. */
  resume: { location: string; phone: string; email: string; linkedin: string }
}

export const site: SiteConfig = {
  name: '[Your Name]',
  handle: '@yourhandle',
  tagline: 'I ship a new app every month — this is the live log.',
  bioShort: 'Builder shipping in public.',
  bioLong:
    'Replace this with a couple of sentences about who you are, what you build, ' +
    'and why someone should follow along. This text appears on the home hero and ' +
    'the top of your resume page.',
  baseUrl: 'https://example.com',
  entityLabel: { singular: 'App', plural: 'Apps' },
  theme: { accent: 'violet', default: 'light' },
  sections: {
    home: true,
    apps: true,
    resume: true,
    ideas: true,
    guides: true,
    blog: false,
  },
  // Full roster ships visible by default (a showcase of what's possible) — delete the
  // lines you don't use. Each `icon` maps to a real brand icon in the footer.
  socials: [
    { label: 'GitHub', href: 'https://github.com/yourhandle', icon: 'github' },
    { label: 'X', href: 'https://x.com/yourhandle', icon: 'x' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/yourhandle', icon: 'linkedin' },
    { label: 'Instagram', href: 'https://instagram.com/yourhandle', icon: 'instagram' },
    { label: 'YouTube', href: 'https://youtube.com/@yourhandle', icon: 'youtube' },
    { label: 'TikTok', href: 'https://tiktok.com/@yourhandle', icon: 'tiktok' },
    { label: 'Twitch', href: 'https://twitch.tv/yourhandle', icon: 'twitch' },
    { label: 'Discord', href: 'https://discord.gg/yourinvite', icon: 'discord' },
    { label: 'Bluesky', href: 'https://bsky.app/profile/yourhandle.bsky.social', icon: 'bluesky' },
    { label: 'Mastodon', href: 'https://mastodon.social/@yourhandle', icon: 'mastodon' },
    { label: 'Threads', href: 'https://threads.net/@yourhandle', icon: 'threads' },
    { label: 'Email', href: 'mailto:you@example.com', icon: 'email' },
  ],
  resume: {
    location: 'City, ST',
    phone: '(555) 123-4567',
    email: 'you@example.com',
    linkedin: 'linkedin.com/in/yourhandle',
  },
}

/** Derived nav (respects section toggles). Labels honor the entity label. */
export function navItems() {
  const s = site.sections
  const items: { href: string; label: string }[] = []
  if (s.apps) items.push({ href: '/projects', label: site.entityLabel.plural })
  if (s.ideas) items.push({ href: '/ideas', label: 'Ideas' })
  if (s.guides) items.push({ href: '/guides', label: 'Guides' })
  if (s.resume) items.push({ href: '/resume', label: 'Resume' })
  if (s.blog) items.push({ href: '/blog', label: 'Blog' })
  return items
}
