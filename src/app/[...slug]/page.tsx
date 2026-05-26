import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { HeroSection } from '@/components/HeroSection'
import { ComparisonTable } from '@/components/ComparisonTable'
import { AuthorBio } from '@/components/AuthorBio'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { getPageByPath, getSiteSettings } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'

interface Props { params: Promise<{ slug: string[] }> }

function buildPath(segments: string[]) {
  return '/' + segments.join('/') + '/' + '/'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageByPath(slug).catch(() => null)
  if (!page) return {}
  const title = replaceDateVars(page.metaTitle || page.title)
  const description = replaceDateVars(page.metaDescription || page.intro || '')
  const canonical = `${BASE}${buildPath(slug)}`
  return { title, description, alternates: { canonical } }
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params
  const [page, settings] = await Promise.all([
    getPageByPath(slug).catch(() => null),
    getSiteSettings().catch(() => null),
  ])
  if (!page) notFound()
  const author = page.author ?? settings?.defaultAuthor ?? null

  const canonical = `${BASE}${buildPath(slug)}`

  // Build breadcrumb — include grandparent and parent if present
  const breadcrumbItems = [{ name: 'Home', item: BASE }]
  if (page.grandparentSlug && page.grandparentTitle) {
    breadcrumbItems.push({ name: page.grandparentTitle, item: `${BASE}/${page.grandparentSlug}/` })
  }
  if (page.parentSlug && page.parentTitle) {
    const parentPath = page.grandparentSlug
      ? `${BASE}/${page.grandparentSlug}/${page.parentSlug}/`
      : `${BASE}/${page.parentSlug}/`
    breadcrumbItems.push({ name: page.parentTitle, item: parentPath })
  }
  breadcrumbItems.push({ name: page.title, item: canonical })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems.map((item, i) => ({
          '@type': 'ListItem', position: i + 1, name: item.name, item: item.item,
        })),
      },
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: page.title,
        description: page.intro || '',
        inLanguage: 'en-GB',
        publisher: { '@type': 'Organization', name: 'Pokcas', url: BASE },
      },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <Navbar />
      <HeroSection
        title={page.title}
        intro={page.intro}
        author={author}
        factChecker={page.factChecker}
        updatedAt={page.lastUpdated}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          ...(page.grandparentSlug && page.grandparentTitle
            ? [{ label: page.grandparentTitle, href: `/${page.grandparentSlug}/` }]
            : []),
          ...(page.parentSlug && page.parentTitle
            ? [{ label: page.parentTitle, href: page.grandparentSlug ? `/${page.grandparentSlug}/${page.parentSlug}/` : `/${page.parentSlug}/` }]
            : []),
          { label: page.title },
        ]}
      />

      {/* Comparison table — configured per page in Sanity Studio */}
      {page.showComparisonTable && page.comparisonTable && (
        <div className="section" style={{ paddingBottom: page.body ? '0' : undefined }}>
          {page.comparisonTableTitle && (
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              {page.comparisonTableTitle}
            </h2>
          )}
          <ComparisonTable data={page.comparisonTable} />
        </div>
      )}

      {page.body && (
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
    </>
  )
}
