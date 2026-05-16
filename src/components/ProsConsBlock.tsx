interface ProsConsBlockProps { value: { title?: string; pros?: string[]; cons?: string[] } }

export function ProsConsBlock({ value }: ProsConsBlockProps) {
  const { title, pros = [], cons = [] } = value
  return (
    <div style={{ margin: '24px 0' }}>
      {title && <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>{title}</h3>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '16px 20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>✅ Fordele</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pros.map((p, i) => <li key={i} style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}><span style={{ color: 'var(--green)' }}>✓</span>{p}</li>)}
          </ul>
        </div>
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '16px 20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>❌ Ulemper</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cons.map((c, i) => <li key={i} style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}><span style={{ color: '#f87171' }}>✗</span>{c}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}
