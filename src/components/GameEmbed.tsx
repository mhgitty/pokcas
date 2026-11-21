'use client'

import { useEffect, useRef, useState } from 'react'

// Self-hosted HTML5 games living in /public/games/<id>/.
// The game talks to this wrapper with postMessage (pokcas:height, pokcas:fullscreen, pokcas:scroll).
export const GAMES: Record<string, { src: string; title: string; minHeight: number }> = {
  roulette: { src: '/games/roulette/index.html', title: 'Pokcas Roulette Game', minHeight: 640 },
}

export function GameEmbed({ game }: { game?: string }) {
  const cfg = GAMES[game || 'roulette'] ?? GAMES.roulette
  const wrapRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(cfg.minHeight)
  const [fixed, setFixed] = useState(false) // CSS fullscreen fallback (iOS)

  const post = (msg: any) => {
    try { frameRef.current?.contentWindow?.postMessage(msg, window.location.origin) } catch { /* ignore */ }
  }

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow) return
      const d = e.data
      if (!d || typeof d.type !== 'string') return
      if (d.type === 'pokcas:height' && typeof d.height === 'number' && d.height > 200) {
        setHeight(Math.ceil(d.height))
      } else if (d.type === 'pokcas:scroll' && e.origin === window.location.origin && typeof d.delta === 'number') {
        window.scrollBy(0, d.delta)
      } else if (d.type === 'pokcas:fullscreen' && e.origin === window.location.origin) {
        toggleFullscreen()
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onFs = () => {
      const on = document.fullscreenElement === wrapRef.current || (document as any).webkitFullscreenElement === wrapRef.current
      post({ type: 'pokcas:fit', on })
    }
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('webkitfullscreenchange', onFs)
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      document.removeEventListener('webkitfullscreenchange', onFs)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = fixed ? 'hidden' : ''
    post({ type: 'pokcas:fit', on: fixed })
    return () => { document.body.style.overflow = '' }
  }, [fixed])

  function toggleFullscreen() {
    const el = wrapRef.current as any
    const d = document as any
    if (d.fullscreenElement || d.webkitFullscreenElement) {
      (d.exitFullscreen || d.webkitExitFullscreen)?.call(d)
      return
    }
    if (fixedRef.current) { setFixed(false); return }
    const req = el?.requestFullscreen || el?.webkitRequestFullscreen
    if (req) {
      const r = req.call(el)
      if (r && typeof r.catch === 'function') r.catch(() => setFixed(true))
    } else {
      setFixed(true)
    }
  }
  const fixedRef = useRef(fixed)
  fixedRef.current = fixed

  const onLoad = () => {
    post({ type: 'pokcas:embed-scroll', enabled: true })
    post({ type: 'pokcas:fit', on: fixed })
  }

  return (
    <div ref={wrapRef} className={`game-embed${fixed ? ' game-embed-fixed' : ''}`}>
      {fixed && (
        <button type="button" className="game-embed-exit" aria-label="Exit full screen" onClick={() => setFixed(false)}>✕</button>
      )}
      <iframe
        ref={frameRef}
        src={cfg.src}
        title={cfg.title}
        onLoad={onLoad}
        allow="fullscreen; autoplay; clipboard-write"
        allowFullScreen
        style={{ height: fixed ? '100%' : `${height}px` }}
      />
    </div>
  )
}
