import { HeroSection } from '@/components/HeroSection'
import { HreflangHead } from '@/components/HreflangHead'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { AuthorBio } from '@/components/AuthorBio'
import { JsonLd } from '@/components/JsonLd'
import { getPageByPathCa, getSiteSettings, getHreflangScript } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'
const CANONICAL = `${BASE}/ca/online-casino/bonus/`

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByPathCa(['online-casino', 'bonus']).catch(() => null)
  if (!page) return {}
  const title = replaceDateVars(page.metaTitle || page.title)
  const description = replaceDateVars(page.metaDescription || page.intro || '')
  const ogImg = (page as any).ogImage
  return {
    title,
    description,
    alternates: { canonical: CANONICAL },
    openGraph: {
      title, description, url: CANONICAL, type: 'article',
      images: ogImg?.url ? [{ url: ogImg.url }] : [{ url: `${BASE}/og.png` }],
    },
  }
}

export default async function CaBonusPage() {
  const [page, settings] = await Promise.all([
    getPageByPathCa(['online-casino', 'bonus']).catch(() => null),
    getSiteSettings().catch(() => null),
  ])
  if (!page) notFound()

  const hreflangScript = await getHreflangScript((page as any)._id).catch(() => null)
  const hideAuthor = (page as any).hideAuthor ?? false
  const author = hideAuthor ? null : ((page as any).author ?? settings?.defaultAuthor ?? null)
  const factChecker = hideAuthor ? null : ((page as any).factChecker ?? null)

  const breadcrumbs = [
    { label: 'Home', href: '/ca/' },
    { label: page.title },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((c, i) => ({
          '@type': 'ListItem', position: i + 1, name: c.label,
          ...(c.href ? { item: `${BASE}${c.href}` } : {}),
        })),
      },
      {
        '@type': 'WebPage',
        '@id': `${CANONICAL}#webpage`,
        url: CANONICAL,
        name: replaceDateVars(page.title),
        inLanguage: 'en-CA',
        publisher: { '@type': 'Organization', name: 'Pokcas', url: BASE },
      },
    ],
  }

  return (
    <>
      <HreflangHead script={hreflangScript} />
      <JsonLd data={jsonLd} />
      <HeroSection
        title={page.title}
        intro={(page as any).intro ?? undefined}
        author={author}
        factChecker={factChecker}
        updatedAt={(page as any).lastUpdated ?? null}
        breadcrumbs={breadcrumbs}
      />
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
    </>
  )
}
