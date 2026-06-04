'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Icon } from './Icon'

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
  /** Advertiser disclosure shown above the table. Pass null to hide. */
  disclosure?: string | null
}

const DEFAULT_DISCLOSURE = 'We may earn a commission from these casinos · 18+ · Play responsibly'

const LABEL: React.CSSProperties = {
  fontSize: '12px', color: 'var(--text-faint)', textTransform: 'uppercase',
  letterSpacing: '0.5px', fontWeight: 600,
}

// ─── Score badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? 'var(--green)' : score >= 6 ? '#ca8a04' : '#dc2626'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: color, color: '#fff',
      fontSize: '13px', fontWeight: 800, lineHeight: 1,
      padding: '5px 10px', borderRadius: '18px',
    }}>
      <Icon name="star" size={13} color="#fff" /> {score.toFixed(1)}
    </span>
  )
}

// ─── A single logo tile ─────────────────────────────────────────────────────────
function LogoTile({ item, size = 28 }: { item: LogoRef; size?: number }) {
  if (item.logo?.url) {
    return (
      <div title={item.name} style={{
        width: size, height: size, borderRadius: '7px', background: '#fff',
        border: '1px solid var(--border-faint)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.logo.url} alt={item.logo.alt || item.name}
          style={{ maxWidth: '82%', maxHeight: '82%', objectFit: 'contain', display: 'block' }} />
      </div>
    )
  }
  return (
    <div title={item.name} style={{
      height: size, padding: '0 7px', borderRadius: '7px', background: 'var(--bg-raised)',
      border: '1px solid var(--border-faint)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '9.5px', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap',
    }}>
      {item.name}
    </div>
  )
}

// ─── Logo stack: overlapping logos + "+N" → tooltip listing all ──────────────────
function LogoStack({ label, items, max = 4 }: { label: string; items: LogoRef[]; max?: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
    <div style={{ flexShrink: 0 }}>
      <div style={{ ...LABEL, marginBottom: '6px' }}>{label}</div>
      <div
        ref={ref}
        style={{ position: 'relative', display: 'inline-flex' }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {shown.map((it, i) => (
            <div key={it._id} style={{
              marginLeft: i === 0 ? 0 : '-9px',
              borderRadius: '8px',
              boxShadow: '0 0 0 2px var(--bg-card)',
              position: 'relative',
              zIndex: shown.length - i,
            }}>
              <LogoTile item={it} size={28} />
            </div>
          ))}
          {extra > 0 && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={`Show all ${items.length} ${label.toLowerCase()}`}
              style={{
                height: 28, minWidth: 28, padding: '0 7px', borderRadius: '8px',
                marginLeft: '5px', background: 'var(--green-light)', border: '1px solid var(--green)',
                color: 'var(--green-dark)', fontSize: '12px', fontWeight: 800,
                cursor: 'pointer', position: 'relative', zIndex: 0,
              }}
            >
              +{extra}
            </button>
          )}
        </div>

        {open && (
          <div role="tooltip" style={{
            position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, zIndex: 30,
            minWidth: '190px', maxWidth: '270px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '10px', boxShadow: '0 12px 32px rgba(0,0,0,0.16)', padding: '9px',
          }}>
            <div style={{ ...LABEL, fontSize: '9.5px', fontWeight: 700, marginBottom: '7px' }}>
              {label} · {items.length}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {items.map((it) => (
                <div key={it._id} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: 'var(--bg-raised)', border: '1px solid var(--border-faint)',
                  borderRadius: '7px', padding: '3px 8px 3px 4px',
                }}>
                  <LogoTile item={it} size={18} />
                  <span style={{ fontSize: '11.5px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{it.name}</span>
                </div>
              ))}
            </div>
            <div style={{
              position: 'absolute', top: '100%', right: '14px', width: 0, height: 0,
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
function CasinoRow({ casino, currency }: { casino: Casino; currency: string }) {
  const reviewHref = `/review/${casino.slug.current}/`
  const hasStats = casino.minIndbetaling != null || !!casino.gennemspilskrav
  const hasRow2 = !!casino.terms || !!casino.paymentMethods?.length || !!casino.software?.length

  return (
    <div style={{
      position: 'relative',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '16px 16px 14px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    }}>
      {casino.usp && (
        <span style={{
          position: 'absolute', top: '-11px', left: '18px',
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          background: 'var(--green)', color: '#fff',
          fontSize: '11.5px', fontWeight: 600, lineHeight: 1.3,
          padding: '3px 12px', borderRadius: '20px',
          maxWidth: 'calc(100% - 36px)',
        }}>
          <Icon name="bolt" size={12} color="#fff" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{casino.usp}</span>
        </span>
      )}

      {/* Row 1 — logo · rating+name · min dep/wager · bonus · CTA */}
      <div className="casino-cmp-r1" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '85px', height: '85px', background: '#fff', borderRadius: '10px',
          border: '1px solid var(--border-faint)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px',
        }}>
          {casino.logo?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={casino.logo.url} alt={casino.logo.alt || casino.name}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
          ) : (
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>{casino.name}</span>
          )}
        </div>

        {/* rating + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px', flexShrink: 0 }}>
          {casino.score != null && <ScoreBadge score={casino.score} />}
          <Link href={reviewHref} style={{
            fontSize: '13px', fontWeight: 700, color: 'var(--text)', textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            {casino.name}
          </Link>
        </div>

        {hasStats && (
          <div className="casino-cmp-ministats" style={{
            display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0,
            padding: '0 16px', borderLeft: '1px solid var(--border-faint)', borderRight: '1px solid var(--border-faint)',
          }}>
            {casino.minIndbetaling != null && (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ ...LABEL, width: '58px' }}>Min dep</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{currency}{casino.minIndbetaling}</span>
              </div>
            )}
            {casino.gennemspilskrav && (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ ...LABEL, width: '58px' }}>Wager</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{casino.gennemspilskrav}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          {casino.indbetalingsbonus && (
            <>
              <div style={{ ...LABEL, marginBottom: '3px' }}>Welcome bonus</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.15 }}>
                {casino.indbetalingsbonus}
              </div>
            </>
          )}
        </div>

        <div className="casino-cmp-cta" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '5px',
          minWidth: '150px', flexShrink: 0,
        }}>
          {casino.url && (
            <a href={casino.url} target="_blank" rel="nofollow noopener noreferrer sponsored" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              background: 'var(--green)', color: '#fff',
              padding: '10px 18px', borderRadius: '8px',
              fontSize: '14px', fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              Get bonus <Icon name="arrow-right" size={15} color="#fff" />
            </a>
          )}
          <Link href={reviewHref} style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            Read review
          </Link>
        </div>
      </div>

      {/* Row 2 — terms · payments · software */}
      {hasRow2 && (
        <div className="casino-cmp-r2" style={{
          display: 'flex', alignItems: 'center', gap: '18px',
          marginTop: '12px', paddingTop: '11px', borderTop: '1px solid var(--border-faint)',
        }}>
          <div style={{ flex: '1 1 auto', minWidth: 0, fontSize: '11px', color: 'var(--text-faint)', lineHeight: 1.45 }}>
            {casino.terms}
          </div>
          <LogoStack label="Payments" items={casino.paymentMethods || []} />
          <LogoStack label="Software" items={casino.software || []} />
        </div>
      )}
    </div>
  )
}

// ─── Table ──────────────────────────────────────────────────────────────────────
export function CasinoComparisonTable({ casinos, currency = '$', disclosure = DEFAULT_DISCLOSURE }: CasinoComparisonTableProps) {
  if (!casinos?.length) return null
  return (
    <div>
      {disclosure && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px',
          fontSize: '11px', color: 'var(--text-faint)', marginBottom: '14px',
        }}>
          <span style={{
            background: 'var(--bg-raised)', border: '1px solid var(--border-faint)', color: 'var(--text-muted)',
            fontWeight: 700, fontSize: '9.5px', letterSpacing: '0.5px', padding: '2px 6px',
            borderRadius: '5px', textTransform: 'uppercase',
          }}>
            Ad
          </span>
          {disclosure}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {casinos.map((c) => (
          <CasinoRow key={c._id} casino={c} currency={currency} />
        ))}
      </div>
    </div>
  )
}
