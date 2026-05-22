import { HeroSection } from '@/components/HeroSection'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { getCountryHomepage, getBookmarkersAu, getSiteSettings } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { AuthorBio } from '@/components/AuthorBio'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'
const CANONICAL = `${BASE}/au/`

export async function generateMetadata(): Promise<Metadata> {
  const hp = await getCountryHomepage('au').catch(() => null)
  const title = replaceDateVars(hp?.metaTitle || hp?.heroHeading || 'Best Online Casinos Australia')
  const description = replaceDateVars(hp?.metaDescription || hp?.intro || 'Find the best online casinos and bonuses for Australian players.')
  const img = hp?.ogImage?.url
  return {
    title,
    description,
    alternates: { canonical: CANONICAL },
    openGraph: { title, description, url: CANONICAL, ...(img ? { images: [{ url: img }] } : {}) },
  }
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? 'var(--green)' : score >= 6 ? '#ca8a04' : '#dc2626'
  return (
    <span style={{ display: 'inline-block', background: color, color: '#fff', fontSize: '12px', fontWeight: 700, padding: '2px 9px', borderRadius: '20px' }}>
      ★ {score.toFixed(1)}
    </span>
  )
}

export default async function AuHomePage() {
  const [hp, bookmakers, settings] = await Promise.all([
    getCountryHomepage('au').catch(() => null),
    getBookmarkersAu().catch(() => []),
    getSiteSettings().catch(() => null),
  ])

  const title = hp?.heroHeading || 'Best Online Casinos in Australia'
  const intro = hp?.intro || 'Expert reviews of the top Australian online casinos. Compare welcome bonuses, wagering requirements and ratings.'
  const author = settings?.defaultAuthor ?? null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Australia', item: CANONICAL },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${CANONICAL}#webpage`,
        url: CANONICAL,
        name: title,
        description: intro,
        inLanguage: 'en-AU',
        publisher: { '@type': 'Organization', name: 'Pokcas', url: BASE },
      },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <HeroSection
        title={title}
        intro={intro}
        author={author}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Australia' }]}
      />

      {(bookmakers as any[]).length > 0 && (
        <div className="section" style={{ paddingBottom: hp?.body ? '0' : undefined }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
            Top Rated Australian Casinos
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(bookmakers as any[]).slice(0, 5).map((bm: any, i: number) => (
              <div key={bm._id} style={{
                background: 'var(--bg-card)',
                border: i === 0 ? '2px solid var(--green)' : '1px solid var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
              }}>
                {i === 0 && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    background: 'var(--green)', color: '#fff',
                    fontSize: '11px', fontWeight: 700, textAlign: 'center',
                    padding: '3px 0', letterSpacing: '0.5px',
                  }}>🏆 TOP RATED</div>
                )}
                <div style={{
                  display: 'grid', gridTemplateColumns: '40px 100px 1fr auto',
                  gap: '16px', padding: i === 0 ? '32px 24px 20px' : '20px 24px',
                  alignItems: 'center',
                }} className="bookmaker-card-inner">
                  <div style={{ fontSize: '18px', fontWeight: 800, color: i < 3 ? 'var(--green)' : 'var(--text-faint)', textAlign: 'center' }}>
                    #{i + 1}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {bm.logo?.url ? (
                      <div style={{ background: '#fff', borderRadius: '8px', padding: '6px 10px', border: '1px solid var(--border-faint)' }}>
                        <Image src={bm.logo.url} alt={bm.logo.alt || bm.name} width={80} height={40}
                          style={{ objectFit: 'contain', maxHeight: '40px', width: 'auto', display: 'block' }} />
                      </div>
                    ) : (
                      <div style={{ width: '80px', height: '40px', background: 'var(--bg-raised)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--text-faint)' }}>
                        {bm.name}
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{bm.name}</span>
                      {bm.score != null && <ScoreBadge score={bm.score} />}
                    </div>
                    {bm.usp && <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 6px', lineHeight: 1.5 }}>{bm.usp}</p>}
                    {bm.indbetalingsbonus && (
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>{bm.indbetalingsbonus}</div>
                    )}
                    {bm.terms && (
                      <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '4px', lineHeight: 1.4 }}>{bm.terms}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                    {bm.url && (
                      <a href={bm.url} target="_blank" rel="noopener noreferrer sponsored"
                        style={{ display: 'inline-block', background: 'var(--green)', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        Sign up →
                      </a>
                    )}
                    <Link href={`/au/reviews/${bm.slug.current}`}
                      style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      Read review
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {(bookmakers as any[]).length > 5 && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link href="/au/reviews/"
                style={{ display: 'inline-block', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}>
                See all {(bookmakers as any[]).length} casinos →
              </Link>
            </div>
          )}
        </div>
      )}

      {hp?.body && (
        <div className="article-layout">
          <article className="article-content">
            <MobileToc body={hp.body} />
            <PortableTextRenderer value={hp.body} />
          </article>
          <aside className="toc-sidebar">
            <TableOfContents body={hp.body} />
          </aside>
        </div>
      )}

      {author && (
        <div className="section" style={{ paddingTop: '0' }}>
          <AuthorBio author={author} compact />
        </div>
      )}
    </>
  )
}
