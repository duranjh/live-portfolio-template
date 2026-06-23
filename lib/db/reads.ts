import 'server-only'
import { db } from './client'
import type { IdeaStatus } from '@/components/ideas/util'

/**
 * Server-side reads (service-role). The board is served from the sanitized
 * `public_ideas` view — no PII ever reaches the client. Anon has no DB access; all
 * reads flow through here. Returns empty results in demo mode.
 */

export type PublicIdea = {
  id: string
  title: string
  body: string
  status: IdeaStatus
  vote_count: number
  comment_count: number
  built_project_slug: string | null
  created_at: string
}

export type PublicComment = {
  id: string
  parent_id: string | null
  body: string
  created_at: string
}

export async function getPublicIdeas(): Promise<PublicIdea[]> {
  const c = db()
  if (!c) return []
  const { data, error } = await c
    .from('public_ideas')
    .select('*')
    .order('vote_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) {
    console.error('[reads] getPublicIdeas', error)
    return []
  }
  return (data ?? []) as PublicIdea[]
}

export async function getIdeaById(
  id: string,
): Promise<(PublicIdea & { comments: PublicComment[] }) | null> {
  const c = db()
  if (!c) return null
  const { data } = await c.from('public_ideas').select('*').eq('id', id).maybeSingle()
  if (!data) return null
  const { data: comments } = await c
    .from('idea_comments')
    .select('id,parent_id,body,created_at')
    .eq('idea_id', id)
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: true })
  return { ...(data as PublicIdea), comments: (comments ?? []) as PublicComment[] }
}

/** Owner moderation queue: pending ideas + comments awaiting approval. */
export async function getModerationQueue(): Promise<{
  ideas: { id: string; title: string; body: string; created_at: string }[]
  comments: { id: string; idea_id: string; body: string; created_at: string }[]
}> {
  const c = db()
  if (!c) return { ideas: [], comments: [] }
  const ideas = await c
    .from('ideas')
    .select('id,title,body,created_at')
    .eq('moderation_status', 'pending')
    .order('created_at', { ascending: true })
  const comments = await c
    .from('idea_comments')
    .select('id,idea_id,body,created_at')
    .eq('moderation_status', 'pending')
    .order('created_at', { ascending: true })
  return {
    ideas: (ideas.data ?? []) as { id: string; title: string; body: string; created_at: string }[],
    comments: (comments.data ?? []) as {
      id: string
      idea_id: string
      body: string
      created_at: string
    }[],
  }
}
