import type { Metadata } from 'next'
import { Lightbulb } from 'lucide-react'
import { getPublicIdeas } from '@/lib/db/reads'
import { IdeaCard } from '@/components/ideas/idea-card'
import { IdeasExplorer, type IdeaItem } from '@/components/ideas/ideas-explorer'
import { SubmitIdea } from '@/components/ideas/submit-idea'

export const metadata: Metadata = {
  title: 'Ideas',
  description: 'Suggest what I should build next — and vote on the ideas you want most.',
}

export default async function IdeasPage() {
  // Sanitized, PII-stripped board read. `[]` in demo mode → empty state.
  const all = await getPublicIdeas()
  const items: IdeaItem[] = all.map((idea, i) => ({
    meta: {
      id: idea.id,
      search: `${idea.title} ${idea.body}`.toLowerCase(),
      votes: idea.vote_count,
      comments: idea.comment_count,
      created: new Date(idea.created_at).getTime(),
      status: idea.status,
    },
    node: <IdeaCard idea={idea} index={i} />,
  }))

  return (
    <div className="pb-24">
      <section className="mx-auto max-w-6xl px-5 pt-12 pb-8 sm:pt-16">
        <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-accent-soft px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
          Idea board · community
        </span>
        <h1 className="animate-fade-up mt-4 text-4xl font-semibold leading-[1.04] tracking-[-0.035em] text-fg sm:text-5xl">
          What should I build next?
        </h1>
        <p className="animate-fade-up mt-3 max-w-[52ch] text-lg leading-relaxed text-fg-2">
          Suggest what I should build next — vote on the ideas you want most. The top ones become real
          apps, in public.
        </p>
        <div className="animate-fade-up mt-6">
          <SubmitIdea />
        </div>
      </section>

      {items.length > 0 ? (
        <IdeasExplorer items={items} />
      ) : (
        <section className="mx-auto max-w-6xl px-5 pt-6">
          <div className="mx-auto max-w-lg rounded-[18px] border border-dashed border-border bg-surface px-7 py-14 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border bg-accent-soft text-accent">
              <Lightbulb className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.01em] text-fg">
              No ideas yet — be the first.
            </h2>
            <p className="mx-auto mt-2 max-w-[38ch] text-sm leading-relaxed text-fg-2">
              Got something you wish existed? Suggest it. If it gets traction, I&apos;ll build it in the
              open and credit you.
            </p>
            <div className="mt-6 flex justify-center">
              <SubmitIdea />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
