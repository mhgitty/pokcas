'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

// ─── Types ──────────────────────────────────────────────────────────────────
interface LogoRef {
  _id: string
  name: string
  slug?: string
  logo?: { url?: string; alt?: string }
}

interface Casino {
  _id: string
  name: string
  slug: { current: string }
  usp?: string
  score?: number
  indbetalingsbonus?: string
  minIndbetaling?: number
  gennemspilskrav?: string
  url?: string
  terms?: string
  market?: string
  logo?: { url?: string; alt?: string }
  paymentMethods?: LogoRef[]
  software?: LogoRef[]
}

interface CasinoComparisonTableProps {
  casinos?: Casino[]
  /** Currency symbol for the minimum deposit. */
  currency?: string
}

// ─── Score badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? 'var(--green)' : score >= 6 ? '#ca8a04' : '#dc2626'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: color, color: '#fff',
      fontSize: '12.5px', fontWeight: 800, lineHeight: 1,
      padding: '4px 9px', borderRadius: '20px',
    }}>
      ★ {score.toFixed(1)}
    </span>
  )
}

// ─── Stat chip ────────────────────────────────────────────────────────────────
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontSize: '9.5px', color: 'var(--text-faint)', textTransform: 'uppercase',
        letterSpacing: '0.6px', marginBottom: '2px', fontWeight: 600,
      }}>
        {label}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{value}</div>
    </div>
  )
}

