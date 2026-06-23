import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjectBySlug, allProjects } from '@/lib/content'
import { site } from '@/config/site'
import { MDXContent } from '@/components/mdx-content'
import { ProjectHero } from '@/components/projects/detail/project-hero'
import { MetaSidebar } from '@/components/projects/detail/meta-sidebar'
import { ProjectGallery } from '@/components/projects/detail/project-gallery'
import { MediaEmpty } from '@/components/projects/detail/media-empty'
import { IdeaCredit } from '@/components/projects/detail/idea-credit'
import { UpdatesLog } from '@/components/projects/detail/updates-log'
import { ProjectNav } from '@/components/projects/detail/project-nav'
import { JsonLd } from '@/components/seo/json-ld'

type Params = Promise<{ slug: string }>

/** Pre-render every shippable project (drafts excluded by `allProjects` in prod). */
export function generateStaticParams() {
  return allProjects().map((p) => ({ slug: p.slug }))
}

function isAbsolute(src: string) {
  return src.startsWith('/') || /^https?:\/\//.test(src)
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return {}

  const cover = project.cover && isAbsolute(project.cover) ? project.cover : undefined
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: project.url },
    openGraph: {
      type: 'article',
      url: `${site.baseUrl}${project.url}`,
      title: project.title,
      description: project.summary,
      ...(cover ? { images: [cover] } : {}),
    },
  }
}

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  // Prev/next follow `allProjects()` order (newest first): older = prev, newer = next.
  const list = allProjects()
  const i = list.findIndex((p) => p.slug === project.slug)
  const prev = i >= 0 ? list[i + 1] : undefined
  const next = i >= 0 ? list[i - 1] : undefined

  const hasMedia = project.gallery.length > 0

  const workLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    url: `${site.baseUrl}${project.url}`,
    author: { '@type': 'Person', name: site.name },
    ...(project.shippedDate ? { datePublished: project.shippedDate } : {}),
  }

  return (
    <div className="mx-auto max-w-6xl px-5">
      <JsonLd data={workLd} />
      <ProjectHero project={project} />

      <div className="grid grid-cols-1 gap-6 py-10 lg:grid-cols-[272px_minmax(0,1fr)] lg:items-start lg:gap-10 lg:py-16">
        <MetaSidebar project={project} />

        <div className="min-w-0">
          <article data-toc>
            <MDXContent code={project.body} />
          </article>

          <section className="mt-12">
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-semibold tracking-tight">Media</h2>
              {hasMedia && <span className="font-mono text-[11px] text-muted">click to enlarge</span>}
            </div>
            {hasMedia ? (
              <ProjectGallery gallery={project.gallery} />
            ) : (
              <MediaEmpty title={project.title} />
            )}
          </section>

          <IdeaCredit source={project.ideaSource} />
          <UpdatesLog updates={project.updates} />
          <ProjectNav prev={prev} next={next} />
        </div>
      </div>
    </div>
  )
}
