'use client'
import { useEffect, useRef, useState } from 'react'

interface StickyCtaBarProps {
  url: string
  name: string
  logoUrl?: string | null
  logoAlt?: string | null
  bonus?: string | null
  terms?: string | null
}

export function StickyCtaBar({ url, name, logoUrl, logoAlt, bonus, terms }: StickyCtaBarProps) {
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
        boxShadow: '0 -4px 32px rgba(0,0,0,0.18)',
      }}>
        {/* Inner — matches body max-width */}
        <div style={{
          maxWidth: '1250px',
          margin: '0 auto',
          padding: '12px 15px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>

          {/* Logo + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {logoUrl && (
              <div style={{
                width: '44px', height: '44px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#1a1a2e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <img
                  src={logoUrl}
                  alt={logoAlt || name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
            )}
            <span style={{
              fontSize: '14px', fontWeight: 700,
              color: 'var(--text)',
              whiteSpace: 'nowrap',
            }}>
              {name}
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '36px', background: 'var(--border)', flexShrink: 0 }} className="sticky-divider" />

          {/* Bonus + terms */}
          <div style={{ flex: 1, minWidth: 0 }} className="sticky-bonus">
            {bonus && (
              <div style={{
                fontSize: '16px', fontWeight: 800,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {bonus}
              </div>
            )}
            <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px' }}>
              {terms || '18+ | New Players Only | T&C Apply'}
            </div>
          </div>

          {/* CTA button */}
          <a
            href={url}
            target="_blank"
            rel="nofollow noopener noreferrer sponsored"
            style={{
              flexShrink: 0,
              background: 'var(--green)',
              color: '#fff',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 800,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
              boxShadow: '0 2px 12px rgba(34,197,94,0.3)',
            }}
          >
            PLAY NOW
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .sticky-divider { display: none !important; }
          .sticky-bonus { display: none !important; }
        }
      `}</style>
    </>
  )
}
