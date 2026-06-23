'use server'

import { getIdeaById, type PublicComment } from '@/lib/db/reads'

/**
 * Lazy-load the approved comments for one idea — called from the client when a card's
 * comment thread is first expanded (keeps the board's initial render O(1), no N+1 across
 * up to 200 ideas). Reads only the sanitized `getIdeaById` view; returns `[]` in demo mode
 * or if the idea is gone. Returns comments only (not the whole idea) to avoid prop drift.
 */
export async function loadIdeaComments(ideaId: string): Promise<PublicComment[]> {
  const idea = await getIdeaById(ideaId)
  return idea?.comments ?? []
}
