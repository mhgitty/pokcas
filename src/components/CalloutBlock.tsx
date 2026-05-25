import { PortableText } from '@portabletext/react'

interface CalloutBlockProps {
  value: { variant?: 'info' | 'tip' | 'warning'; title?: string; body?: any[] | string }
}

const styles: Record<string, { bg: string; border: string; icon: string; color: string }> = {
  info:    { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', icon: 'ℹ️', color: '#60a5fa' },
  tip:     { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.25)',  icon: '💡', color: '#4ade80' },
  warning: { bg: 'rgba(234,179,8,0.1)',  border: 'rgba(234,179,8,0.25)',  icon: '⚠️', color: '#fbbf24' },
}

const richTextComponents = {
  block: {
    normal: ({ children }: any) => (
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 8px' }}>{children}</p>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 8px', paddingLeft: '20px' }}>{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 8px', paddingLeft: '20px' }}>{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li style={{ marginBottom: '4px' }}>{children}</li>,
    number: ({ children }: any) => <li style={{ marginBottom: '4px' }}>{children}</li>,
  },
  marks: {
    strong: ({ children }: any) => <strong style={{ fontWeight: 600, color: 'var(--text)' }}>{children}</strong>,
    em: ({ children }: any) => <em>{children}</em>,
    link: ({ value, children }: any) => {
      const relParts = ['noopener', 'noreferrer', value?.nofollow ? 'nofollow' : ''].filter(Boolean)
      return (
        <a href={value?.href} target={value?.blank ? '_blank' : undefined} rel={relParts.join(' ')}
          style={{ color: 'inherit', textDecoration: 'underline' }}>
          {children}
        </a>
      )
    },
  },
}

export function CalloutBlock({ value }: CalloutBlockProps) {
  const { variant = 'info', title, body } = value
  const s = styles[variant] ?? styles.info

  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '8px', padding: '16px 20px', margin: '24px 0' }}>
      {title && (
        <div style={{ fontWeight: 600, color: s.color, fontSize: '14.5px', marginBottom: '8px' }}>
          {s.icon} {title}
        </div>
      )}
      {body && (
        <div style={{ lineHeight: 1.65 }}>
          {Array.isArray(body)
            ? <PortableText value={body} components={richTextComponents} />
            : <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{body}</p>
          }
        </div>
      )}
    </div>
  )
}
