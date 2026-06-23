/**
 * Honeypot field — the cheapest first line against naive bots.
 *
 * The form renders a visually-hidden input with this name that real users never
 * fill. Any submission with a non-empty value is treated as a bot. Safe to
 * import from client code (it only exposes the field name).
 */

export const HONEYPOT_FIELD = 'company_url'

export function honeypotTripped(formData: FormData): boolean {
  const v = formData.get(HONEYPOT_FIELD)
  return typeof v === 'string' && v.trim().length > 0
}
