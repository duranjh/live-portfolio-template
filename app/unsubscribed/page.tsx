import { Check } from 'lucide-react'
import { SystemLink, SystemShell } from '@/components/legal/system-shell'

export default function UnsubscribedPage() {
  return (
    <SystemShell
      tone="success"
      icon={<Check aria-hidden className="h-7 w-7" strokeWidth={2} />}
      title="You're unsubscribed."
      body="You won't get further emails. Changed your mind? Re-subscribe anytime."
    >
      <SystemLink href="/">Re-subscribe</SystemLink>
    </SystemShell>
  )
}
