/** Date helpers for the home page. Dates arrive as ISO strings at UTC midnight,
 * so we format in UTC to keep the calendar day stable across server timezones. */

export function monthYear(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function fullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** Whole days since an ISO date (min 1) — for "building · day N". */
export function daysSince(iso: string): number {
  const diff = Date.now() - new Date(iso).getTime()
  return Math.max(1, Math.round(diff / 86_400_000))
}
