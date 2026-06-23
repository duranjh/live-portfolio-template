import { Lightbulb, ArrowRight } from 'lucide-react'
import type { Project } from '@/lib/content'
import { Card } from '@/components/ui/card'

/**
 * Idea-credit block — only renders when the project records an `ideaSource`
 * (the demo ships none). Links to the idea thread only when a url is present.
 */
export function IdeaCredit({ source }: { source: Project['ideaSource'] }) {
  if (!source || (!source.credit && !source.url)) return null

  return (
    <Card variant="accent" className="mt-10 flex items-center gap-3.5">
      <Lightbulb className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
      <p className="flex-1 text-sm leading-relaxed text-fg-2">
        {source.credit ? (
          <>
            Idea by <span className="font-semibold text-accent">{source.credit}</span> — from the public
            idea board.
          </>
        ) : (
          <>From the public idea board.</>
        )}
      </p>
      {source.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-sm text-[13px] font-medium text-accent transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          View idea thread
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      )}
    </Card>
  )
}
