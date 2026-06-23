import 'server-only'
import { mailer } from './client'
import { requireCaptureEnv } from '@/lib/env'

/**
 * Transactional email senders. Plain typed HTML for now (functional + dependency-light);
 * can be upgraded to React Email templates behind these same functions without touching
 * callers. All user-supplied content is HTML-escaped before interpolation.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function layout(heading: string, inner: string): string {
  return `<!doctype html><html><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#fafafa;margin:0;padding:24px;color:#111">
  <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #eee">
    <tr><td>
      <h1 style="font-size:18px;margin:0 0 12px">${escapeHtml(heading)}</h1>
      ${inner}
    </td></tr>
  </table>
</body></html>`
}

/** RFC 8058 one-click endpoint derived from the human unsubscribe URL. */
function oneClickUrl(unsubUrl: string): string {
  return unsubUrl.replace('/unsubscribe?', '/api/unsubscribe?')
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">${escapeHtml(label)}</a>`
}

/** Double opt-in confirmation. The confirm link points at an interstitial (GET → POST). */
export async function sendConfirmation(
  to: string,
  confirmUrl: string,
  unsubUrl: string,
): Promise<void> {
  const html = layout(
    'Confirm your email',
    `<p style="margin:0 0 20px;line-height:1.5">Tap below to confirm — this proves the address is yours. The link expires in 24 hours.</p>
     <p style="margin:0 0 24px">${button(confirmUrl, 'Confirm my email')}</p>
     <p style="margin:0;font-size:12px;color:#888">If you didn't request this, you can ignore this email.</p>`,
  )
  await mailer().send({
    to,
    subject: 'Confirm your email',
    html,
    headers: {
      'List-Unsubscribe': `<${oneClickUrl(unsubUrl)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })
}

export async function sendWelcome(to: string, unsubUrl: string): Promise<void> {
  const html = layout(
    "You're in 🎉",
    `<p style="margin:0 0 16px;line-height:1.5">Thanks for confirming — you'll get updates as things ship.</p>
     <p style="margin:0;font-size:12px;color:#888">Don't want these? <a href="${unsubUrl}">Unsubscribe</a>.</p>`,
  )
  await mailer().send({
    to,
    subject: "You're confirmed",
    html,
    headers: {
      'List-Unsubscribe': `<${oneClickUrl(unsubUrl)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })
}

/** Pings the owner when a new idea is submitted (so they can moderate quickly). */
export async function sendOwnerIdeaNotification(title: string, body: string): Promise<void> {
  const owner = requireCaptureEnv().OWNER_EMAIL
  const html = layout(
    'New idea submitted',
    `<p style="margin:0 0 8px;font-weight:600">${escapeHtml(title)}</p>
     <p style="margin:0 0 16px;line-height:1.5;white-space:pre-wrap">${escapeHtml(body)}</p>
     <p style="margin:0;font-size:12px;color:#888">Review it in your admin / Supabase dashboard.</p>`,
  )
  await mailer().send({ to: owner, subject: `New idea: ${title}`, html })
}

/**
 * One broadcast email to a segment recipient. The body is owner-authored plain text, escaped +
 * `white-space:pre-wrap` (so the trusted admin can't break the markup and line breaks survive).
 * Carries a stateless one-click unsubscribe.
 */
export async function sendBroadcast(
  to: string,
  subject: string,
  bodyText: string,
  unsubUrl: string,
): Promise<void> {
  const html = layout(
    subject,
    `<div style="line-height:1.55;white-space:pre-wrap">${escapeHtml(bodyText)}</div>
     <p style="margin:24px 0 0;font-size:12px;color:#888">You're receiving this because you subscribed. <a href="${unsubUrl}">Unsubscribe</a>.</p>`,
  )
  await mailer().send({
    to,
    subject,
    html,
    headers: {
      'List-Unsubscribe': `<${oneClickUrl(unsubUrl)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })
}
