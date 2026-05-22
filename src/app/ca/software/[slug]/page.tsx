import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { getSoftwareBySlugCa, client } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const providers = await client.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "software" && market == "ca" && defined(slug.current)] { slug }`
  ).catch(() => [])
  return providers.map((p) => ({ slug: p.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const provider = await getSoftwareBySlugCa(slug).catch(() => null)
  if (!provider) return {}
  const title = `${provider.name} Casinos Canada — best ${provider.name} online casinos`
  const description = `Find the best Canadian online casinos powered by ${provider.name}. Compare bonuses and ratings.`
  const canonical = `${BASE}/ca/software/${slug}/`
  return { title, description, alternates: { canonical } }
}

export default async function CaSoftwareSlugPage({ params }: Props) {
  const { slug } = await params
  const provider = await getSoftwareBySlugCa(slug).catch(() => null)
  if (!provider) notFound()

  const canonical = `${BASE}/ca/software/${slug}/`
  const title = provider.titel || provider.name

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Canada', item: `${BASE}/ca/` },
      { '@type': 'ListItem', position: 3, name: provider.name, item: canonical },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />

      <div style={{ background: 'var(--bg-hero)', borderBottom: '1px solid var(--border)', padding: '40px 15px 32px' }}>
        <div style={{ maxWidth: '1220px', margin: '0 auto' }}>
          <Breadcrumbs crumbs={[{ label: 'Home', href: '/' }, { label: 'Canada', href: '/ca/' }, { label: provider.name }]} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            {provider.logo?.url && (
              <div style={{ width: '56px', height: '56px', background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', flexShrink: 0 }}>
                <Image src={provider.logo.url} alt={provider.logo.alt || provider.name} width={40} height={40}
                  style={{ objectFit: 'contain', maxWidth: '40px', maxHeight: '40px' }} />
              </div>
            )}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>
              {title}
            </h1>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0 }}>
            Canadian online casinos powered by {provider.name} software.
          </p>
        </div>
      </div>

      {provider.casinos && provider.casinos.length > 0 && (
        <div className="section">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
            Canadian Casinos Using {provider.name}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {provider.casinos.map((casino: any) => (
              <div key={casino._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                {casino.logo?.url && (
                  <div style={{ flexShrink: 0, width: '64px', height: '32px', display: 'flex', alignItems: 'center' }}>
                    <Image src={casino.logo.url} alt={casino.logo.alt || casino.name} width={64} height={32}
                      style={{ objectFit: 'contain', maxHeight: '32px', width: 'auto' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '14px' }}>{casino.name}</div>
                  {casino.usp && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{casino.usp}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {casino.url && (
                    <a href={casino.url} target="_blank" rel="noopener noreferrer sponsored"
                      style={{ background: 'var(--green)', color: '#fff', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                      Sign up
                    </a>
                  )}
                  <Link href={`/ca/reviews/${casino.slug.current}`}
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