// ─── A single logo tile ─────────────────────────────────────────────────────────
function LogoTile({ item, size = 30 }: { item: LogoRef; size?: number }) {
  if (item.logo?.url) {
    return (
      <div
        title={item.name}
        style={{
          width: size, height: size, borderRadius: '7px', background: '#fff',
          border: '1px solid var(--border-faint)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.logo.url}
          alt={item.logo.alt || item.name}
          style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain', display: 'block' }}
        />
      </div>
    )
  }
  return (
    <div
      title={item.name}
      style={{
        height: size, padding: '0 8px', borderRadius: '7px', background: 'var(--bg-raised)',
        border: '1px solid var(--border-faint)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap',
      }}
    >
      {item.name}
    </div>
  )
}

// ─── Logo stack with "+N" → tooltip listing all ─────────────────────────────────
function LogoStack({ label, items, max = 3 }: { label: string; items: LogoRef[]; max?: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside tap (mobile)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  if (!items?.length) return null
  const shown = items.slice(0, max)
  const extra = items.length - shown.length

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontSize: '9.5px', color: 'var(--text-faint)', textTransform: 'uppercase',
        letterSpacing: '0.6px', marginBottom: '6px', fontWeight: 600,
      }}>
        {label}
      </div>

      <div
        ref={ref}
        style={{ position: 'relative', display: 'inline-flex' }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'default' }}>
          {shown.map((it) => <LogoTile key={it._id} item={it} />)}
          {extra > 0 && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={`Show all ${items.length} ${label.toLowerCase()}`}
              style={{
                height: 30, minWidth: 30, padding: '0 8px', borderRadius: '7px',
                background: 'var(--green-light)', border: '1px solid var(--border)',
                color: 'var(--green-dark)', fontSize: '12px', fontWeight: 800,
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              +{extra}
            </button>
          )}
        </div>

        {open && (
          <div
            role="tooltip"
            style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, zIndex: 30,
              minWidth: '210px', maxWidth: '280px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '10px', boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
              padding: '10px',
            }}
          >
            <div style={{
              fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase',
              letterSpacing: '0.6px', fontWeight: 700, marginBottom: '8px',
            }}>
              {label} · {items.length}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {items.map((it) => (
                <div key={it._id} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'var(--bg-raised)', border: '1px solid var(--border-faint)',
                  borderRadius: '8px', padding: '4px 8px 4px 4px',
                }}>
                  <LogoTile item={it} size={22} />
                  <span style={{ fontSize: '12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{it.name}</span>
                </div>
              ))}
            </div>
            {/* arrow */}
            <div style={{
              position: 'absolute', top: '100%', left: '18px',
              width: 0, height: 0,
              borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
              borderTop: '6px solid var(--border)',
            }} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── One casino row ─────────────────────────────────────────────────────────────
function CasinoRow({ casino, rank, currency }: { casino: Casino; rank: number; currency: string }) {
  const reviewHref = `/review/${casino.slug.current}/`
  const top = rank === 1

  return (
    <div style={{
      position: 'relative',
      background: 'var(--bg-card)',
      border: top ? '1.5px solid var(--green)' : '1px solid var(--border)',
      borderRadius: '14px',
      boxShadow: top ? '0 6px 20px rgba(26,122,60,0.10)' : '0 1px 2px rgba(0,0,0,0.04)',
    }}>
      {top && (
        <div style={{
          position: 'absolute', top: '-11px', left: '22px', zIndex: 2,
          background: 'var(--green)', color: '#fff',
          fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.4px',
          padding: '3px 12px', borderRadius: '20px', textTransform: 'uppercase',
        }}>
          🏆 Top rated
        </div>
      )}

      <div
        className="casino-compare-inner"
        style={{
          display: 'grid',
          gridTemplateColumns: '132px minmax(0, 1.5fr) minmax(0, 1fr) auto',
          gap: '22px',
          padding: '22px 24px',
          alignItems: 'center',
        }}
      >
        {/* 1 — rank + logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            fontSize: '12px', fontWeight: 800, color: 'var(--text-faint)',
          }}>
            #{rank}
          </div>
          <div style={{
            width: '116px', height: '64px', background: '#fff', borderRadius: '10px',
            border: '1px solid var(--border-faint)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px',
          }}>
            {casino.logo?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={casino.logo.url} alt={casino.logo.alt || casino.name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
            ) : (
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>{casino.name}</span>
            )}
          </div>
        </div>

        {/* 2 — name, score, usp, payments + software */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '5px' }}>
            <Link href={reviewHref} style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                {casino.name}
              </span>
            </Link>
            {casino.score != null && <ScoreBadge score={casino.score} />}
          </div>
          {casino.usp && (
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
              {casino.usp}
            </p>
          )}
          <div style={{ display: 'flex', gap: '26px', flexWrap: 'wrap' }}>
            <LogoStack label="Payments" items={casino.paymentMethods || []} />
            <LogoStack label="Software" items={casino.software || []} />
          </div>
        </div>

        {/* 3 — bonus + stats */}
        <div style={{ minWidth: 0 }}>
          {casino.indbetalingsbonus && (
            <div style={{
              background: 'var(--bg-raised)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '10px 14px', marginBottom: '12px',
            }}>
              <div style={{
                fontSize: '9.5px', color: 'var(--green-dark)', textTransform: 'uppercase',
                letterSpacing: '0.6px', fontWeight: 700, marginBottom: '3px',
              }}>
                Welcome bonus
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>
                {casino.indbetalingsbonus}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '22px', flexWrap: 'wrap' }}>
            {casino.minIndbetaling != null && (
              <Stat label="Min. deposit" value={`${currency}${casino.minIndbetaling}`} />
            )}
            {casino.gennemspilskrav && <Stat label="Wager" value={casino.gennemspilskrav} />}
          </div>
        </div>

        {/* 4 — CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px', minWidth: '150px' }}>
          {casino.url && (
            <a
              href={casino.url}
              target="_blank"
              rel="nofollow noopener noreferrer sponsored"
              style={{
                display: 'block', textAlign: 'center',
                background: 'var(--green)', color: '#fff',
                padding: '13px 22px', borderRadius: '9px',
                fontSize: '14.5px', fontWeight: 800,
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}
            >
              Get bonus →
            </a>
          )}
          <Link href={reviewHref} style={{
            textAlign: 'center', fontSize: '12.5px', color: 'var(--text-muted)', textDecoration: 'none',
          }}>
            Read review
          </Link>
        </div>
      </div>

      {casino.terms && (
        <div style={{
          padding: '8px 24px', background: 'var(--bg-navbar)',
          borderTop: '1px solid var(--border-faint)',
          borderRadius: '0 0 14px 14px',
          fontSize: '11px', color: 'var(--text-faint)', lineHeight: 1.5,
        }}>
          {casino.terms}
        </div>
      )}
    </div>
  )
}

// ─── Table ──────────────────────────────────────────────────────────────────────
export function CasinoComparisonTable({ casinos, currency = '$' }: CasinoComparisonTableProps) {
  if (!casinos?.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {casinos.map((c, i) => (
        <CasinoRow key={c._id} casino={c} rank={i + 1} currency={currency} />
      ))}
    </div>
  )
}
