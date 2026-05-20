import Link from 'next/link'
import Image from 'next/image'
import { getSiteSettings } from '@/lib/sanity'
import { MobileMenu } from './MobileMenu'

const DEFAULT_NAV = [
  { label: 'Home',             url: '/',               isHighlighted: false, children: [] },
  { label: 'Casino Reviews',   url: '/review/', isHighlighted: false, children: [] },
  { label: 'Bonuses',          url: '/kampagner/',     isHighlighted: false, children: [] },
  { label: 'Guides & Articles', url: '/blog/',         isHighlighted: false, children: [] },
]

function resolveUrl(item: {
  url?: string; pageSlug?: string; pageParentSlug?: string; bookmakerSlug?: string
}): string {
  if (item.pageSlug) {
    return item.pageParentSlug
      ? `/${item.pageParentSlug}/${item.pageSlug}/`
      : `/${item.pageSlug}/`
  }
  if (item.bookmakerSlug) return `/review/${item.bookmakerSlug}/`
  return item.url || '/'
}

export async function Navbar() {
  const settings = await getSiteSettings().catch(() => null)
  const raw: any[] = settings?.headerNav?.length ? settings.headerNav : DEFAULT_NAV

  // Resolve all URLs server-side so MobileMenu (client) gets plain strings
  const nav = raw.map((item: any) => ({
    label: item.label,
    href: resolveUrl(item),
    isHighlighted: item.isHighlighted ?? false,
    children: (item.children || []).map((c: any) => ({
      label: c.label,
      href: resolveUrl(c),
    })),
  }))

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <Image
            src="/logo.webp"
            alt="Pokcas"
            height={36}
            width={200}
            style={{ height: '36px', width: 'auto', display: 'block' }}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="navbar-nav">
          {nav.map((item) => {
            if (!item.children.length) {
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`nav-link${item.isHighlighted ? ' nav-link-cta' : ''}`}
                >
                  {item.label}
                </Link>
              )
            }
            return (
              <div key={item.href + item.label} className="nav-item-dropdown">
                <Link href={item.href} className={`nav-link nav-link-has-children${item.isHighlighted ? ' nav-link-cta' : ''}`}>
                  {item.label}
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: '4px', flexShrink: 0 }}>
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <div className="nav-dropdown">
                  {item.children.map((child: { href: string; label: string }) => (
                    <Link key={child.href + child.label} href={child.href} className="nav-dropdown-item">
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Mobile burger — client component */}
        <MobileMenu items={nav} />
      </div>
    </header>
  )
}
