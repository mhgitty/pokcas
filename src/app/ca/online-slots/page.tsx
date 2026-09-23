import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CmsPageView } from '@/components/CmsPageView'
import { SlotsArchive } from '@/components/SlotsArchive'
import { getSlotmachinesForArchive, getPageByPathCa, getSiteSettings, getHreflangScript } from '@/lib/sanity'
import type { Metadata } from 'next'

export const revalidate = 3600
const BASE = 'https://pokcas.com'
const MARKET = 'ca' as const
const PATH = '/ca/online-slots'
const HOME = '/ca/'
const LANG = 'en-CA'
const FLAG = '🇨🇦'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByPathCa(['online-slots']).catch(() => null)
  const title = (page as any)?.metaTitle || (page as any)?.title || 'Online Slots'
  const description = (page as any)?.metaDescription || 'Browse, search and filter online slots by provider, RTP, volatility, features and more.'
  const canonical = `${BASE}${PATH}/`
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical } }
}

export default async function SlotsArchivePage() {
  const [slots, page] = await Promise.all([
    getSlotmachinesForArchive(MARKET),
    getPageByPathCa(['online-slots']).catch(() => null),
  ])

  const archive = (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '26px 15px 8px' }}>
      <SlotsArchive slots={slots as any} basePath={PATH} flag={FLAG} />
    </div>
  )

  // If a CMS "online-slots" page exists, render it (hero, quicklinks, date vars,
  // TOC, body) and slot the archive in right after the hero.
  if (page) {
    const [settings, hreflangScript] = await Promise.all([
      getSiteSettings().catch(() => null),
      getHreflangScript((page as any)._id).catch(() => null),
    ])
    return (
      <>
        <CmsPageView
          page={page}
          settings={settings}
          hreflangScript={hreflangScript}
          slug={['online-slots']}
          homeHref={HOME}
          lang={LANG}
          canonical={`${BASE}${PATH}/`}
          afterHero={archive}
        />
      </>
    )
  }

  // No CMS page — minimal hero + archive.
  return (
    <>
      <div style={{ background: 'var(--bg-hero)', paddingTop: '32px', paddingBottom: '28px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '0 15px' }}>
          <Breadcrumbs crumbs={[{ label: 'Home', href: HOME }, { label: 'Online slots' }]} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, color: 'var(--text)', margin: '18px 0 0', lineHeight: 1.15 }}>Online Slots</h1>
        </div>
      </div>
      {archive}
    </>
  )
}
