import Image from 'next/image'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The locked media-placeholder surface (indigo gradient + diagonal weave), with a
 * real `next/image` overlaid when a src is present. Fills its nearest positioned
 * ancestor — wrap it in a `relative` aspect-ratio container. Remote srcs need
 * `remotePatterns` in next.config (matches ProjectCard's convention); the demo
 * ships image-free, so the gradient shows and the build stays green.
 */
export function MediaTile({
  src,
  type = 'image',
  alt = '',
  label,
  mix = 46,
  sizes = '(max-width: 768px) 50vw, 33vw',
  className,
}: {
  src?: string
  type?: 'image' | 'video'
  alt?: string
  /** Overlay label (mono, bottom-left), e.g. the gallery caption. */
  label?: string
  /** color-mix percentage of accent over --accent-deep (varies the tile hue). */
  mix?: number
  sizes?: string
  className?: string
}) {
  const hasImage = typeof src === 'string' && src.length > 0
  return (
    <div
      className={cn('absolute inset-0 overflow-hidden', className)}
      style={{
        background: `linear-gradient(150deg, color-mix(in srgb, var(--accent) ${mix}%, var(--accent-deep)), var(--accent-deep))`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 12px, transparent 12px 24px)',
        }}
        aria-hidden="true"
      />
      {hasImage && (
        <Image src={src!} alt={alt} fill sizes={sizes} className="object-cover" />
      )}
      {type === 'video' && (
        <span className="glass absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full">
          <Play className="h-4 w-4 translate-x-px fill-white text-white" aria-hidden="true" />
        </span>
      )}
      {label && (
        <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.06em] text-white/80">
          {label}
        </span>
      )}
    </div>
  )
}
