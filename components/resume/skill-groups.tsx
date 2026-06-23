import { Card } from '@/components/ui/card'
import type { SkillGroup } from './resume-data'

/**
 * Aggregated skills, grouped by focus (Engineering / Operating / Cross-cutting)
 * with an ×N count when a skill appears across multiple projects/roles. The design
 * export's named sub-groups aren't in the data model — focus is the honest grouping.
 */
export function SkillGroups({ groups }: { groups: SkillGroup[] }) {
  if (groups.length === 0) {
    return <p className="mt-4 text-sm text-muted">No skills to show yet.</p>
  }

  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      {groups.map((g) => (
        <Card key={g.label} variant="surface">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent">{g.label}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {g.items.map((it) => (
              <span
                key={it.name}
                className="rounded-full border border-border bg-subtle px-2.5 py-1 text-[13px] text-fg"
              >
                {it.name}
              </span>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
