import Link from 'next/link'
import Image from 'next/image'
import { getSiteSettings } from '@/lib/sanity'
import { MarketSelector } from './MarketSelector'

function resolveUrl(item: {
  url?: string; pageSlug?: string; pageParentSlug?: string; bookmakerSlug?: string;
  softwareSlug?: string; paymentMethodSlug?: string; postSlug?: string;
}): string {
  if (item.pageSlug) return item.pageParentSlug ? `/${item.pageParentSlug}/${item.pageSlug}/` : `/${item.pageSlug}/`
  if (item.bookmakerSlug) return `/review/${item.bookmakerSlug}/`
  if (item.softwareSlug) return `/software/${item.softwareSlug}/`
  if (item.paymentMethodSlug) return `/payments/${item.paymentMethodSlug}/`
  if (item.postSlug) return `/${item.postSlug}/`
  return item.url || '/'
}

const DEFAULT_COLUMNS = [
  {
    title: 'Information',
    items: [
      { label: 'About Us',           url: '/om-os' },
      { label: 'Responsible Gaming', url: '/ansvarligt-spil' },
      { label: 'Cookie Policy',      url: '/cookie-politik' },
      { label: 'Privacy Policy',     url: '/privatlivspolitik' },
    ],
  },
  {
    title: 'Casino Reviews',
    items: [
      { label: 'All Casinos',        url: '/review' },
      { label: 'Bonuses',            url: '/kampagner' },
    ],
  },
  {
    title: 'Guides & Articles',
    items: [
      { label: 'Blog',               url: '/blog' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Home',               url: '/' },
    ],
  },
]

interface FooterProps {
  tagline?: string
  columns?: any[]
  longDisclaimer?: string
  mediaLogos?: { alt: string; imageUrl?: string; url?: string }[]
  trustIcons?: { alt: string; imageUrl?: string; url?: string }[]
  note?: string
  disclaimer?: string
  bottomNav?: any[]
}

export async function Footer({
  tagline: taglineProp,
  columns: columnsProp,
  longDisclaimer: longDisclaimerProp,
  mediaLogos: mediaLogosProp,
  trustIcons: trustIconsProp,
  note: noteProp,
  disclaimer: disclaimerProp,
  bottomNav: bottomNavProp,
}: FooterProps = {}) {
  const year = new Date().getFullYear()
  let tagline = taglineProp
  let columns = columnsProp
  let longDisclaimer = longDisclaimerProp
  let mediaLogos = mediaLogosProp
  let trustIcons = trustIconsProp
  let note = noteProp
  let disclaimer = disclaimerProp
  let bottomNav = bottomNavProp

  const settings = await getSiteSettings().catch(() => null)
  tagline      = tagline      ?? settings?.footerTagline      ?? 'Your independent international guide to online casinos and casino bonuses. We compare the best offers.'
  columns      = columns      ?? (settings?.footerColumns?.length ? settings.footerColumns : DEFAULT_COLUMNS)
  longDisclaimer = longDisclaimer ?? settings?.footerLongDisclaimer ?? null
  mediaLogos   = mediaLogos   ?? settings?.footerMediaLogos   ?? []
  trustIcons   = trustIcons   ?? settings?.footerTrustIcons   ?? []
  note         = note         ?? settings?.footerNote         ?? `© ${year} Pokcas.com · Play responsibly · 18+`
  disclaimer   = disclaimer   ?? settings?.footerDisclaimer   ?? 'Affiliate links may be present · See terms at the casino'
  bottomNav    = bottomNav    ?? settings?.footerBottomNav    ?? []

  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-footer)',
      marginTop: '80px',
    }}>

      {/* ── Main grid: logo + columns ── */}
      <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '56px 24px 48px' }}>
        <div className="footer-main-grid">

          {/* Logo + tagline */}
          <div style={{ gridColumn: '1 / 2' }}>
            <div style={{ marginBottom: '16px' }}>
              <Image
                src="/logo.webp"
                alt="Pokcas"
                height={32}
                width={180}
                style={{ height: '32px', width: 'auto', display: 'block' }}
              />
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '220px', margin: 0 }}>
              {tagline}
            </p>
          </div>

          {/* Configurable link columns */}
          {(columns || []).map((col: any) => (
            <div key={col.title}>
              <div style={{
                fontSize: '11px', fontWeight: 700,
                color: 'var(--text-faint)',
                textTransform: 'uppercase', letterSpacing: '0.8px',
                marginBottom: '14px',
              }}>
                {col.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
      </div>

      {/* ── Divider ── */}
      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* ── Disclaimer + media + trust ── */}
      <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Long disclaimer text */}
        {longDisclaimer && (
          <p style={{
            fontSize: '12.5px', color: 'var(--text-faint)', lineHeight: 1.7,
            maxWidth: '820px', margin: '0 auto 36px', textAlign: 'center',
          }}>
            {longDisclaimer}
          </p>
        )}

        {/* Media logos */}
        {mediaLogos && mediaLogos.length > 0 && (
          <div style={{ marginBottom: '36px', textAlign: 'center' }}>
            <div style={{
              fontSize: '11px', fontWeight: 600, color: 'var(--text-faint)',
              textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '20px',
            }}>
              As mentioned in
            </div>
            <div style={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
              alignItems: 'center', gap: '28px',
            }}>
              {mediaLogos.map((logo) => {
                const img = logo.imageUrl ? (
                  <img
                    key={logo.alt}
                    src={logo.imageUrl}
                    alt={logo.alt}
                    style={{ height: '28px', width: 'auto', display: 'block', opacity: 0.55, filter: 'grayscale(1)' }}
                  />
                ) : (
                  <span key={logo.alt} style={{ fontSize: '13px', color: 'var(--text-faint)', fontWeight: 600 }}>
                    {logo.alt}
                  </span>
                )
                return logo.url ? (
                  <a key={logo.alt} href={logo.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                    {img}
                  </a>
                ) : img
              })}
            </div>
          </div>
        )}

        {/* Trust icons */}
        {trustIcons && trustIcons.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            alignItems: 'center', gap: '16px',
          }}>
            {trustIcons.map((icon) => {
              const img = icon.imageUrl ? (
                <img
                  key={icon.alt}
                  src={icon.imageUrl}
                  alt={icon.alt}
                  style={{ height: '40px', width: 'auto', display: 'block', opacity: 0.7 }}
                />
              ) : (
                <span key={icon.alt} style={{
                  fontSize: '11px', fontWeight: 700, color: 'var(--text-faint)',
                  border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 10px',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  {icon.alt}
                </span>
              )
              return icon.url ? (
                <a key={icon.alt} href={icon.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                  {img}
                </a>
              ) : img
            })}
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{
          maxWidth: '1250px', margin: '0 auto',
          padding: '18px 24px',
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', alignItems: 'center',
          gap: '10px',
        }}>
          {/* Left: copyright + disclaimer */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>{note}</p>
            {disclaimer && (
              <p style={{ fontSize: '12px', color: 'var(--text-faint)', margin: 0 }}>{disclaimer}</p>
            )}
          </div>

          {/* Right: bottom nav links + market selector */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
            {bottomNav && bottomNav.length > 0 && (
              <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {bottomNav.map((item: any) => {
                  const href = resolveUrl(item)
                  return (
                    <Link
                      key={href + item.label}
                      href={href}
                      style={{ fontSize: '12px', color: 'var(--text-faint)', textDecoration: 'none' }}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            )}
            <MarketSelector variant="footer" />
          </div>
        </div>
      </div>

    </footer>
  )
}
