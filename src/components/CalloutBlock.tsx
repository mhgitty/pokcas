import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { getAuthorById } from '@/lib/sanity'

interface CalloutBlockProps {
  value: {
    variant?: 'info' | 'tip' | 'warning' | 'quote'
    title?: string
    body?: any[] | string
    author?: { _ref?: string }
  }
}

const styles: Record<string, { bg: string; border: string; icon: string; color: string }> = {
  info:    { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', icon: 'ℹ️', color: '#60a5fa' },
  tip:     { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.25)',  icon: '💡', color: '#4ade80' },
  warning: { bg: 'rgba(234,179,8,0.1)',  border: 'rgba(234,179,8,0.25)',  icon: '⚠️', color: '#fbbf24' },
  quote:   { bg: 'var(--bg-raised)',     border: 'var(--border)',         icon: '',   color: 'var(--text)' },
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

const quoteComponents = {
  block: { normal: ({ children }: any) => <p>{children}</p> },
  list: {
    bullet: ({ children }: any) => <ul>{children}</ul>,
    number: ({ children }: any) => <ol>{children}</ol>,
  },
  marks: richTextComponents.marks,
}

export async function CalloutBlock({ value }: CalloutBlockProps) {
  const { variant = 'info', title, body, author } = value
  const s = styles[variant] ?? styles.info
  const isQuote = variant === 'quote'

  // Resolve the credited author (optional) at render time.
  let person = null
  if (author?._ref) {
    try {
      person = await getAuthorById(author._ref)
    } catch {
      person = null
    }
  }

  if (isQuote) {
    const href = person?.slug?.current ? `/author/${person.slug.current}/` : undefined
    return (
      <figure className="qb">
        <span className="qb-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M9.6 6C6.5 7.3 4.5 10 4.5 13.4V18h6v-6H7.6c.2-1.9 1.3-3.3 3.1-4.2L9.6 6zm9 0c-3.1 1.3-5.1 4-5.1 7.4V18h6v-6h-2.9c.2-1.9 1.3-3.3 3.1-4.2L18.6 6z" />
          </svg>
        </span>
        {title && <div className="qb-title">{title}</div>}
        {body && (
          <blockquote className="qb-text">
            {Array.isArray(body)
              ? <PortableText value={body} components={quoteComponents} />
              : <p>{body}</p>}
          </blockquote>
        )}
        {person?.name && (
          <figcaption className="qb-by">
            {person.imageUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img className="qb-avatar" src={`${person.imageUrl}?w=96&h=96&fit=crop&auto=format`} alt={person.name} loading="lazy" width={44} height={44} />
              : <span className="qb-avatar qb-initial">{person.name.charAt(0).toUpperCase()}</span>}
            <span className="qb-who">
              {href
                ? <Link href={href} className="qb-name">{person.name}</Link>
                : <span className="qb-name">{person.name}</span>}
              {person.role && <span className="qb-role">{person.role}</span>}
            </span>
          </figcaption>
        )}
      </figure>
    )
  }

  return (
    <div
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderLeft: isQuote ? '4px solid var(--green)' : `1px solid ${s.border}`,
        borderRadius: '8px',
        padding: '16px 20px',
        margin: '24px 0',
      }}
    >
      {title && (
        <div style={{ fontWeight: 600, color: s.color, fontSize: isQuote ? '16px' : '14.5px', marginBottom: '8px' }}>
          {s.icon ? `${s.icon} ` : ''}{title}
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

      {person?.name && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            marginTop: '14px', paddingTop: '12px',
            borderTop: `1px solid ${s.border}`,
          }}
        >
          {person.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={person.imageUrl}
              alt={person.name}
              loading="lazy"
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          <div style={{ lineHeight: 1.3 }}>
            {person.slug?.current ? (
              <Link
                href={`/author/${person.slug.current}/`}
                style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}
              >
                {person.name}
              </Link>
            ) : (
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>{person.name}</span>
            )}
            {person.role && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{person.role}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
