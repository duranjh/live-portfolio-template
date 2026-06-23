'use client'

import { useState } from 'react'
import { Toc } from '@/components/ui/toc'
import { ProjectCard } from '@/components/projects/card'
import type { ResumeData, View } from './resume-data'
import { ResumeHero } from './resume-hero'
import { SkillGroups } from './skill-groups'
import { ExperienceTimeline } from './experience-timeline'
import { CurrentlyNext } from './currently-next'
import { ResumePrint } from './resume-print'

/**
 * Client island for the Resume page. Holds the active lens, seeded from the
 * server-validated `initialView` (NOT `useSearchParams`, which would force a
 * Suspense boundary and risk a hydration mismatch). Toggling re-emphasises the
 * SAME page client-side and syncs `?view=` via `history.replaceState` — shareable
 * URL, no scroll jump, no server round-trip.
 *
 * The section <h2> headings stay mounted across toggles (only the per-view content
 * divs are keyed for the cross-fade), so the shared <Toc>'s mount-time
 * IntersectionObserver keeps tracking the live heading nodes.
 */
export function ResumeView({ data, initialView }: { data: ResumeData; initialView: View }) {
  const [view, setView] = useState<View>(() => initialView)

  function onSelect(v: View) {
    setView(v)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `?view=${v}`)
    }
  }

  const vm = data.views[view]
  const showSelectedWork = view === 'business' && vm.selectedWork.length > 0

  return (
    <div className="resume-root">
      <ResumeHero
        view={view}
        onSelect={onSelect}
        lensTag={vm.lensTag}
        followTarget={data.followTarget}
      />

      <p aria-live="polite" className="sr-only">
        Showing {vm.lensTag}.
      </p>

      <div className="resume-grid mt-12 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="resume-no-print hidden lg:block">
          <div className="sticky top-20">
            <Toc />
          </div>
        </aside>

        <div data-toc className="flex min-w-0 flex-col gap-14">
          <section id="skills" aria-labelledby="resume-skills-h" className="scroll-mt-20">
            <div className="flex items-baseline gap-3">
              <h2 id="resume-skills-h" className="text-2xl font-semibold tracking-tight">
                Skills
              </h2>
              <span className="font-mono text-[11px] text-muted">{vm.skillsHint}</span>
            </div>
            <div key={view} className="animate-fade-up">
              <SkillGroups groups={vm.skillGroups} />
            </div>
          </section>

          <section id="experience" aria-labelledby="resume-exp-h" className="scroll-mt-20">
            <h2 id="resume-exp-h" className="text-2xl font-semibold tracking-tight">
              Experience
            </h2>
            <div key={view} className="animate-fade-up">
              <ExperienceTimeline spine={vm.spine} />
              {showSelectedWork && (
                <div className="mt-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    Project highlights
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {vm.selectedWork.map((p) => (
                      <ProjectCard key={p.slug} project={p} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <CurrentlyNext currently={data.currently} nextUp={data.nextUp} />
        </div>
      </div>

      {/* Clean ATS PDF — hidden on screen; the print stylesheet reveals only this. */}
      <ResumePrint data={data} view={view} />
    </div>
  )
}
