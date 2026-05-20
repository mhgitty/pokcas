'use client'
import { useState } from 'react'
import { Breadcrumbs } from './Breadcrumbs'

interface BonusHeroProps {
  title: string
  casinoNavn?: string | null
  logoUrl?: string | null
  logoAlt?: string | null
  offerUrl?: string | null
  terms?: string | null
  minimumOdds?: string | null
  minimumIndbetaling?: number | null
  gennemspilskrav?: string | null
  maksGevinst?: string | null
  bonuskode?: string | null
  spinVaerdi?: string | null
}

const svgProps = {
  width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
  strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  style: { flexShrink: 0 },
}

function StatBox({ label, value, icon }: { label: string; value: string | null; icon: React.ReactNode }) {
  const empty = !value
  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: `1px solid var(--border)`,
      borderRadius: '10px', padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: '10px',
      minWidth: 0, opacity: empty ? 0.4 : 1,
    }}>
      {icon}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '1px' }}>
          {label}
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
          {value ?? '—'}
        </div>
      </div>
    </div>
  )
}

export function BonusHero({
  title, casinoNavn, logoUrl, logoAlt, offerUrl, terms,
  minimumOdds, minimumIndbetaling, gennemspilskrav,
  maksGevinst, bonuskode, spinVaerdi,
}: BonusHeroProps) {
  const [copied, setCopied] = useState(false)

  function copyCode() {
    if (!bonuskode) return
    navigator.clipboard.writeText(bonuskode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <section className="hero-section" style={{
      background: 'var(--bg-hero)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>

        <Breadcrumbs crumbs={[{ label: 'Home', href: '/' }, { label: 'Bonuses', href: '/kampagner' }, { label: title }]} />

        {/* Logo + title */}
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginBottom: '28px' }}>
          {logoUrl && (
            <div style={{ flexShrink: 0, width: '72px', height: '72px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img src={logoUrl} alt={logoAlt || casinoNavn || title} style={{ width: '72px', height: '72px', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
          <div>
            {casinoNavn && (
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                {casinoNavn}
              </div>
            )}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 3.5vw, 38px)',
              fontWeight: 800, color: 'var(--text)',
              lineHeight: 1.2, letterSpacing: '-0.03em', margin: 0,
            }}>
              {title}
            </h1>
          </div>
        </div>

        {/* Stat grid — 2 cols mobile, 3 cols desktop */}
        <div className="bonus-stats-grid">

          <StatBox label="Min. odds" value={minimumOdds ?? null} icon={

            <svg {...svgProps} stroke={minimumOdds ? 'var(--green)' : 'var(--text-faint)'}>
              {/* bar chart */}
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          } />

          <StatBox label="Min. deposit" value={minimumIndbetaling != null ? `${minimumIndbetaling} kr.` : null} icon={
            <svg {...svgProps} stroke={minimumIndbetaling != null ? 'var(--green)' : 'var(--text-faint)'}>
              {/* credit card */}
              <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          } />

          <StatBox label="Wagering requirement" value={gennemspilskrav ?? null} icon={
            <svg {...svgProps} stroke={gennemspilskrav ? 'var(--green)' : 'var(--text-faint)'}>
              {/* refresh */}
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
              <path d="M21 3v5h-5"/><path d="M3 21v-5h5"/>
            </svg>
          } />

          <StatBox label="Max. winnings" value={maksGevinst ?? null} icon={
            <svg {...svgProps} stroke={maksGevinst ? 'var(--green)' : 'var(--text-faint)'}>
              {/* trophy */}
              <path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/>
              <path d="M6 9a6 6 0 0 0 12 0"/><line x1="12" y1="15" x2="12" y2="19"/><line x1="8" y1="19" x2="16" y2="19"/>
            </svg>
          } />

          <StatBox label="Spin value" value={spinVaerdi ?? null} icon={
            <svg {...svgProps} stroke={spinVaerdi ? 'var(--green)' : 'var(--text-faint)'}>
              {/* zap / spin */}
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
          } />

          {/* Bonuskode — spans full width if present, otherwise a normal greyed box */}
          {bonuskode ? (
            <div style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px dashed rgba(34,197,94,0.5)',
              borderRadius: '10px', padding: '10px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <svg {...svgProps} stroke="var(--green)">
                  {/* tag */}
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '10px', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '1px' }}>Bonus code</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.06em' }}>{bonuskode}</div>
                </div>
              </div>
              <button onClick={copyCode} style={{
                background: copied ? 'var(--green-dark)' : 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: '6px',
                padding: '5px 10px', fontSize: '11px', fontWeight: 600,
                color: copied ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all .15s', flexShrink: 0,
              }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          ) : (
            <StatBox label="Bonus code" value={null} icon={
              <svg {...svgProps} stroke="var(--text-faint)">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            } />
          )}

        </div>

        {/* CTA — full width */}
        {offerUrl && (
          <div>
            <a
              href={offerUrl}
              target="_blank"
              rel="nofollow noopener noreferrer sponsored"
              style={{
                display: 'block', width: '100%',
                background: 'var(--green-dark)', color: '#fff',
                padding: '15px 28px', borderRadius: '10px',
                fontSize: '16px', fontWeight: 700,
                textDecoration: 'none', textAlign: 'center',
                letterSpacing: '-0.01em', boxSizing: 'border-box',
              }}
            >
              Get bonus now →
            </a>
            {terms && (
              <p style={{ fontSize: '10px', color: 'var(--text-faint)', margin: '10px 0 0', lineHeight: 1.5 }}>
                {terms}
              </p>
            )}
          </div>
        )}

      </div>
    </section>
  )
}
