import { HeroSection } from '@/components/HeroSection'
import { AuthorBio } from '@/components/AuthorBio'
import { ComparisonTable } from '@/components/ComparisonTable'
import { GuidesArchive } from '@/components/GuidesArchive'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { HreflangLinks } from '@/components/HreflangLinks'
import { getPageBySlugUk, getCasinoGuides, getSiteSettings } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import type { Metadata } from 'next'
import { RelatedPages } from '@/components/RelatedPages'
import { heroButtonsFor } from '@/lib/heroButtons'
import { finalizeMeta, pageOgImages } from '@/lib/og'

export const revalidate = 3600

const BASE = 'https://pokcas.com'
const CANONICAL = `${BASE}/uk/casino-guides/`

async function buildMetadata(): Promise<Metadata> {
  const page = await getPageBySlugUk('casino-guides').catch(() => null)
  const title = replaceDateVars(page?.metaTitle || page?.title || 'Casino Guides')
  const description = replaceDateVars(page?.metaDescription || page?.intro || 'Casino guides and how-tos for UK players.')
  return { title, description, alternates: { canonical: CANONICAL }, openGraph: { images: pageOgImages(page) } }
}

export default async function CaCasinoGuidesPage() {
  const [page, guides, settings] = await Promise.all([
    getPageBySlugUk('casino-guides').catch(() => null),
    getCasinoGuides('uk').catch(() => []),
    getSiteSettings().catch(() => null),
  ])
  const author = (page as any)?.author ?? settings?.defaultAuthor ?? null
  const title = page?.title || 'Casino Guides'
  const intro = page?.intro || 'Browse our casino guides for UK players.'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/uk/` },
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
      <HeroSection
        buttons={heroButtonsFor(page)}
        title={title}
        intro={intro}
        author={author}
        updatedAt={(page as any)?.lastUpdated ?? null}
        factChecker={(page as any)?.factChecker ?? null}
        breadcrumbs={[{ label: 'Home', href: '/uk/' }, { label: 'Casino guides' }]}
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

      <GuidesArchive guides={guides as any[]} hrefPrefix="/uk/casino-guides" />

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
      <RelatedPages docId={page?._id} />

    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return finalizeMeta(await buildMetadata())
}
