interface Provider { name?: string }

interface Props {
  embed?: string
  title?: string
  slotName?: string
  provider?: Provider | null
  rtp?: string
}

// Renders the game demo inside a styled frame with a header bar (slot name,
// provider, RTP badge). The embed code is trusted CMS input (pasted by an
// editor in Sanity Studio), so we inject it as-is inside a responsive box.
export function SlotDemo({ embed, title, slotName, provider, rtp }: Props) {
  if (!embed || !embed.trim()) return null
  const heading = title || (slotName ? `Play ${slotName} for free` : 'Play the demo')

  return (
    <div id="free-demo" className="section" style={{ paddingBottom: 0, scrollMarginTop: '80px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
        {heading}
      </h2>

      <div style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-card)' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {slotName}
            </div>
            {provider?.name && (
              <div style={{ fontSize: '12.5px', color: 'var(--gold)', fontWeight: 600, lineHeight: 1.2, marginTop: '2px' }}>
                by {provider.name}
              </div>
            )}
          </div>
          {rtp && (
            <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(26,122,60,0.12)', color: 'var(--green)', fontWeight: 700, fontSize: '13px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(26,122,60,0.25)' }}>
              RTP: {rtp}
            </span>
          )}
        </div>

        <div className="slot-demo-embed" dangerouslySetInnerHTML={{ __html: embed }} />
      </div>
    </div>
  )
}
