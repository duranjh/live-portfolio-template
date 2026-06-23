import type { Project } from '@/lib/content'
import { ProjectCard } from '@/components/projects/card'

/**
 * Prev/next navigation between projects (order from `allProjects()`). Reuses the
 * shared ProjectCard tile with a directional eyebrow. Renders only the side(s)
 * that exist; nothing when the project has no neighbors (single-project demo).
 */
export function ProjectNav({ prev, next }: { prev?: Project; next?: Project }) {
  if (!prev && !next) return null

  return (
    <nav aria-label="More projects" className="mt-12 grid gap-3.5 sm:grid-cols-2">
      {prev && (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] text-muted">← Previous</p>
          <ProjectCard project={prev} />
        </div>
      )}
      {next && (
        <div className="flex flex-col gap-2">
          <p className="text-right font-mono text-[11px] text-muted">Next →</p>
          <ProjectCard project={next} />
        </div>
      )}
    </nav>
  )
}
