import { Hand } from 'lucide-react'
import { unsubscribeAction } from '@/app/actions/confirm'
import { Button } from '@/components/ui/button'
import { SystemShell } from '@/components/legal/system-shell'

/** GET interstitial → POST, so a link scanner can't unsubscribe the user on prefetch. */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return (
    <SystemShell
      tone="accent"
      icon={<Hand aria-hidden className="h-7 w-7" strokeWidth={1.75} />}
      title="Unsubscribe?"
      body="Click below to stop receiving emails. No hard feelings."
    >
      <form action={unsubscribeAction} className="w-full">
        <input type="hidden" name="token" value={token ?? ''} />
        <Button type="submit" variant="secondary" className="w-full">
          Unsubscribe me
        </Button>
      </form>
    </SystemShell>
  )
}
