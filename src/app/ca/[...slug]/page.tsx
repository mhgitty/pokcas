import { HeroSection } from '@/components/HeroSection'
import { AuthorBio } from '@/components/AuthorBio'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { getPageByPathCa, getSiteSettings, client } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'

interface Props { params: Promise<{ slug: string[] }> }

export async function generateStaticParams() {
  const pages = await client.fetch<Array<{
    slug: { current: string }
    a1?: string; a2?: string; a3?: string; a4?: string
  }>>(
    `*[_type == "page" && market == "ca" && defined(slug.current)] {
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
  const page = await getPageByPathCa(slug).catch(() => null)
  if (!page) return {}
  const title = replaceDateVars(page.metaTitle || page.title)
  const description = replaceDateVars(page.metaDescription || page.intro || '')
  const canonical = `${BASE}/ca/${slug.join('/')}/`
  return { title, description, alternates: { canonical } }
}

export default async function CaSlugPage({ params }: Props) {
  const { slug } = await params
  const [page, settings] = await Promise.all([
    getPageByPathCa(slug).catch(() => null),
    getSiteSettings().catch(() => null),
  ])
  if (!page) notFound()

  const canonical = `${BASE}/ca/${slug.join('/')}/`
  const hideAuthor = (page as any).hideAuthor ?? false
  const author = hideAuthor ? null : ((page as any).author ?? settings?.defaultAuthor ?? null)
  const factChecker = hideAuthor ? null : ((page as any).factChecker ?? null)

  const p = page as any
  const ancestorTitles = [p.a4Title, p.a3Title, p.a2Title, p.a1Title].filter(Boolean) as string[]
  const breadcrumbs: { label: string; href?: string }[] = [
    { label: 'Home', href: '/' },
    { label: 'Canada', href: '/ca/' },
    ...ancestorTitles.map((title, idx) => ({
      label: title,
      href: `/ca/${slug.slice(0, idx + 1).join('/')}/`,
    })),
    { label: page.title },
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
        inLanguage: 'en-CA',
        publisher: { '@type': 'Organization', name: 'Pokcas', url: BASE },
      },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <HeroSection
        title={page.title}
        intro={page.intro ?? undefined}
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
