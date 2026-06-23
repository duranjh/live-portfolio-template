import { Check } from 'lucide-react'
import { SystemLink, SystemShell } from '@/components/legal/system-shell'

export default function ConfirmedPage() {
  return (
    <SystemShell
      tone="success"
      icon={<Check aria-hidden className="h-7 w-7" strokeWidth={2} />}
      title="You're all set!"
      body="Your email's confirmed — I'll reach out when something ships."
    >
      <div className="flex items-center gap-3">
        <SystemLink href="/projects">Browse the apps</SystemLink>
        <span aria-hidden className="text-muted">
          ·
        </span>
        <SystemLink href="/">Back home</SystemLink>
      </div>
    </SystemShell>
  )
}
