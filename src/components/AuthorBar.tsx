interface Author {
  name: string
  linkedin?: string | null
  imageUrl?: string | null
}

interface AuthorBarProps {
  author?: Author | null
  factChecker?: Author | null
  updatedAt?: string | null
}

export function AuthorBar({ author, factChecker, updatedAt }: AuthorBarProps) {
  if (!author && !factChecker && !updatedAt) return null

  const dateStr = updatedAt
    ? new Date(updatedAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  if (!author && !factChecker && !dateStr) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      marginBottom: '20px', flexWrap: 'wrap',
    }}>
      {author && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {author.imageUrl && (
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--border)' }}>
              <img src={author.imageUrl} alt={author.name} style={{ width: '40px', height: '40px', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-faint)', lineHeight: 1.3 }}>
              Forfatter:{' '}
              {author.linkedin
                ? <a href={author.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>{author.name}</a>
                : <span style={{ color: 'var(--text)', fontWeight: 600 }}>{author.name}</span>
              }
            </div>
            {dateStr && (
              <div style={{ fontSize: '12px', color: 'var(--text-faint)', lineHeight: 1.3 }}>
                Sidst opdateret: <span style={{ color: 'var(--text-muted)' }}>{dateStr}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {author && factChecker && (
        <div style={{ width: '1px', height: '36px', background: 'var(--border)', flexShrink: 0 }} />
      )}

      {factChecker && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {factChecker.imageUrl && (
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--border)' }}>
              <img src={factChecker.imageUrl} alt={factChecker.name} style={{ width: '40px', height: '40px', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
          <div style={{ fontSize: '12px', color: 'var(--text-faint)', lineHeight: 1.3 }}>
            Faktatjekker:{' '}
            {factChecker.linkedin
              ? <a href={factChecker.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>{factChecker.name}</a>
              : <span style={{ color: 'var(--text)', fontWeight: 600 }}>{factChecker.name}</span>
            }
          </div>
        </div>
      )}

      {!author && dateStr && (
        <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
          Sidst opdateret: <span style={{ color: 'var(--text-muted)' }}>{dateStr}</span>
        </div>
      )}
    </div>
  )
}
