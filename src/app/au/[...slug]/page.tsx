import { HeroSection } from '@/components/HeroSection'
import { AuthorBio } from '@/components/AuthorBio'
import { ComparisonTable } from '@/components/ComparisonTable'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { HreflangHead } from '@/components/HreflangHead'
import { getPageByPathAu, getSiteSettings, getHreflangScript, client } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RelatedPages } from '@/components/RelatedPages'

export const revalidate = 3600

const BASE = 'https://pokcas.com'

interface Props { params: Promise<{ slug: string[] }> }

export async function generateStaticParams() {
  const pages = await client.fetch<Array<{
    slug: { current: string }
    a1?: string; a2?: string; a3?: string; a4?: string
  }>>(
    `*[_type == "page" && market == "au" && defined(slug.current)] {
      slug,
      "a1": parent->slug.current,
      "a2": parent->parent->slug.current,
      "a3": parent->parent->parent->slug.current,
      "a4": parent->parent->parent->parent->slug.current
    }`
  ).catch(() => [])

  return pages.map((p) => {
    const ancestors = [p.a4, p.a3, p.a2, p.a1].filter(Boolean) as string[]
    return { slug: [...ancestors, p.slug.current] }
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageByPathAu(slug).catch(() => null)
  if (!page) return {}
  const title = replaceDateVars(page.metaTitle || page.title)
  const description = replaceDateVars(page.metaDescription || page.intro || '')
  const canonical = `${BASE}/au/${slug.join('/')}/`
  const ogImg = (page as any).ogImage
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, type: 'article', images: ogImg?.url ? [{ url: ogImg.url }] : [{ url: `${BASE}/og.png` }] } }
}

export default async function CaSlugPage({ params }: Props) {
  const { slug } = await params
  const [page, settings] = await Promise.all([
    getPageByPathAu(slug).catch(() => null),
    getSiteSettings().catch(() => null),
  ])
  if (!page) notFound()

  const hreflangScript = await getHreflangScript((page as any)._id).catch(() => null)
  const canonical = `${BASE}/au/${slug.join('/')}/`
  const hideAuthor = (page as any).hideAuthor ?? false
  const author = hideAuthor ? null : ((page as any).author ?? settings?.defaultAuthor ?? null)
  const factChecker = hideAuthor ? null : ((page as any).factChecker ?? null)

  const slugLabel = (s: string) => s.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())
  const breadcrumbs: { label: string; href?: string }[] = [
    { label: 'Home', href: '/au/' },
    ...slug.slice(0, -1).map((seg, idx) => ({
      label: slugLabel(seg),
      href: `/au/${slug.slice(0, idx + 1).join('/')}/`,
    })),
    { label: slugLabel(slug[slug.length - 1]) },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: crumb.label,
          ...(crumb.href ? { item: `${BASE}${crumb.href}` } : {}),
        })),
      },
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: replaceDateVars(page.title),
        inLanguage: 'en-AU',
        publisher: { '@type': 'Organization', name: 'Pokcas', url: BASE },
      },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <HreflangHead script={hreflangScript} />
      <HeroSection
        title={page.title}
        intro={page.intro ?? undefined}
        author={author}
        factChecker={factChecker}
        updatedAt={(page as any).lastUpdated ?? null}
        breadcrumbs={breadcrumbs}
      />

      {/* Comparison table — configured per page in Sanity Studio */}
      {(page as any).showComparisonTable && (page as any).comparisonTable && (
        <div className="section" style={{ paddingBottom: page.body ? '0' : undefined }}>
          {(page as any).comparisonTableTitle && (
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              {replaceDateVars((page as any).comparisonTableTitle)}
            </h2>
          )}
          <ComparisonTable data={(page as any).comparisonTable} />
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

      <RelatedPages docId={page._id} />

    </>
  )
}
