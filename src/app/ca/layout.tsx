import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { getMarketSettings, getSiteSettings } from '@/lib/sanity'

function resolveUrl(item: {
  url?: string; pageSlug?: string; pageParentSlug?: string; pageParent2Slug?: string; pageParent3Slug?: string; pageMarket?: string;
  bookmakerSlug?: string; softwareSlug?: string; paymentMethodSlug?: string; postSlug?: string;
}): string {
  if (item.pageSlug) {
    const prefix = item.pageMarket === 'ca' ? '/ca' : item.pageMarket === 'au' ? '/au' : ''
    const segments = [item.pageParent3Slug, item.pageParent2Slug, item.pageParentSlug, item.pageSlug].filter(Boolean)
    return `${prefix}/${segments.join('/')}/`
  }
  if (item.bookmakerSlug) return `/ca/online-casino/review/${item.bookmakerSlug}/`
  if (item.softwareSlug) return `/ca/online-casino/software/${item.softwareSlug}/`
  if (item.paymentMethodSlug) return `/ca/online-casino/payment/${item.paymentMethodSlug}/`
  if (item.postSlug) return `/${item.postSlug}/`
  return item.url || '/'
}

export default async function CaLayout({ children }: { children: React.ReactNode }) {
  const [ms, gs] = await Promise.all([
    getMarketSettings('ca').catch(() => null),
    getSiteSettings().catch(() => null),
  ])

  // Header nav — market overrides global
  const rawNav = ms?.headerNav?.length ? ms.headerNav : gs?.headerNav
  const navItems = rawNav?.map((item: any) => ({
    label: item.label,
    href: resolveUrl(item),
    isHighlighted: item.isHighlighted ?? false,
    icon: item.icon ?? undefined,
    children: (item.children || []).map((c: any) => ({
      label: c.label,
      href: resolveUrl(c),
      children: (c.children || []).map((g: any) => ({ label: g.label, href: resolveUrl(g) })),
    })),
  }))

  // Footer — market overrides global
  const year = new Date().getFullYear()
  const tagline    = ms?.footerTagline    || gs?.footerTagline    || 'Your independent guide to online casinos for Canadian players.'
  const columns    = ms?.footerColumns?.length ? ms.footerColumns : (gs?.footerColumns?.length ? gs.footerColumns : undefined)
  const note       = ms?.footerNote       || gs?.footerNote       || `© ${year} Pokcas.com · Play responsibly · 18+`
  const disclaimer = ms?.footerDisclaimer || gs?.footerDisclaimer || 'Affiliate links may be present · See terms at the casino'

  return (
    <>
      <Navbar navItems={navItems} logoHref="/ca/" />
      {children}
      <Footer tagline={tagline} columns={columns} note={note} disclaimer={disclaimer} market="ca" />
    </>
  )
}
