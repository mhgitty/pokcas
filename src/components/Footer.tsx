import Link from 'next/link'
import Image from 'next/image'
import { getSiteSettings } from '@/lib/sanity'

function resolveUrl(item: { url?: string; pageSlug?: string; pageParentSlug?: string; bookmakerSlug?: string }): string {
  if (item.pageSlug) return item.pageParentSlug ? `/${item.pageParentSlug}/${item.pageSlug}/` : `/${item.pageSlug}/`
  if (item.bookmakerSlug) return `/betting-sider/${item.bookmakerSlug}/`
  return item.url || '/'
}

const DEFAULT_COLUMNS = [
  {
    title: 'Sider',
    items: [
      { label: 'Forside',           url: '/' },
      { label: 'Betting sider',     url: '/betting-sider' },
      { label: 'Bonusser',          url: '/kampagner' },
      { label: 'Guides & artikler', url: '/blog' },
    ],
  },
  {
    title: 'Information',
    items: [
      { label: 'Om os',              url: '/om-os' },
      { label: 'Ansvarligt spil',    url: '/ansvarligt-spil' },
      { label: 'Cookiepolitik',      url: '/cookie-politik' },
      { label: 'Privatlivspolitik',  url: '/privatlivspolitik' },
    ],
  },
]

export async function Footer() {
  const settings = await getSiteSettings().catch(() => null)
  const year = new Date().getFullYear()

  const tagline    = settings?.footerTagline    ?? 'Danmarks uafhængige guide til betting bonusser og bookmakers. Vi sammenligner de bedste tilbud.'
  const columns    = settings?.footerColumns?.length ? settings.footerColumns : DEFAULT_COLUMNS
  const note       = settings?.footerNote       ?? `© ${year} Pokcas.dk · Spil ansvarligt · 18+`
  const disclaimer = settings?.footerDisclaimer ?? 'Affiliatelinks kan forekomme · Se vilkår hos bookmaker'

  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-footer)', marginTop: '80px', padding: '48px 24px 32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="footer-grid">

          {/* Logo + tagline */}
          <div>
            <div style={{ marginBottom: '12px' }}>
              <Image
                src="/logo.webp"
                alt="Pokcas"
                height={32}
                width={180}
                style={{ height: '32px', width: 'auto', display: 'block' }}
              />
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '240px' }}>
              {tagline}
            </p>
          </div>

          {/* Configurable columns */}
          {columns.map((col: any) => (
            <div key={col.title}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                {col.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(col.items || []).map((item: any) => {
                  const href = resolveUrl(item)
                  return (
                    <Link
                      key={href + item.label}
                      href={href}
                      style={{ fontSize: '13.5px', color: 'var(--text-muted)', textDecoration: 'none' }}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{note}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{disclaimer}</p>
        </div>
      </div>
    </footer>
  )
}
