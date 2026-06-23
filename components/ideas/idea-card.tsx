import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { PublicIdea } from '@/lib/db/reads'
import { Badge } from '@/components/ui/badge'
import { CommentSection } from './comment-section'
import { VoteButton } from './vote-button'
import { formatDate, STATUS_META } from './util'

/**
 * Idea card shell (Server Component). Renders only sanitized `public_ideas` fields — no
 * author/handle (PII). Interactivity lives in the client islands it embeds (VoteButton,
 * CommentSection). UGC (`title`, `body`) is React-escaped + `whitespace-pre-wrap`.
 */
export function IdeaCard({ idea, index = 0 }: { idea: PublicIdea; index?: number }) {
  const meta = STATUS_META[idea.status]
  const slug = idea.built_project_slug?.trim()

  return (
    <li
      className="animate-fade-up overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-accent"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <div className="flex gap-4 p-4 sm:p-5">
        <VoteButton ideaId={idea.id} voteCount={idea.vote_count} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge tone={meta.tone} dot={!!meta.pulse}>
              {meta.label}
            </Badge>
            {slug && (
              <Link
                href={`/projects/${slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                View app <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            )}
          </div>

          <h3 className="mt-2.5 text-base font-semibold leading-snug tracking-[-0.01em] text-fg">
            {idea.title}
          </h3>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-fg-2">{idea.body}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <time dateTime={idea.created_at} className="font-mono text-[11px] text-muted">
              {formatDate(idea.created_at)}
            </time>
          </div>

          <CommentSection ideaId={idea.id} />
        </div>
      </div>
    </li>
  )
}
