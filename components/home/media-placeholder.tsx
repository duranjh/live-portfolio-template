import Image from 'next/image'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The project "media" surface — a deep-indigo gradient with a diagonal-weave
 * overlay (the locked design language for app artwork). If the project supplies a
 * `cover` image it fills the frame instead; otherwise the gradient stands in, so the
 * page always looks finished even with zero media. Callers position chips/captions
 * via absolutely-placed `children`.
 */
export function MediaPlaceholder({
  cover,
  alt,
  aspect,
  sizes = '(min-width: 768px) 50vw, 100vw',
  className,
  children,
}: {
  cover?: string
  alt?: string
  aspect?: string
  sizes?: string
  className?: string
  children?: ReactNode
}) {
  const hasCover = typeof cover === 'string' && cover.length > 0
  return (
    <div
      className={cn('relative isolate overflow-hidden', aspect, className)}
      style={{
        backgroundImage:
          'linear-gradient(150deg, color-mix(in srgb, var(--accent) 50%, var(--accent-deep)), var(--accent-deep))',
      }}
    >
      {hasCover ? (
        <Image src={cover!} alt={alt ?? ''} fill sizes={sizes} className="object-cover" />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255,255,255,0.045) 0 14px, transparent 14px 28px)',
          }}
        />
      )}
      {children}
    </div>
  )
}

/** Centered geometric glyph + mono caption used inside placeholder media. */
export function MediaGlyph({ caption }: { caption: string }) {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center text-center">
      <div>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[16px] bg-accent shadow-[0_16px_40px_-10px_var(--accent)]">
          <span className="h-[18px] w-[18px] rounded-[6px] bg-accent-ink" />
        </span>
        <span className="mt-3 block font-mono text-[11px] uppercase tracking-[0.1em] text-white/70">
          {caption}
        </span>
      </div>
    </div>
  )
}
