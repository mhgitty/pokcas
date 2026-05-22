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
  const pages = await client.fetch<Array<{ slug: { current: string }; parent?: { slug: { current: string } } }>>(
    `*[_type == "page" && market == "ca" && defined(slug.current)] {
      slug,
      "parent": parent->{ slug }
    }`
  ).catch(() => [])

  return pages.map((p) =>
    p.parent?.slug?.current
      ? { slug: [p.parent.slug.current, p.slug.current] }
      : { slug: [p.slug.current] }
  )
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
  const author = (page as any).author ?? settings?.defaultAuthor ?? null
  const factChecker = (page as any).factChecker ?? null

  const breadcrumbs: { label: string; href?: string }[] = [
    { label: 'Home', href: '/' },
    { label: 'Canada', href: '/ca/' },
  ]
  if ((page as any).parentTitle && (page as any).parentSlug) {
    breadcrumbs.push({ label: (page as any).parentTitle, href: `/ca/${(page as any).parentSlug}/` })
  }
  breadcrumbs.push({ label: page.title })

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
        narrow
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
