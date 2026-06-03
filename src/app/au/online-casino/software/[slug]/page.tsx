import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { SoftwareHero } from '@/components/SoftwareHero'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { getSoftwareBySlugAu, client } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const providers = await client.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "software" && market == "au" && defined(slug.current)] { slug }`
  ).catch(() => [])
  return providers.map((p) => ({ slug: p.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const provider = await getSoftwareBySlugAu(slug).catch(() => null)
  if (!provider) return {}
  const title = replaceDateVars(provider.metaTitle || `${provider.name} Casinos Australia — best ${provider.name} online casinos`)
  const description = replaceDateVars(provider.metaDescription || `Find the best Australian online casinos powered by ${provider.name}. Compare bonuses and ratings.`)
  const canonical = `${BASE}/au/online-casino/software/${slug}/`
  const logo = provider.logo
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, type: 'article', images: logo?.url ? [{ url: logo.url }] : [{ url: `${BASE}/og.png` }] } }
}

export default async function AuSoftwareSlugPage({ params }: Props) {
  const { slug } = await params
  const provider = await getSoftwareBySlugAu(slug).catch(() => null)
  if (!provider) notFound()

  const canonical = `${BASE}/au/online-casino/software/${slug}/`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',          item: `${BASE}/au/` },
      { '@type': 'ListItem', position: 2, name: 'Online casino', item: `${BASE}/au/online-casino/` },
      { '@type': 'ListItem', position: 3, name: 'Software',      item: `${BASE}/au/online-casino/software/` },
      { '@type': 'ListItem', position: 4, name: slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()), item: canonical },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Breadcrumbs */}
      <div style={{ background: 'var(--bg-hero)', paddingTop: '32px', paddingBottom: '0' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '0 15px' }}>
          <Breadcrumbs crumbs={[
            { label: 'Home',          href: '/au/' },
            { label: 'Online casino', href: '/au/online-casino/' },
            { label: 'Software',      href: '/au/online-casino/software/' },
            { label: slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()) },
          ]} />
        </div>
      </div>

      {/* Hero */}
      <SoftwareHero
        name={provider.name}
        titel={replaceDateVars(provider.titel)}
        logo={provider.logo}
        rtp={provider.rtp}
        amountOfSlots={provider.amountOfSlots}
        licenses={provider.licenses}
        gameCategories={provider.gameCategories}
        highestRtpSlot={provider.highestRtpSlot}
        bonusBuys={provider.bonusBuys}
        intro={provider.intro}
      />

      {/* Body content */}
      {provider.body && provider.body.length > 0 && (
        <div className="article-layout">
          <article className="article-content">
            <MobileToc body={provider.body} />
            <PortableTextRenderer value={provider.body} />
          </article>
          <aside className="toc-sidebar">
            <TableOfContents body={provider.body} />
          </aside>
        </div>
      )}

      {/* Casino list */}
      {provider.casinos && provider.casinos.length > 0 && (
        <div className="section">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
            Australian Casinos Using {provider.name}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {provider.casinos.map((casino: any) => (
              <div key={casino._id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                {casino.logo?.url && (
                  <div style={{ flexShrink: 0, width: '64px', height: '32px', display: 'flex', alignItems: 'center' }}>
                    <Image src={casino.logo.url} alt={casino.logo.alt || casino.name}
                      width={64} height={32}
                      style={{ objectFit: 'contain', maxHeight: '32px', width: 'auto' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '14px' }}>{casino.name}</div>
                  {casino.usp && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{casino.usp}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {casino.url && (
                    <a href={casino.url} target="_blank" rel="nofollow noopener noreferrer sponsored"
                      style={{ background: 'var(--green)', color: '#fff', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                      Sign up
                    </a>
                  )}
                  <Link href={`/au/reviews/${casino.slug.current}/`}
                    style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', border: '1px solid var(--border)' }}>
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
