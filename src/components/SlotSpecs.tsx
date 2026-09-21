import Link from 'next/link'

interface Provider { name?: string; slug?: string; market?: string }

interface Slot {
  provider?: Provider | null
  rtp?: string
  volatility?: string
  maxWin?: string
  grid?: string
  paylines?: string
  mechanic?: string
  theme?: string
  features?: string[]
  minBetPerSpin?: string
  maxBetPerSpin?: string
  hasBonusBuy?: boolean
  hasJackpot?: boolean
  hitFrequencyPercent?: string
  releaseYear?: number
}

/** Specs table for a slot machine — renders only the fields that are set. */
export function SlotSpecs({ slot, title = 'Slot details' }: { slot: Slot; title?: string }) {
  const rows: { label: string; value: React.ReactNode }[] = []
  const add = (label: string, value?: string | number | null) => {
    if (value !== undefined && value !== null && `${value}`.trim() !== '') rows.push({ label, value: `${value}` })
  }

  // Provider — reference; render as a link to the provider page when possible.
  if (slot.provider?.name) {
    const mp = slot.provider.market === 'ca' ? '/ca' : slot.provider.market === 'au' ? '/au' : ''
    const href = slot.provider.slug ? `${mp}/online-casino/software/${slot.provider.slug}/` : null
    rows.push({
      label: 'Provider',
      value: href
        ? <Link href={href} style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 700 }}>{slot.provider.name}</Link>
        : slot.provider.name,
    })
  }

  add('RTP', slot.rtp)
  add('Volatility', slot.volatility)
  add('Max win', slot.maxWin)
  add('Grid', slot.grid)
  add('Paylines', slot.paylines)
  add('Mechanic', slot.mechanic)
  add('Theme', slot.theme)
  add('Min bet per spin', slot.minBetPerSpin)
  add('Max bet per spin', slot.maxBetPerSpin)
  add('Hit frequency', slot.hitFrequencyPercent)
  if (slot.releaseYear) add('Release year', slot.releaseYear)
  if (typeof slot.hasBonusBuy === 'boolean') add('Bonus buy', slot.hasBonusBuy ? 'Yes' : 'No')
  if (typeof slot.hasJackpot === 'boolean') add('Jackpot', slot.hasJackpot ? 'Yes' : 'No')

  const hasFeatures = Array.isArray(slot.features) && slot.features.length > 0
  if (rows.length === 0 && !hasFeatures) return null

  return (
    <div id="slot-details" style={{ margin: '28px 0', scrollMarginTop: '80px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>
        {title}
      </h2>

      {rows.length > 0 && (
        <div style={{ border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', background: 'var(--bg-card)' }}>
          <div className="slot-specs-grid">
            {rows.map((r, i) => (
              <div key={r.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                padding: '13px 18px',
                borderBottom: i < rows.length - 1 ? '1px solid var(--border-faint)' : 'none',
              }}>
                <span style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500 }}>{r.label}</span>
                <span style={{ fontSize: '14.5px', color: 'var(--text)', fontWeight: 700, textAlign: 'right' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasFeatures && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
            Features
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {slot.features!.map((f) => (
              <span key={f} style={{
                background: 'rgba(26,122,60,0.1)', color: 'var(--green)',
                fontSize: '13px', fontWeight: 600, padding: '6px 12px', borderRadius: '20px',
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
