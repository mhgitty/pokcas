import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { getCasinoGameBySlugAu, client } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const games = await client.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "casinoGame" && market == "au" && defined(slug.current)] { slug }`
  ).catch(() => [])
  return games.map((g) => ({ slug: g.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const game = await getCasinoGameBySlugAu(slug).catch(() => null)
  if (!game) return {}
  const title = game.metaTitle || `${game.name} — Best Australian Online Casinos`
  const description = game.metaDescription || `Find the best Australian online casinos to play ${game.name}. Compare bonuses and sign up today.`
  const canonical = `${BASE}/au/casino-games/${slug}/`
  return { title, description, alternates: { canonical } }
}

export default async function AuCasinoGamePage({ params }: Props) {
  const { slug } = await params
  const game = await getCasinoGameBySlugAu(slug).catch(() => null)
  if (!game) notFound()

  const canonical = `${BASE}/au/casino-games/${slug}/`
  const h1 = game.titel || game.name

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Australia', item: `${BASE}/au/` },
      { '@type': 'ListItem', position: 3, name: 'Casino Games', item: `${BASE}/au/casino-games/` },
      { '@type': 'ListItem', position: 4, name: game.name, item: canonical },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Breadcrumbs + Hero */}
      <div style={{ background: 'var(--bg-hero)', paddingTop: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '0 15px' }}>
          <Breadcrumbs crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Australia', href: '/au/' },
            { label: 'Casino Games', href: '/au/casino-games/' },
            { label: game.name },
          ]} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
            {game.logo?.url && (
              <div style={{ flexShrink: 0, width: '72px', height: '72px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                <Image src={game.logo.url} alt={game.logo.alt || game.name} width={56} height={56}
                  style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
              </div>
            )}
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>
                {h1}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Intro */}
      {game.intro && game.intro.length > 0 && (
        <div className="section" style={{ maxWidth: '860px', margin: '0 auto' }}>
          <PortableTextRenderer value={game.intro} />
        </div>
      )}

      {/* Casino list */}
      {game.casinos && game.casinos.length > 0 && (
        <div className="section">
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
              Australian Casinos Where You Can Play {game.name}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {game.casinos.map((casino: any) => (
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
        </div>
      )}

      {/* Body content */}
      {game.body && game.body.length > 0 && (
        <div className="section" style={{ maxWidth: '860px', margin: '0 auto' }}>
          <PortableTextRenderer value={game.body} />
        </div>
      )}
    </>
  )
}
