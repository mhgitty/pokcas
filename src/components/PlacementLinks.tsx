'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Appends `placement=<current-path>` to outbound redirect links (the /go/ and
 * /<market>/go/ redirect paths), so the destination knows which page the click
 * came from.
 * Skips links that point directly to bandstrack.com. Each link is only tagged
 * once. Runs after hydration and re-runs on every client-side navigation.
 */
export function PlacementLinks() {
  const pathname = usePathname()

  useEffect(() => {
    const apply = () => {
      const placement = encodeURIComponent(window.location.pathname)
      document.querySelectorAll<HTMLAnchorElement>('a[href*="/go/"]').forEach((link) => {
        if (link.href.includes('bandstrack.com')) return
        if (link.dataset.placementTagged) return
        const sep = link.href.includes('?') ? '&' : '?'
        link.href = `${link.href}${sep}placement=${placement}`
        link.dataset.placementTagged = '1'
      })
    }
    apply()
    // Catch links rendered slightly after hydration (client components, etc.)
    const t = setTimeout(apply, 1000)
    return () => clearTimeout(t)
  }, [pathname])

  return null
}
