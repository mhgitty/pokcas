import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ComparisonTable } from '@/components/ComparisonTable'
import { PostCard } from '@/components/PostCard'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { JsonLd } from '@/components/JsonLd'
import { getPosts, getHomepage } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'

export async function generateMetadata(): Promise<Metadata> {
  const hp = await getHomepage().catch(() => null)
  const title = replaceDateVars(hp?.metaTitle || 'Sammenlign betting bonusser — find de bedste tilbud i Danmark')
  const description = replaceDateVars(hp?.metaDescription || 'Danmarks uafhængige guide til betting bonusser. Vi sammenligner og anmelder alle store bookmakers.')
  return {
    title,
    description,
    alternates: { canonical: BASE + '/' },
    openGraph: { title, description, url: BASE, type: 'website' },
    twitter: { title, description },
  }
}

export default async function HomePage() {
  const [posts, hp] = await Promise.all([
    getPosts(6).catch(() => []),
    getHomepage().catch(() => null),
  ])

  const heroHeading = replaceDateVars(hp?.heroHeading || 'Find de bedste betting bonusser i Danmark')
  const heroSubtext = replaceDateVars(hp?.intro || 'Vi sammenligner og anmelder alle store bookmakers i Danmark. Find den bedste velkomstbonus og kom godt i gang.')

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
        inLanguage: 'da-DK',
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

  return (
    <>
      <JsonLd data={jsonLd} />
      <Navbar />

      {/* Hero */}
      <section className="hero-section">
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h1 className="hero-heading">
            {heroHeading}
          </h1>
          <p className="hero-subtext">{heroSubtext}</p>
        </div>
      </section>

      {/* Comparison table — configured in Sanity Studio */}
      {hp?.showComparisonTable && hp?.comparisonTable && (
        <div className="section" style={{ paddingBottom: hp?.body ? '0' : undefined }}>
          {hp.comparisonTableTitle && (
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              {hp.comparisonTableTitle}
            </h2>
          )}
          <ComparisonTable data={hp.comparisonTable} />
        </div>
      )}

      {/* Body content from Sanity */}
      {hp?.body && (
        <div className="article-layout" style={{ paddingBottom: '0' }}>
          <div className="article-content">
            <PortableTextRenderer value={hp.body} posts={posts as any} />
          </div>
          <aside className="toc-sidebar">
            <TableOfContents body={hp.body} />
          </aside>
        </div>
      )}

      {/* Latest articles */}
      {(posts as any[]).length > 0 && (
        <section style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>Seneste guides & artikler</h2>
              <a href="/blog" style={{ fontSize: '13.5px', color: 'var(--green)', textDecoration: 'none', fontWeight: 500 }}>Se alle →</a>
            </div>
            <div className="blog-grid">
              {(posts as any[]).map((post: any) => <PostCard key={post._id} {...post} />)}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  )
}
