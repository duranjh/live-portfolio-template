import type { Metadata } from 'next'
import { site } from '@/config/site'
import { allProjects, allExperience } from '@/lib/content'
import { buildResumeData, isView } from '@/components/resume/resume-data'
import { ResumeView } from '@/components/resume/resume-view'

export const metadata: Metadata = {
  title: 'Resume',
  description: site.bioShort,
}

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>
}) {
  const { view } = await searchParams
  const raw = Array.isArray(view) ? view[0] : view
  const initialView = isView(raw) ? raw : 'technical'

  const data = buildResumeData(allProjects(), allExperience())

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <ResumeView data={data} initialView={initialView} />
    </div>
  )
}
