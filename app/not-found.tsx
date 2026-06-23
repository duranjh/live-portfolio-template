import { Compass } from 'lucide-react'
import { SystemLink, SystemShell } from '@/components/legal/system-shell'

export default function NotFound() {
  return (
    <SystemShell
      tone="accent"
      icon={<Compass aria-hidden className="h-7 w-7" strokeWidth={1.75} />}
      title="Page not found"
      body="This page either moved on to ship something else, or never existed. Either way — let's get you back."
    >
      <div className="flex items-center gap-3">
        <SystemLink href="/">Back home</SystemLink>
        <span aria-hidden className="text-muted">
          ·
        </span>
        <SystemLink href="/projects">Browse the apps</SystemLink>
      </div>
    </SystemShell>
  )
}
