import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { HreflangLinks } from '@/components/HreflangLinks'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { SlotSpecs } from '@/components/SlotSpecs'
import { SlotDemo } from '@/components/SlotDemo'
import { RelatedPages } from '@/components/RelatedPages'
import { getSlotmachineBySlug, client } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const revalidate = 3600
const BASE = 'https://pokcas.com'
const PATH = '/online-slots'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slots = await client.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "slotmachine" && (market == "global" || !defined(market)) && defined(slug.current)] { slug }`
  ).catch(() => [])
  return slots.map((s) => ({ slug: s.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const slot = await getSlotmachineBySlug(slug).catch(() => null)
  if (!slot) return {}
  const title = slot.metaTitle || `${slot.name} slot${slot.provider?.name ? ` by ${slot.provider.name}` : ''} — review & where to play`
  const description = slot.metaDescription || `${slot.name}${slot.rtp ? ` — RTP ${slot.rtp}` : ''}. Review, specs and casinos where you can play.`
  const canonical = `${BASE}${PATH}/${slug}/`
  const ogUrl = slot.ogImage?.url || slot.logo?.url || `${BASE}/og.png`
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, type: 'article', images: [{ url: ogUrl }] }, twitter: { card: 'summary_large_image', images: [ogUrl] } }
}

export default async function SlotPage({ params }: Props) {
  const { slug } = await params
  const slot = await getSlotmachineBySlug(slug).catch(() => null)
  if (!slot) notFound()

  const canonical = `${BASE}${PATH}/${slug}/`
  const h1 = slot.titel || slot.name
  const label = (s: string) => s.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

  const hasDemo = !!(slot.demoIframe && slot.demoIframe.trim())
  const hasCasinos = Array.isArray(slot.casinos) && slot.casinos.length > 0
  const hasBody = Array.isArray(slot.body) && slot.body.length > 0

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Online slots', item: `${BASE}/online-slots/` },
      { '@type': 'ListItem', position: 3, name: label(slug), item: canonical },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <HreflangLinks docId={(slot as any)._id} />
      <Navbar />

      <div style={{ background: 'var(--bg-hero)', paddingTop: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '0 15px' }}>
          <Breadcrumbs crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Online slots', href: '/online-slots/' },
            { label: label(slug) },
          ]} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
            {slot.logo?.url && (
              <div style={{ flexShrink: 0, width: '120px', height: '80px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <Image src={slot.logo.url} alt={slot.logo.alt || slot.name} width={120} height={80} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              </div>
            )}
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{h1}</h1>
              {slot.provider?.name && <div style={{ fontSize: '14px', color: 'var(--gold)', fontWeight: 600, marginTop: '6px' }}>by {slot.provider.name}</div>}
            </div>
          </div>

          {slot.intro && slot.intro.length > 0 && (
            <div style={{ marginTop: '18px', maxWidth: '760px', color: 'var(--text-muted)' }}><PortableTextRenderer value={slot.intro} /></div>
          )}

          {(hasDemo || hasCasinos || hasBody) && (
            <div className="slot-jump-btns">
              {hasDemo && <a href="#free-demo" className="slot-jump-btn slot-jump-btn--primary">▶ Free demo</a>}
              {hasCasinos && <a href="#real-money" className="slot-jump-btn">💰 Real money play</a>}
              {hasBody && <a href="#review" className="slot-jump-btn">📖 Read review</a>}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 15px' }}>
        <SlotDemo embed={slot.demoIframe} title={slot.demoIframeTitle} slotName={slot.name} provider={slot.provider} rtp={slot.rtp} promoCasino={slot.promoCasino} />

        <div className="section" style={{ paddingTop: '20px', paddingBottom: 0 }}>
          <SlotSpecs slot={slot} />
        </div>

        {hasCasinos && (
          <div id="real-money" className="section" style={{ paddingBottom: 0, scrollMarginTop: '80px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
              Play {slot.name} for real money
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {slot.casinos.map((casino: any) => {
                const mp = casino.market === 'ca' ? '/ca' : casino.market === 'au' ? '/au' : ''
                const reviewHref = mp ? `${mp}/online-casino/review/${casino.slug.current}/` : `/review/${casino.slug.current}/`
                return (
                  <div key={casino._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {casino.logo?.url && (
                      <div style={{ flexShrink: 0, width: '64px', height: '32px', display: 'flex', alignItems: 'center' }}>
                        <Image src={casino.logo.url} alt={casino.logo.alt || casino.name} width={64} height={32} style={{ objectFit: 'contain', maxHeight: '32px', width: 'auto' }} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '14px' }}>{casino.name}</div>
                      {casino.usp && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{casino.usp}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      {casino.url && (
                        <a href={casino.url} target="_blank" rel="nofollow noopener noreferrer sponsored" style={{ background: 'var(--green)', color: '#fff', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Sign up</a>
                      )}
                      <Link href={reviewHref} style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', border: '1px solid var(--border)' }}>Review</Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {hasBody && (
          <div id="review" className="section" style={{ scrollMarginTop: '80px' }}><PortableTextRenderer value={slot.body} /></div>
        )}
      </div>

      <RelatedPages docId={slot?._id} />
      <Footer />
    </>
  )
}
