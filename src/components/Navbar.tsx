import Link from 'next/link'
import Image from 'next/image'
import { getSiteSettings } from '@/lib/sanity'
import { MobileMenu } from './MobileMenu'
import { MarketSelector } from './MarketSelector'
import { Icon } from './Icon'

const DEFAULT_NAV = [
  { label: 'Home',             url: '/',               isHighlighted: false, children: [] },
  { label: 'Casino Reviews',   url: '/review/', isHighlighted: false, children: [] },
  { label: 'Bonuses',          url: '/kampagner/',     isHighlighted: false, children: [] },
  { label: 'Guides & Articles', url: '/blog/',         isHighlighted: false, children: [] },
]

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

interface ResolvedNavItem { label: string; href: string; isHighlighted: boolean; icon?: string; children: { label: string; href: string }[] }

export async function Navbar({ navItems }: { navItems?: ResolvedNavItem[] } = {}) {
  let nav = navItems
  if (!nav) {
    const settings = await getSiteSettings().catch(() => null)
    const raw: any[] = settings?.headerNav?.length ? settings.headerNav : DEFAULT_NAV
    nav = raw.map((item: any) => ({
      label: item.label,
      href: resolveUrl(item),
      isHighlighted: item.isHighlighted ?? false,
      icon: item.icon ?? undefined,
      children: (item.children || []).map((c: any) => ({
        label: c.label,
        href: resolveUrl(c),
      })),
    }))
  }

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
            const inner = (
              <>
                {item.icon && <Icon name={item.icon} size={16} style={{ flexShrink: 0, opacity: 0.8 }} />}
                {item.label}
              </>
            )
            if (!item.children.length) {
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`nav-link${item.isHighlighted ? ' nav-link-cta' : ''}`}
                >
                  {inner}
                </Link>
              )
            }
            return (
              <div key={item.href + item.label} className="nav-item-dropdown">
                <Link href={item.href} className={`nav-link nav-link-has-children${item.isHighlighted ? ' nav-link-cta' : ''}`}>
                  {inner}
                  <Icon name="alt-arrow-down" size={14} style={{ marginLeft: '2px', flexShrink: 0, opacity: 0.5 }} />
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

        {/* Market selector — desktop (hidden on mobile via CSS) */}
        <div className="navbar-market-selector">
          <MarketSelector variant="navbar" />
        </div>

        {/* Mobile burger — client component */}
        <MobileMenu items={nav} />
      </div>
    </header>
  )
}
