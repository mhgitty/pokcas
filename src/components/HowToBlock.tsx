interface HowToItem {
  title?: string
  body?: string
}

interface HowToBlockProps {
  value: {
    title?: string
    items?: HowToItem[]
  }
}

export function HowToBlock({ value }: HowToBlockProps) {
  if (!value?.items?.length) return null

  return (
    <div style={{ margin: '32px 0' }}>
      {value.title && (
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(18px, 2.5vw, 24px)',
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
          marginBottom: '16px',
        }}>
          {value.title}
        </h2>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {value.items.map((item, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '36px 1fr',
            columnGap: '18px',
            rowGap: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '26px 28px',
            alignItems: 'center',
          }}>
            {/* Number badge */}
            <div style={{
              width: '36px',
              height: '36px',
              background: 'var(--green)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1,
              }}>
                {i + 1}
              </span>
            </div>

            {/* Title (aligned next to the badge) */}
            {item.title && (
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(18px, 2.2vw, 21px)',
                fontWeight: 700,
                color: 'var(--text)',
                margin: 0,
                letterSpacing: '-0.02em',
                alignSelf: 'center',
              }}>
                {item.title}
              </h3>
            )}

            {/* Body (spans under the title, indented past the badge) */}
            {item.body && (
              <p style={{
                gridColumn: '2',
                fontSize: '15px',
                color: 'var(--text-muted)',
                lineHeight: 1.7,
                margin: 0,
              }}>
                {item.body}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
