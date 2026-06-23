import * as runtime from 'react/jsx-runtime'
import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Render Velite-compiled MDX (project / guide / legal `.body`). The body is a string
 * of compiled JS that takes the jsx runtime as `arguments[0]`. We run it via
 * `new Function` — which executes SERVER-SIDE ONLY (this is a Server Component), so the
 * browser never evals anything and the static CSP holds. The compiled content is a
 * stateless function we invoke directly (no hooks, no client state). Shared by §D/§G/§H.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MDXComponents = Record<string, ComponentType<any>>

function renderMDX(code: string, components: MDXComponents): ReactNode {
  const fn = new Function(code)
  const content = fn(runtime).default as (props: { components?: MDXComponents }) => ReactNode
  return content({ components })
}

// Element overrides: token styling comes from `.prose-lp`; links are made safe.
const mdxComponents: MDXComponents = {
  a: ({ href = '', ...rest }: ComponentPropsWithoutRef<'a'>) => {
    const h = String(href)
    return /^https?:\/\//.test(h) ? (
      <a href={h} target="_blank" rel="noopener noreferrer" {...rest} />
    ) : (
      <Link href={h} {...rest} />
    )
  },
}

export function MDXContent({ code, className }: { code: string; className?: string }) {
  return <div className={cn('prose-lp', className)}>{renderMDX(code, mdxComponents)}</div>
}
