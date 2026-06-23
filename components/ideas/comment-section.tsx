'use client'

import { useId, useState } from 'react'
import { Loader2, MessageSquare } from 'lucide-react'
import type { PublicComment } from '@/lib/db/reads'
import { loadIdeaComments } from './actions'
import { CommentForm } from './comment-form'
import { formatDate } from './util'

/**
 * Comment toggle + lazy-loaded one-level thread + top-level form. Comments load on first
 * expand (cached after), so the board doesn't fan out reads on initial render. Bodies are
 * rendered as escaped plain text (React default) with `whitespace-pre-wrap`; no author is
 * shown (the sanitized view exposes none).
 */
export function CommentSection({ ideaId }: { ideaId: string }) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<PublicComment[] | null>(null)
  const [loading, setLoading] = useState(false)
  const regionId = useId()

  async function toggle() {
    const next = !open
    setOpen(next)
    if (next && comments === null && !loading) {
      setLoading(true)
      try {
        setComments(await loadIdeaComments(ideaId))
      } catch {
        setComments([])
      } finally {
        setLoading(false)
      }
    }
  }

  const count = comments?.length ?? null
  const roots = comments?.filter((c) => !c.parent_id) ?? []
  const repliesByParent = new Map<string, PublicComment[]>()
  comments?.forEach((c) => {
    if (!c.parent_id) return
    const arr = repliesByParent.get(c.parent_id) ?? []
    arr.push(c)
    repliesByParent.set(c.parent_id, arr)
  })

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={regionId}
        className="inline-flex items-center gap-1.5 text-xs text-fg-2 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
        {count === null ? 'Comments' : `${count} ${count === 1 ? 'comment' : 'comments'}`}
      </button>

      {open && (
        <div
          id={regionId}
          className="animate-glass-in mt-3 rounded-md border border-border bg-subtle p-4"
        >
          {loading ? (
            <p className="flex items-center gap-2 text-xs text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Loading…
            </p>
          ) : (
            <>
              {roots.length > 0 ? (
                <ul className="flex flex-col gap-4">
                  {roots.map((c) => {
                    const replies = repliesByParent.get(c.id) ?? []
                    return (
                      <li key={c.id}>
                        <Comment comment={c} />
                        {replies.length > 0 && (
                          <ul className="mt-3 flex flex-col gap-3 border-l border-border pl-4">
                            {replies.map((r) => (
                              <li key={r.id}>
                                <Comment comment={r} />
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-xs text-muted">No comments yet — start the discussion.</p>
              )}
              <div className="mt-4">
                <CommentForm ideaId={ideaId} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Comment({ comment }: { comment: PublicComment }) {
  return (
    <div>
      <time dateTime={comment.created_at} className="font-mono text-[10px] text-muted">
        {formatDate(comment.created_at)}
      </time>
      <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-fg-2">{comment.body}</p>
    </div>
  )
}
