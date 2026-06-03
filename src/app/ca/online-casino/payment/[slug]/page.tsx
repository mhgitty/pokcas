import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { PaymentMethodHero } from '@/components/PaymentMethodHero'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { getPaymentMethodBySlugCa, client } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const methods = await client.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "paymentMethod" && market == "ca" && defined(slug.current)] { slug }`
  ).catch(() => [])
  return methods.map((m) => ({ slug: m.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const method = await getPaymentMethodBySlugCa(slug).catch(() => null)
  if (!method) return {}
  const title = replaceDateVars(method.metaTitle || `${method.name} Casinos Canada — pay with ${method.name}`)
  const description = replaceDateVars(method.metaDescription || `Find the best Canadian online casinos that accept ${method.name}. Compare withdrawal times, fees and bonuses.`)
  const canonical = `${BASE}/ca/online-casino/payment/${slug}/`
  const logo = method.logo
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, type: 'article', images: logo?.url ? [{ url: logo.url }] : [{ url: `${BASE}/og.png` }] } }
}

export default async function CaPaymentSlugPage({ params }: Props) {
  const { slug } = await params
  const method = await getPaymentMethodBySlugCa(slug).catch(() => null)
  if (!method) notFound()

  const canonical = `${BASE}/ca/online-casino/payment/${slug}/`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',            item: `${BASE}/ca/` },
      { '@type': 'ListItem', position: 2, name: 'Online casino',   item: `${BASE}/ca/online-casino/` },
      { '@type': 'ListItem', position: 3, name: 'Payment methods', item: `${BASE}/ca/online-casino/payment/` },
      { '@type': 'ListItem', position: 4, name: slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()), item: canonical },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Breadcrumbs (above hero card) */}
      <div style={{ background: 'var(--bg-hero)', paddingTop: '32px', paddingBottom: '0' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '0 15px' }}>
          <Breadcrumbs crumbs={[
            { label: 'Home',            href: '/ca/' },
            { label: 'Online casino',   href: '/ca/online-casino/' },
            { label: 'Payment methods', href: '/ca/online-casino/payment/' },
            { label: slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()) },
          ]} />
        </div>
      </div>

      {/* Hero card */}
      <PaymentMethodHero
        name={method.name}
        titel={replaceDateVars(method.titel)}
        logo={method.logo}
        paymentCategory={method.paymentCategory}
        withdrawalTime={method.withdrawalTime}
        transactionFees={method.transactionFees}
        eligibleForBonuses={method.eligibleForBonuses}
        intro={method.intro}
      />

      {/* Body content */}
      {method.body && method.body.length > 0 && (
        <div className="article-layout">
          <article className="article-content">
            <MobileToc body={method.body} />
            <PortableTextRenderer value={method.body} />
          </article>
          <aside className="toc-sidebar">
            <TableOfContents body={method.body} />
          </aside>
        </div>
      )}

      {/* Casino list */}
      {method.casinos && method.casinos.length > 0 && (
        <div className="section">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
            Canadian Casinos Accepting {method.name}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {method.casinos.map((casino: any) => (
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
                  <Link href={`/ca/reviews/${casino.slug.current}/`}
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
