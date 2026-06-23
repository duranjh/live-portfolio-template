import { MailCheck } from 'lucide-react'
import { confirmAction } from '@/app/actions/confirm'
import { Button } from '@/components/ui/button'
import { SystemShell } from '@/components/legal/system-shell'

/**
 * GET interstitial — performs NO mutation, so email-client/link-scanner prefetch can't
 * auto-confirm. The actual confirmation happens on the POST when the human clicks.
 */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return (
    <SystemShell
      tone="accent"
      icon={<MailCheck aria-hidden className="h-7 w-7" strokeWidth={1.75} />}
      title="Confirm your email"
      body="One quick step — click below to confirm and start getting updates."
    >
      <form action={confirmAction} className="w-full">
        <input type="hidden" name="token" value={token ?? ''} />
        <Button type="submit" variant="primary" className="w-full">
          Confirm my email
        </Button>
      </form>
    </SystemShell>
  )
}
