import { defineConfig, defineCollection, s } from 'velite'

/**
 * Content layer. Typed MDX collections under `content/`. Velite validates
 * frontmatter (a forker gets clear errors on a typo) and compiles MDX. Output is
 * the typed `.velite/` data, imported via the `#site/content` path alias.
 */

const projects = defineCollection({
  name: 'Project',
  pattern: 'projects/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      slug: s.slug('projects'),
      summary: s.string().max(280),
      status: s.enum(['shipped', 'building', 'planned']),
      startDate: s.isodate(),
      shippedDate: s.isodate().optional(),
      tech: s.array(s.string()).default([]),
      skills: s.array(s.string()).default([]),
      focus: s.enum(['technical', 'business', 'both']).default('technical'),
      /** Your role on this project, shown on the resume timeline (default "Founder & Maker"). */
      role: s.string().optional(),
      links: s
        .object({
          live: s.string().optional(),
          repo: s.string().optional(),
          demo: s.string().optional(),
          video: s.string().optional(),
        })
        .default({}),
      ideaSource: s
        .object({ url: s.string().optional(), credit: s.string().optional() })
        .optional(),
      cover: s.string().optional(),
      featured: s.boolean().default(false),
      gallery: s
        .array(
          s.object({
            type: s.enum(['image', 'video']),
            src: s.string(),
            caption: s.string().optional(),
            phase: s.enum(['build', 'live']).default('live'),
            date: s.isodate().optional(),
          }),
        )
        .default([]),
      draft: s.boolean().default(false),
      updates: s
        .array(
          s.object({
            date: s.isodate(),
            note: s.string(),
            milestone: s.boolean().default(false),
          }),
        )
        .default([]),
      body: s.mdx(),
    })
    .transform((data) => ({ ...data, url: `/projects/${data.slug}` })),
})

const guides = defineCollection({
  name: 'Guide',
  pattern: 'guides/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      slug: s.slug('guides'),
      summary: s.string().max(280),
      cover: s.string().optional(),
      category: s.string().optional(),
      tags: s.array(s.string()).default([]),
      tier: s.enum(['free', 'premium']).default('free'),
      teaser: s.string().optional(),
      gated: s.boolean().default(true),
      order: s.number().default(0),
      body: s.mdx(),
      /** Raw markdown source (frontmatter stripped) — powers the .md download. */
      raw: s.raw(),
    })
    .transform((data) => ({ ...data, url: `/guides/${data.slug}` })),
})

const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      slug: s.slug('posts'),
      date: s.isodate(),
      summary: s.string().max(280),
      tags: s.array(s.string()).default([]),
      draft: s.boolean().default(false),
      body: s.mdx(),
    })
    .transform((data) => ({ ...data, url: `/blog/${data.slug}` })),
})

const legal = defineCollection({
  name: 'Legal',
  pattern: 'legal/**/*.mdx',
  schema: s.object({
    title: s.string(),
    slug: s.slug('legal'),
    version: s.string(),
    effectiveDate: s.isodate(),
    lastUpdated: s.isodate(),
    body: s.mdx(),
  }),
})

const experience = defineCollection({
  name: 'Experience',
  pattern: 'experience/**/*.mdx',
  schema: s.object({
    role: s.string().max(160),
    company: s.string().max(160),
    start: s.isodate(),
    end: s.isodate().optional(), // omit = "Present"
    location: s.string().max(120).optional(),
    employmentType: s.string().max(120).optional(),
    summary: s.string().max(500),
    skills: s.array(s.string()).default([]),
    focus: s.enum(['technical', 'business', 'both']).default('business'),
    order: s.number().default(0),
    body: s.mdx(),
  }),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    clean: true,
  },
  collections: { projects, guides, posts, legal, experience },
})
