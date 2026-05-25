import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { StickyCtaBar } from '@/components/StickyCtaBar'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { getBookmakerBySlug, getPosts, getSiteSettings, client } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { AuthorBio } from '@/components/AuthorBio'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const bookmakers = await client.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "bookmaker" && defined(slug.current)] { slug }`
  ).catch(() => [])
  return bookmakers.map((b) => ({ slug: b.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const bm = await getBookmakerBySlug(slug).catch(() => null)
  if (!bm) return {}
  const title = replaceDateVars(bm.metaTitle || `${bm.name} Review — bonus & offers`)
  const description = replaceDateVars(bm.metaDescription || bm.intro || `Read our review of ${bm.name}. See bonus, wagering requirements and our rating.`)
  const canonical = `${BASE}/betting-sider/${slug}/`
  const img = bm.ogImage?.url ? bm.ogImage : bm.logo?.url ? bm.logo : null
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      ...(img ? { images: [{ url: img.url, alt: img.alt || title }] } : {}),
    },
    twitter: {
      title,
      description,
      ...(img ? { images: [img.url] } : {}),
    },
  }
}

function ScoreMeter({ score }: { score: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--green)' }}>
        {score.toFixed(1)}
      </div>
      <div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>out of 10</div>
        <div style={{ display: 'flex', gap: '3px' }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{
              width: '14px', height: '6px', borderRadius: '3px',
              background: i < Math.round(score) ? 'var(--green-dark)' : 'var(--border)',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function BookmakerPage({ params }: Props) {
  const { slug } = await params
  const [bm, latestPosts, settings] = await Promise.all([
    getBookmakerBySlug(slug).catch(() => null),
    getPosts(6),
    getSiteSettings().catch(() => null),
  ])
  if (!bm) notFound()
  const author = settings?.defaultAuthor ?? null

  const canonical = `${BASE}/betting-sider/${slug}/`

  const faqs = (bm.body || [])
    .filter((b: any) => b._type === 'faqBlock')
    .flatMap((b: any) => b.items || [])
    .filter((f: any) => f.question && f.answer)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Casino Reviews', item: `${BASE}/betting-sider/` },
          { '@type': 'ListItem', position: 3, name: bm.name, item: canonical },
        ],
      },
      {
        '@type': 'Review',
        itemReviewed: { '@type': 'Organization', name: bm.name, url: bm.url },
        reviewRating: bm.score != null ? { '@type': 'Rating', ratingValue: bm.score, bestRating: 10 } : undefined,
        author: { '@type': 'Organization', name: 'Pokcas' },
        url: canonical,
      },
      ...(faqs.length > 0 ? [{
        '@type': 'FAQPage',
        mainEntity: faqs.map((f: any) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }] : []),
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'var(--bg-hero)', borderBottom: '1px solid var(--border)', padding: '40px 15px 32px' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
          <Breadcrumbs crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Casino Reviews', href: '/betting-sider' },
            { label: bm.name },
          ]} />

          <div className="bm-hero">

            {/* Logo */}
            {bm.logo?.url && (
              <div className="bm-hero-logo" style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden' }}>
                <Image src={bm.logo.url} alt={bm.logo.alt || bm.name} width={80} height={80} style={{ objectFit: 'cover', width: '80px', height: '80px', display: 'block' }} />
              </div>
            )}

            {/* Title + USP */}
            <div className="bm-hero-title" style={{ minWidth: 0, alignSelf: 'center' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 4vw, 34px)', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
                {replaceDateVars(bm.titel || `${bm.name} Review`)}
              </h1>
              {bm.usp && <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{replaceDateVars(bm.usp)}</p>}
            </div>

            {/* Score */}
            {bm.score != null && (
              <div className="bm-hero-score" style={{ display: 'flex' }}>
                <ScoreMeter score={bm.score} />
              </div>
            )}

            {/* 2x2 Stats */}
            {(bm.minIndbetaling != null || bm.gennemspilskrav || bm.trustpilot != null || bm.lanceringsdato) && (
              <div className="bm-hero-stats">
                {bm.minIndbetaling != null && (
                  <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '1px' }}>Min. deposit</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{bm.minIndbetaling} kr.</div>
                    </div>
                  </div>
                )}
                {bm.gennemspilskrav && (
                  <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M21 3v5h-5"/><path d="M3 21v-5h5"/>
                    </svg>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '1px' }}>Wagering requirement</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{bm.gennemspilskrav}</div>
                    </div>
                  </div>
                )}
                {bm.trustpilot != null && (
                  <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '1px' }}>Trustpilot</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{bm.trustpilot.toFixed(1)} / 5</div>
                    </div>
                  </div>
                )}
                {bm.lanceringsdato && (
                  <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '1px' }}>Launched</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                        {new Date(bm.lanceringsdato).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bonus bar — full width below */}
          {(bm.indbetalingsbonus || bm.freeSpinsBonus || bm.url) && (
            <div style={{ marginTop: '24px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Bonus amounts row */}
              {(bm.indbetalingsbonus || bm.freeSpinsBonus) && (
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {bm.indbetalingsbonus && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deposit bonus</div>
                      <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{bm.indbetalingsbonus}</div>
                    </div>
                  )}
                  {bm.freeSpinsBonus && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Free spins</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green)' }}>{bm.freeSpinsBonus}</div>
                    </div>
                  )}
                </div>
              )}
              {/* CTA button */}
              {bm.url && (
                <a href={bm.url} target="_blank" rel="nofollow noopener noreferrer sponsored"
                  style={{ display: 'block', background: 'var(--green-dark)', color: '#fff', padding: '13px 24px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                  Get bonus →
                </a>
              )}
              {/* Terms */}
              {bm.terms && (
                <p style={{ fontSize: '10px', color: 'var(--text-faint)', margin: 0, lineHeight: 1.5 }}>{bm.terms}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky CTA — appears after hero scrolls out of view */}
      {bm.url && (
        <StickyCtaBar
          url={bm.url}
          name={bm.name}
          logoUrl={bm.logo?.url ?? null}
          logoAlt={bm.logo?.alt ?? null}
        />
      )}

      {/* Body content */}
      <div className="article-layout">
        <article className="article-content">
          {bm.body && <MobileToc body={bm.body} />}
          {bm.body && <PortableTextRenderer value={bm.body} posts={latestPosts as any} />}
        </article>
        {bm.body && (
          <aside className="toc-sidebar">
            <TableOfContents body={bm.body} />
          </aside>
        )}
      </div>

      {author && (
        <div className="section" style={{ paddingTop: '0' }}>
          <AuthorBio author={author} compact />
        </div>
      )}

      <Footer />
    </>
  )
}
