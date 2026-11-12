'use client'
import { useEffect, useState } from 'react'

/** A SlotsLaunch demo: asks this site's server for a freshly signed game URL, then shows the game. */
export function SlotsLaunchFrame({ gameId, title }: { gameId: string; title?: string }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let off = false
    fetch(`/api/slot-demo/${gameId}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d: { url?: string }) => { if (!off && d.url) setSrc(d.url) })
      .catch(() => {})
    return () => { off = true }
  }, [gameId])
  if (!src) return <div style={{ width: '100%', height: 600 }} aria-busy="true" />
  return <iframe src={src} title={title} width="100%" height={600} frameBorder={0} allow="fullscreen; autoplay" allowFullScreen />
}
