/**
 * Date helpers for the Project detail page. Velite emits ISO date-only strings
 * ("2026-05-21"), which `new Date()` parses as UTC midnight — so we format in UTC
 * to avoid an off-by-one day in negative-offset timezones.
 */
const MONTH_YEAR = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})
const FULL_DATE = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

function parse(iso: string | undefined): Date | null {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "May 2026" — empty string for missing/invalid input. */
export function monthYear(iso?: string): string {
  const d = parse(iso)
  return d ? MONTH_YEAR.format(d) : ''
}

/** "May 21, 2026" — empty string for missing/invalid input. */
export function fullDate(iso?: string): string {
  const d = parse(iso)
  return d ? FULL_DATE.format(d) : ''
}
