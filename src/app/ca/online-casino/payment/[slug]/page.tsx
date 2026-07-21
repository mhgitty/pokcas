import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { ComparisonTable } from '@/components/ComparisonTable'
import { HreflangLinks } from '@/components/HreflangLinks'
import { PaymentMethodHero } from '@/components/PaymentMethodHero'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { getPaymentMethodBySlugCa, client } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RelatedPages } from '@/components/RelatedPages'

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
      <HreflangLinks docId={(method as any)._id} />

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

      {/* Comparison table — configured on the CMS document in Sanity Studio */}
      {(method as any).showComparisonTable && (method as any).comparisonTable && (
        <div className="section" style={{ paddingBottom: (method.body && method.body.length > 0) ? '0' : undefined }}>
          {(method as any).comparisonTableTitle && (
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              {replaceDateVars((method as any).comparisonTableTitle)}
            </h2>
          )}
          <ComparisonTable data={(method as any).comparisonTable} />
        </div>
      )}

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

      <RelatedPages docId={method._id} />

    </>
  )
}
