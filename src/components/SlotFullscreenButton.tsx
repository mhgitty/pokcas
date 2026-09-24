'use client'

import { useEffect, useState } from 'react'

export function SlotFullscreenButton({ targetId }: { targetId: string }) {
  const [fixed, setFixed] = useState(false)

  // Apply/remove the CSS fill-the-viewport fallback.
  useEffect(() => {
    const el = document.getElementById(targetId)
    if (!el) return
    if (fixed) {
      el.classList.add('slot-demo-fixed')
      document.body.style.overflow = 'hidden'
    } else {
      el.classList.remove('slot-demo-fixed')
      document.body.style.overflow = ''
    }
    return () => {
      el.classList.remove('slot-demo-fixed')
      document.body.style.overflow = ''
    }
  }, [fixed, targetId])

  // Esc exits the CSS fallback.
  useEffect(() => {
    if (!fixed) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFixed(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fixed])

  const onClick = () => {
    const el = document.getElementById(targetId) as any
    if (!el) return
    const doc = document as any

    // Already in native fullscreen → exit.
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      ;(doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc)
      return
    }
    // Already in CSS fallback → exit.
    if (fixed) { setFixed(false); return }

    // Try native fullscreen (desktop / Android). Fall back to CSS fill on
    // devices that don't support element fullscreen (iOS Safari).
    const req = el.requestFullscreen || el.webkitRequestFullscreen
    if (req) {
      try {
        const p = req.call(el)
        if (p && typeof p.catch === 'function') p.catch(() => setFixed(true))
      } catch {
        setFixed(true)
      }
    } else {
      setFixed(true)
    }
  }

  return (
    <>
      <button type="button" aria-label="Fullscreen" title="Fullscreen" onClick={onClick} className="slot-fs-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
      </button>

      {fixed && (
        <button type="button" aria-label="Exit fullscreen" onClick={() => setFixed(false)} className="slot-fs-exit">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      )}
    </>
  )
}
