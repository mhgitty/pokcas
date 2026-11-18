'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Appends `placement=<current-path>` to outbound redirect links (the /go/ and
 * /<market>/go/ redirect paths); the /go/ route forwards it to the tracker so
 * clicks and conversions are attributed to the page they came from.
 * Skips links that point directly to bandstrack.com.
 *
 * Links are tagged on load, on every client-side navigation, and again at the
 * moment of the click (catches links rendered later: popups, flyouts, load-more).
 */
const SELECTOR = 'a[href*="/go/"]'

function tag(link: HTMLAnchorElement) {
  if (link.href.includes('bandstrack.com')) return
  const path = window.location.pathname
  try {
    const u = new URL(link.href, window.location.origin)
    if (!u.pathname.includes('/go/')) return
    if (u.searchParams.get('placement') === path) return
    u.searchParams.set('placement', path)
    link.href = u.toString()
  } catch { /* ignore malformed hrefs */ }
}

export function PlacementLinks() {
  const pathname = usePathname()

  useEffect(() => {
    const applyAll = () => document.querySelectorAll<HTMLAnchorElement>(SELECTOR).forEach(tag)
    applyAll()
    const t = setTimeout(applyAll, 1000)
    return () => clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    const onPointer = (e: Event) => {
      const link = (e.target as Element | null)?.closest?.(SELECTOR) as HTMLAnchorElement | null
      if (link) tag(link)
    }
    // Capture phase so the href is updated before the browser navigates.
    document.addEventListener('mousedown', onPointer, true)
    document.addEventListener('touchstart', onPointer, { capture: true, passive: true })
    document.addEventListener('click', onPointer, true)
    document.addEventListener('auxclick', onPointer, true)
    document.addEventListener('keydown', onPointer, true)
    return () => {
      document.removeEventListener('mousedown', onPointer, true)
      document.removeEventListener('touchstart', onPointer, true)
      document.removeEventListener('click', onPointer, true)
      document.removeEventListener('auxclick', onPointer, true)
      document.removeEventListener('keydown', onPointer, true)
    }
  }, [])

  return null
}
