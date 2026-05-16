'use client'
import { useEffect, useRef, useState } from 'react'

interface StickyCtaBarProps {
  url: string
  name: string
  logoUrl?: string | null
  logoAlt?: string | null
}

export function StickyCtaBar({ url, name, logoUrl, logoAlt }: StickyCtaBarProps) {
  const [visible, setVisible] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Invisible sentinel placed at the bottom of the hero */}
      <div ref={sentinelRef} style={{ height: 0 }} />

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 50,
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.25s ease',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: '14px',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.25)',
      }}>
        {/* Logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          {logoUrl && (
            <div style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img src={logoUrl} alt={logoAlt || name} style={{ width: '36px', height: '36px', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </span>
        </div>

        {/* CTA */}
        <a
          href={url}
          target="_blank"
          rel="nofollow noopener noreferrer sponsored"
          style={{
            flexShrink: 0,
            background: 'var(--green-dark)',
            color: '#fff',
            padding: '11px 22px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Besøg casino nu →
        </a>
      </div>
    </>
  )
}
