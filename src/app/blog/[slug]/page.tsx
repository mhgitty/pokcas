import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { AuthorBar } from '@/components/AuthorBar'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { AuthorMeta } from '@/components/AuthorMeta'
import { AuthorBio } from '@/components/AuthorBio'
import { JsonLd } from '@/components/JsonLd'
import { getPostBySlug, getPosts, getSiteSettings, client } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = await client.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "post" && defined(slug.current) && defined(publishedAt)] { slug }`
  ).catch(() => [])
  return posts.map((p) => ({ slug: p.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug).catch(() => null)
  if (!post) return {}
  const title = replaceDateVars(post.metaTitle || post.title)
  const description = replaceDateVars(post.metaDescription || post.excerpt || '')
  const canonical = `${BASE}/blog/${slug}/`
  // Prefer a dedicated OG image; fall back to the featured image
  const img = post.ogImage?.url ? post.ogImage : post.featuredImage?.url ? post.featuredImage : null
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.lastUpdated || post.publishedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      ...(img ? { images: [{ url: img.url, alt: img.alt || title }] } : {}),
    },
    twitter: {
      title,
      description,
      ...(img ? { images: [img.url] } : {}),
    },
  }
}

/** Extract plain-text FAQ items from Portable Text body */
function extractFaqs(body: any[]): Array<{ question: string; answer: string }> {
  return (body || [])
    .filter((b: any) => b._type === 'faqBlock')
    .flatMap((b: any) => b.items || [])
    .filter((f: any) => f.question && f.answer)
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, latestPosts, settings] = await Promise.all([
    getPostBySlug(slug).catch(() => null),
    getPosts(6),
    getSiteSettings().catch(() => null),
  ])
  if (!post) notFound()
  const author = post.author ?? settings?.defaultAuthor ?? null

  const canonical = `${BASE}/blog/${slug}/`
  const faqs = post.body ? extractFaqs(post.body) : []

  const jsonLdGraph: object[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Hjem', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${BASE}/blog/` },
        { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
      ],
    },
    {
      '@type': 'Article',
      '@id': `${canonical}#article`,
      headline: post.title,
      description: post.excerpt || '',
      url: canonical,
      datePublished: post.publishedAt,
      dateModified: post.lastUpdated || post.publishedAt,
      inLanguage: 'da-DK',
      author: author
        ? {
            '@type': 'Person',
            name: author.name,
            ...(author.linkedin || author.x ? {
              sameAs: [author.linkedin, author.x].filter(Boolean),
            } : {}),
          }
        : { '@type': 'Organization', name: 'Pokcas' },
      publisher: {
        '@type': 'Organization',
        name: 'Pokcas',
        url: BASE,
        logo: { '@type': 'ImageObject', url: `${BASE}/logo.webp` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      ...(post.featuredImage?.url ? { image: post.featuredImage.url } : {}),
    },
  ]

  if (faqs.length > 0) {
    jsonLdGraph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    })
  }

  const jsonLd = { '@context': 'https://schema.org', '@graph': jsonLdGraph }

  return (
    <>
      <JsonLd data={jsonLd} />
      <Navbar />

      {/* Hero header */}
      <div style={{ background: 'var(--bg-hero)', borderBottom: '1px solid var(--border)', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <Breadcrumbs crumbs={[
            { label: 'Hjem', href: '/' },
            { label: 'Guides', href: '/blog' },
            { label: post.title },
          ]} />
          {post.category && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: '12px', fontWeight: 500, padding: '3px 12px', borderRadius: '20px', marginBottom: '16px' }}>
              {post.category.emoji} {post.category.name}
            </div>
          )}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: author ? '20px' : '16px', maxWidth: '720px' }}>
            {replaceDateVars(post.title)}
          </h1>
          <AuthorBar author={author} updatedAt={post.lastUpdated || post.publishedAt} />
          {post.excerpt && <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '640px' }}>{replaceDateVars(post.excerpt)}</p>}
        </div>
      </div>

      {/* Article body + sticky TOC sidebar */}
      <div className="article-layout">
        {/* Main content */}
        <article className="article-content">
          {post.body && <MobileToc body={post.body} />}
          {post.body && <PortableTextRenderer value={post.body} posts={latestPosts} />}
          {author && <AuthorBio author={author} />}
        </article>

        {/* Sticky TOC sidebar */}
        {post.body && (
          <aside className="toc-sidebar">
            <TableOfContents body={post.body} />
          </aside>
        )}
      </div>

      <Footer />
    </>
  )
}
