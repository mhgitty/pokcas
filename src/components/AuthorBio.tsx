import { Icon } from '@/components/Icon'
interface AuthorBioProps {
  author: {
    name: string
    bio?: string
    imageUrl?: string
    linkedin?: string
    x?: string
    facebook?: string
  }
  /** When true (pages): compact row layout, no bio. When false (blog): full card with bio */
  compact?: boolean
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '36px', height: '36px',
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        color: 'var(--text-muted)',
        textDecoration: 'none',
      }}
    >
      {icon}
    </a>
  )
}

const LinkedInIcon = () => <Icon name="linkedin" size={15} />

const XIcon = () => <Icon name="twitter" size={14} />

const FacebookIcon = () => <Icon name="facebook" size={15} />

export function AuthorBio({ author, compact = false }: AuthorBioProps) {
  const hasSocials = author.linkedin || author.x || author.facebook

  return (
    <div style={{
      marginTop: compact ? '0' : '56px',
      padding: compact ? '24px 32px' : '28px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      display: 'flex',
      gap: '24px',
      alignItems: 'center',
    }}>
      {/* Avatar */}
      {author.imageUrl ? (
        <img
          src={author.imageUrl}
          alt={author.name}
          style={{
            width: compact ? '64px' : '72px',
            height: compact ? '64px' : '72px',
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
      ) : (
        <div style={{
          width: compact ? '64px' : '72px',
          height: compact ? '64px' : '72px',
          borderRadius: '50%', flexShrink: 0,
          background: 'rgba(34,197,94,0.12)',
          border: '2px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', fontWeight: 800, color: 'var(--green)',
          fontFamily: 'var(--font-display)',
        }}>
          {author.name.charAt(0)}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: '3px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
            Written by
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: compact ? '18px' : '17px', fontWeight: 700, color: 'var(--text)', marginBottom: hasSocials ? '12px' : '0' }}>
          {author.name}
        </div>

        {author.bio && (
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, margin: '0 0 16px' }}>
            {author.bio}
          </p>
        )}

        {hasSocials && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {author.linkedin && <SocialLink href={author.linkedin} label="LinkedIn" icon={<LinkedInIcon />} />}
            {author.x        && <SocialLink href={author.x}        label="X / Twitter" icon={<XIcon />} />}
            {author.facebook  && <SocialLink href={author.facebook} label="Facebook"   icon={<FacebookIcon />} />}
          </div>
        )}
      </div>
    </div>
  )
}
