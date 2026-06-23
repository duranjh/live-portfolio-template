import Link from 'next/link'
import { Hourglass } from 'lucide-react'
import { SystemShell } from '@/components/legal/system-shell'

export default function LinkInvalidPage() {
  return (
    <SystemShell
      tone="warn"
      icon={<Hourglass aria-hidden className="h-7 w-7" strokeWidth={1.75} />}
      title="This link has expired"
      body="For your security, confirmation links expire after a while. Request a fresh one below."
    >
      <Link
        href="/"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink shadow-[0_8px_18px_-8px_var(--accent)] transition-[filter] duration-150 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Request a new link
      </Link>
    </SystemShell>
  )
}
