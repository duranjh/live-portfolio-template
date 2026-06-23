import { ImageOff } from 'lucide-react'

/** Empty state for the media gallery — shown when a project has no gallery items. */
export function MediaEmpty({ title }: { title: string }) {
  return (
    <div className="mt-5 rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-md border border-border bg-accent-soft">
        <ImageOff className="h-5 w-5 text-accent" aria-hidden="true" />
      </div>
      <p className="mt-3.5 text-[17px] font-semibold">No media yet.</p>
      <p className="mx-auto mt-1.5 max-w-[40ch] text-[13px] leading-relaxed text-fg-2">
        Build-progress shots and the live demo will appear here as {title} takes shape. Follow the app to
        get them as they land.
      </p>
    </div>
  )
}
