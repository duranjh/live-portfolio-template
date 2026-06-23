'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, FileText, FileCode2 } from 'lucide-react'

/**
 * Download chooser for an unlocked guide — a small menu with two options:
 *  • PDF: triggers `window.print()`; the print stylesheet renders a clean, chrome-free doc.
 *  • Markdown (advanced): downloads the raw `.md` source (title prepended) for AI tools / builders.
 * Only rendered for unlocked guides, so it never leaks gated content.
 */
export function GuideDownload({ slug, title, raw }: { slug: string; title: string; raw: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function downloadMarkdown() {
    const md = `# ${title}\n\n${raw.trim()}\n`
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}.md`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  return (
    <div ref={ref} className="guide-no-print relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-fg-2 transition-colors hover:border-accent hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Download className="h-3.5 w-3.5" aria-hidden /> Download
      </button>

      {open && (
        <div
          role="menu"
          className="animate-glass-in absolute right-0 top-[calc(100%+6px)] z-50 w-64 rounded-[13px] border border-border bg-raised p-1.5 shadow-[var(--shadow-pop)]"
        >
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false)
              window.print()
            }}
            className="flex w-full items-start gap-2.5 rounded-[9px] px-3 py-2 text-left transition-colors hover:bg-subtle"
          >
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <span>
              <span className="block text-[13px] font-medium text-fg">PDF</span>
              <span className="block text-[11px] text-fg-2">Clean, printable — for reading</span>
            </span>
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={downloadMarkdown}
            className="flex w-full items-start gap-2.5 rounded-[9px] px-3 py-2 text-left transition-colors hover:bg-subtle"
          >
            <FileCode2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <span>
              <span className="block text-[13px] font-medium text-fg">Markdown (advanced)</span>
              <span className="block text-[11px] text-fg-2">.md source — for AI tools &amp; builders</span>
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
