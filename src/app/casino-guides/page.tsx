import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { HeroSection } from '@/components/HeroSection'
import { AuthorBio } from '@/components/AuthorBio'
import { ComparisonTable } from '@/components/ComparisonTable'
import { GuidesArchive } from '@/components/GuidesArchive'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { HreflangLinks } from '@/components/HreflangLinks'
import { getPageBySlug, getCasinoGuides, getSiteSettings } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import type { Metadata } from 'next'
import { RelatedPages } from '@/components/RelatedPages'

export const revalidate = 3600

const BASE = 'https://pokcas.com'
const CANONICAL = `${BASE}/casino-guides/`

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('casino-guides').catch(() => null)
  const title = replaceDateVars(page?.metaTitle || page?.title || 'Casino Guides')
  const description = replaceDateVars(page?.metaDescription || page?.intro || 'Casino guides, strategies and how-tos.')
  return { title, description, alternates: { canonical: CANONICAL } }
}

export default async function CasinoGuidesPage() {
  const [page, guides, settings] = await Promise.all([
    getPageBySlug('casino-guides').catch(() => null),
    getCasinoGuides('global').catch(() => []),
    getSiteSettings().catch(() => null),
  ])
  const author = (page as any)?.author ?? settings?.defaultAuthor ?? null
  const title = page?.title || 'Casino Guides'
  const intro = page?.intro || 'Browse our casino guides, strategies and how-tos.'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
          { '@type': 'ListItem', position: 2, name: 'Casino guides', item: CANONICAL },
        ],
      },
      {
        '@type': 'WebPage', '@id': `${CANONICAL}#webpage`, url: CANONICAL,
        name: title, inLanguage: 'en-GB',
        publisher: { '@type': 'Organization', name: 'Pokcas', url: BASE },
      },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <HreflangLinks docId={(page as any)?._id} />
      <Navbar />
      <HeroSection
        title={title}
        intro={intro}
        author={author}
        updatedAt={(page as any)?.lastUpdated ?? null}
        factChecker={(page as any)?.factChecker ?? null}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Casino guides' }]}
      />

      {(page as any)?.showComparisonTable && (page as any)?.comparisonTable && (
        <div className="section" style={{ paddingBottom: '0' }}>
          {(page as any)?.comparisonTableTitle && (
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              {replaceDateVars((page as any).comparisonTableTitle)}
            </h2>
          )}
          <ComparisonTable data={(page as any).comparisonTable} />
        </div>
      )}

      <GuidesArchive guides={guides as any[]} hrefPrefix="/casino-guides" />

      {page?.body && (
        <div className="article-layout">
          <article className="article-content">
            <MobileToc body={page.body} />
            <PortableTextRenderer value={page.body} />
          </article>
          <aside className="toc-sidebar">
            <TableOfContents body={page.body} />
          </aside>
        </div>
      )}

      {author && (
        <div className="section" style={{ paddingTop: '0' }}>
          <AuthorBio author={author} compact />
        </div>
      )}
      <Footer />
      <RelatedPages docId={page?._id} />

    </>
  )
}
