import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { SlotsArchive } from '@/components/SlotsArchive'
import { getSlotmachinesForArchive, getPageByPathAu } from '@/lib/sanity'
import type { Metadata } from 'next'

export const revalidate = 3600
const BASE = 'https://pokcas.com'
const MARKET = 'au' as const
const PATH = '/au/online-slots'
const HOME = '/au/'
const FLAG = '🇦🇺'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByPathAu(['online-slots']).catch(() => null)
  const title = (page as any)?.metaTitle || (page as any)?.title || 'Online Slots'
  const description = (page as any)?.metaDescription || 'Browse, search and filter online slots by provider, RTP, volatility, features and more.'
  const canonical = `${BASE}${PATH}/`
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical } }
}

export default async function SlotsArchivePage() {
  const [slots, page] = await Promise.all([
    getSlotmachinesForArchive(MARKET),
    getPageByPathAu(['online-slots']).catch(() => null),
  ])
  const h1 = (page as any)?.title || 'Online Slots'

  return (
    <>
      <div style={{ background: 'var(--bg-hero)', paddingTop: '32px', paddingBottom: '28px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '0 15px' }}>
          <Breadcrumbs crumbs={[{ label: 'Home', href: HOME }, { label: 'Online slots' }]} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, color: 'var(--text)', margin: '18px 0 0', lineHeight: 1.15 }}>{h1}</h1>
          {(page as any)?.intro && (page as any).intro.length > 0 && (
            <div style={{ marginTop: '14px', color: 'var(--text-muted)', maxWidth: '820px' }}>
              <PortableTextRenderer value={(page as any).intro} />
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '26px 15px 40px' }}>
        <SlotsArchive slots={slots as any} basePath={PATH} flag={FLAG} />
      </div>

      {(page as any)?.body && (
        <div className="article-layout">
          <article className="article-content">
            <PortableTextRenderer value={(page as any).body} />
          </article>
        </div>
      )}

    </>
  )
}
