import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Guide cover — a real image when `cover` is set, otherwise the indigo gradient
 * placeholder (the template ships coverless, so this is the demo default). Optional
 * category chip overlays the top-left. Shared by the index card (16/9) and the detail
 * hero (21/9); the caller supplies rounding/border via `className`.
 *
 * Remote cover URLs need `remotePatterns` in next.config (same caveat as ProjectCard);
 * local `/public` covers work out of the box.
 */
export function GuideCover({
  cover,
  category,
  aspectRatio = '16 / 9',
  sizes = '(max-width: 640px) 100vw, 50vw',
  priority = false,
  className,
}: {
  cover?: string
  category?: string
  aspectRatio?: string
  sizes?: string
  priority?: boolean
  className?: string
}) {
  return (
    <div className={cn('relative overflow-hidden bg-subtle', className)} style={{ aspectRatio }}>
      {cover ? (
        <Image src={cover} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(150deg, color-mix(in srgb, var(--accent) 50%, var(--accent-deep)), var(--accent-deep))',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 13px, transparent 13px 26px)',
            }}
          />
        </>
      )}
      {category && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-accent-ink">
          {category}
        </span>
      )}
    </div>
  )
}
