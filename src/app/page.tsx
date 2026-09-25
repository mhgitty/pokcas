import Image from 'next/image'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import { Icon } from '@/components/Icon'
import { RichIntro } from '@/components/RichIntro'
import { getPosts, getHomepage, getHreflangScript } from '@/lib/sanity'
import { HreflangHead } from '@/components/HreflangHead'
import { replaceDateVars } from '@/lib/dateVars'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'

export async function generateMetadata(): Promise<Metadata> {
  const hp = await getHomepage().catch(() => null)
  const title = replaceDateVars(hp?.metaTitle || 'Best Online Casino Bonuses — Compare Top Offers')
  const description = replaceDateVars(hp?.metaDescription || 'Your independent international guide to online casino bonuses. We compare and review all the top casinos.')
  return {
    title,
    description,
    alternates: { canonical: BASE + '/' },
    openGraph: { title, description, url: BASE + '/', type: 'website', images: hp?.ogImage?.url ? [{ url: hp.ogImage.url }] : [{ url: `${BASE}/og.png` }] },
    twitter: { title, description },
  }
}

export default async function HomePage() {
  const [posts, hp] = await Promise.all([
    getPosts(20).catch(() => []),
    getHomepage().catch(() => null),
  ])

  const heroHeading = replaceDateVars(hp?.heroHeading || 'Find the Best Online Casino Bonuses')
  const heroIntro = hp?.intro ?? 'We compare and review all the top online casinos. Find the best welcome bonus and get started today.'

  const latestSectionTitle   = hp?.latestSectionTitle   || 'Latest'
  const casinoReviewsTitle   = hp?.casinoReviewsTitle   || 'Top Casino Reviews'
  const topRatedTitle        = hp?.topRatedTitle        || 'Top Rated Casinos'
  const featuredSectionTitle = hp?.featuredSectionTitle || 'Featured'

  const trustItems: { _key: string; icon?: string; title: string; body: string }[] = hp?.trustItems?.length > 0
    ? hp.trustItems
    : [
        { _key: 'trust-1', icon: 'cup-star',           title: 'Trusted by Brands & Players',    body: 'Operators, game developers, players, large media outlets & many key people recommend Pokcas as their number one choice.' },
        { _key: 'trust-2', icon: 'medal-ribbons-star',  title: 'Industry Leaders',               body: 'The only News, Reviews & Ranking platform of this kind in the world with over a decade of experience.' },
        { _key: 'trust-3', icon: 'scale',               title: 'Independent & Transparent',      body: 'Full ownership, no outside investors or influence. We hire independent journalists from all around the world.' },
      ]

  const faqs = (hp?.body ?? [])
    .filter((b: any) => b._type === 'faqBlock')
    .flatMap((b: any) => b.items ?? [])
    .filter((f: any) => f.question && f.answer)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${BASE}/#website`,
        url: BASE,
        name: 'Pokcas.dk',
        inLanguage: 'en-GB',
      },
      {
        '@type': 'Organization',
        '@id': `${BASE}/#organization`,
        name: 'Pokcas',
        url: BASE,
        logo: { '@type': 'ImageObject', url: `${BASE}/logo.webp` },
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

  const hreflangScript = await getHreflangScript('homepage').catch(() => null)

  const postList = posts as any[]

  const featuredPost = postList[0] ?? null
  const sidebarPosts = postList.slice(1, 5)

  return (
    <>
      <HreflangHead script={hreflangScript} />
      <JsonLd data={jsonLd} />
      <Navbar />

      {/* Hero */}
      <section className="hero-section">
        <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
          <h1 className="hero-heading">
            {heroHeading}
          </h1>
          <p className="hero-subtext">
            {typeof heroIntro === 'string' ? replaceDateVars(heroIntro) : <RichIntro value={heroIntro} />}
          </p>

          <div className="hero-markets">
            <span className="hero-markets-label">Choose your country</span>
            <div className="hero-markets-row">
              <a href="/ca/" className="hero-market-card">
                <span className="hero-market-flag">🇨🇦</span>
                <span className="hero-market-text">
                  <strong>Canada</strong>
                  <span>Best casinos &amp; bonuses in Canada</span>
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
              <a href="/au/" className="hero-market-card">
                <span className="hero-market-flag">🇦🇺</span>
                <span className="hero-market-text">
                  <strong>Australia</strong>
                  <span>Best casinos &amp; bonuses in Australia</span>
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '0 15px' }}>

        {/* ── 1. LATEST SECTION ───────────────────────────────────────────── */}
        {postList.length > 0 && (
          <section style={{ marginTop: '48px' }}>
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: '12px',
              background: 'var(--bg-card)',
              padding: '28px',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: '24px',
              }}>{latestSectionTitle}</h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
                gap: '24px',
              }}
                className="latest-grid"
              >
                {/* Featured post */}
                {featuredPost && (
                  <a href={`/${featuredPost.slug?.current ?? ''}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      {featuredPost.featuredImage?.url && (
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                          <Image
                            src={featuredPost.featuredImage.url}
                            alt={featuredPost.featuredImage.alt ?? featuredPost.title ?? ''}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, 560px"
                          />
                        </div>
                      )}
                      {featuredPost.category?.name && (
                        <span style={{
                          display: 'inline-block',
                          background: 'var(--green)',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          marginBottom: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          width: 'fit-content',
                        }}>
                          {featuredPost.category.name}
                        </span>
                      )}
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '20px',
                        fontWeight: 700,
                        color: 'var(--text)',
                        marginBottom: '10px',
                        lineHeight: 1.3,
                      }}>{featuredPost.title}</h3>
                      {featuredPost.excerpt && (
                        <p style={{ fontSize: '14px', color: 'var(--text-muted, #888)', lineHeight: 1.6, marginBottom: '10px' }}>
                          {featuredPost.excerpt}
                        </p>
                      )}
                      {featuredPost.publishedAt && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted, #888)' }}>
                          {new Date(featuredPost.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </a>
                )}

                {/* Sidebar posts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {sidebarPosts.map((post: any) => (
                    <a key={post._id} href={`/${post.slug?.current ?? ''}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        {post.featuredImage?.url && (
                          <div style={{ position: 'relative', width: '80px', minWidth: '80px', height: '56px', borderRadius: '6px', overflow: 'hidden' }}>
                            <Image
                              src={post.featuredImage.url}
                              alt={post.featuredImage.alt ?? post.title ?? ''}
                              fill
                              style={{ objectFit: 'cover' }}
                              sizes="80px"
                            />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {post.category?.name && (
                            <span style={{
                              display: 'inline-block',
                              background: 'var(--green)',
                              color: '#fff',
                              fontSize: '10px',
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: '3px',
                              marginBottom: '5px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}>
                              {post.category.name}
                            </span>
                          )}
                          <p style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--text)',
                            lineHeight: 1.35,
                            marginBottom: '4px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          } as React.CSSProperties}>{post.title}</p>
                          {post.publishedAt && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted, #888)' }}>
                              {new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* View all button */}
              <div style={{ textAlign: 'center', marginTop: '28px' }}>
                <a href="/" style={{
                  display: 'inline-block',
                  padding: '10px 28px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  textDecoration: 'none',
                  background: 'transparent',
                }}>View all articles</a>
              </div>
            </div>
          </section>
        )}

        {/* ── 4. TRUST SECTION ────────────────────────────────────────────── */}
        <section style={{ marginTop: '48px', marginBottom: '64px' }}>
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: '12px',
            background: 'var(--bg-card)',
            padding: '36px 28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '28px',
          }}
            className="trust-grid"
          >
            {trustItems.map((item, i) => (
              <div key={item._key} style={{
                textAlign: 'center',
                padding: '0 8px',
                ...(i === 1 ? { borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' } : {}),
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                  <Icon name={item.icon || 'shield-check'} size={36} color="var(--green)" />
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: '10px',
                }}>{item.title}</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>

      <Footer />

      <style>{`
        @media (max-width: 700px) {
          .latest-grid { grid-template-columns: 1fr !important; }
          .rankings-grid { grid-template-columns: 1fr !important; }
          .featured-cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .trust-grid { grid-template-columns: 1fr !important; }
          .trust-grid > div { border-left: none !important; border-right: none !important; border-top: 1px solid var(--border); padding-top: 24px; }
          .trust-grid > div:first-child { border-top: none; padding-top: 0; }
        }
      `}</style>
    </>
  )
}
