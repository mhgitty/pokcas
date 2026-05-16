interface CalloutBlockProps {
  value: { variant?: 'info' | 'tip' | 'warning'; title?: string; body?: string }
}

const styles: Record<string, { bg: string; border: string; icon: string; color: string }> = {
  info:    { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', icon: 'ℹ️', color: '#60a5fa' },
  tip:     { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.25)',  icon: '💡', color: '#4ade80' },
  warning: { bg: 'rgba(234,179,8,0.1)',  border: 'rgba(234,179,8,0.25)',  icon: '⚠️', color: '#fbbf24' },
}

export function CalloutBlock({ value }: CalloutBlockProps) {
  const { variant = 'info', title, body } = value
  const s = styles[variant] ?? styles.info
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '8px', padding: '16px 20px', margin: '24px 0' }}>
      {title && <div style={{ fontWeight: 600, color: s.color, fontSize: '14.5px', marginBottom: '6px' }}>{s.icon} {title}</div>}
      {body && <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{body}</p>}
    </div>
  )
}
