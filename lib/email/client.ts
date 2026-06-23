import 'server-only'
import { Resend } from 'resend'
import { captureEnabled, env } from '@/lib/env'

/**
 * Mailer interface with two adapters: a console adapter in demo mode (zero secrets —
 * "sends" are logged, never delivered) and Resend when keys are present. Swapping the
 * email provider is this one file.
 */

export type MailMessage = {
  to: string
  subject: string
  html: string
  text?: string
  headers?: Record<string, string>
}

export interface Mailer {
  send(msg: MailMessage): Promise<void>
}

const consoleMailer: Mailer = {
  async send(msg) {
    console.log(`[mail:demo] → ${msg.to} | ${msg.subject}`)
  },
}

function resendMailer(apiKey: string, from: string): Mailer {
  const resend = new Resend(apiKey)
  return {
    async send(msg) {
      const { error } = await resend.emails.send({
        from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        headers: msg.headers,
      })
      if (error) throw new Error(`resend: ${error.message}`)
    },
  }
}

let cached: Mailer | undefined

export function mailer(): Mailer {
  if (cached) return cached
  cached =
    captureEnabled && env ? resendMailer(env.RESEND_API_KEY, env.MAIL_FROM) : consoleMailer
  return cached
}
