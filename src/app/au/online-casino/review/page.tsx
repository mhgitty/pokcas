import { HeroSection } from '@/components/HeroSection'
import { AuthorBio } from '@/components/AuthorBio'
import { ComparisonTable } from '@/components/ComparisonTable'
import { CasinoReviewsArchive } from '@/components/CasinoReviewsArchive'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { HreflangLinks } from '@/components/HreflangLinks'
import { getPageByPathAu, getPageBySlugAu, getBookmarkersAu, getSiteSettings } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'
const CANONICAL = `${BASE}/au/online-casino/review/`

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getPageByPathAu(['online-casino', 'review']).catch(() => null))
    || (await getPageBySlugAu('au-reviews').catch(() => null))
  const title = replaceDateVars(page?.metaTitle || page?.title || 'Best Online Casinos Australia')
  const description = replaceDateVars(page?.metaDescription || page?.intro || 'Compare the best online casinos in Australia. Expert reviews, bonus info and ratings.')
  return { title, description, alternates: { canonical: CANONICAL } }
}

export default async function AuReviewsPage() {
  const [pathPage, legacyPage, bookmakers, settings] = await Promise.all([
    getPageByPathAu(['online-casino', 'review']).catch(() => null),
    getPageBySlugAu('au-reviews').catch(() => null),
    getBookmarkersAu().catch(() => []),
    getSiteSettings().catch(() => null),
  ])
  const page = pathPage || legacyPage
  const author = (page as any)?.author ?? settings?.defaultAuthor ?? null
  const title = page?.title || 'Best Online Casinos Australia'
  const intro = page?.intro || 'We have reviewed and ranked the best online casinos for Australian players. Compare welcome bonuses, wagering requirements and expert ratings.'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/au/` },
          { '@type': 'ListItem', position: 2, name: 'Online casino', item: `${BASE}/au/online-casino/` },
          { '@type': 'ListItem', position: 3, name: 'Casino reviews', item: CANONICAL },
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
      <HreflangLinks docId={(page as any)?._id} />
      <HeroSection
        title={title}
        intro={intro}
        author={author}
        updatedAt={(page as any)?.lastUpdated ?? null}
        factChecker={(page as any)?.factChecker ?? null}
        breadcrumbs={[{ label: 'Home', href: '/au/' }, { label: 'Online casino', href: '/au/online-casino/' }, { label: 'Casino reviews' }]}
      />

      {/* Comparison table — configured on the CMS page in Sanity Studio */}
      {(page as any)?.showComparisonTable && (page as any)?.comparisonTable && (
        <div className="section" style={{ paddingBottom: page?.body ? '0' : undefined }}>
          {(page as any)?.comparisonTableTitle && (
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              {replaceDateVars((page as any).comparisonTableTitle)}
            </h2>
          )}
          <ComparisonTable data={(page as any).comparisonTable} />
        </div>
      )}

      <CasinoReviewsArchive casinos={bookmakers as any[]} hrefPrefix="/au/online-casino/review" />

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

    </>
  )
}
