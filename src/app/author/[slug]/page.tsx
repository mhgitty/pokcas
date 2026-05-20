import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import { Icon } from '@/components/Icon'
import { getAuthorBySlug, getPostsByAuthor, getAuthorPaths, getSiteSettings } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const revalidate = 3600
const BASE = 'https://pokcas.com'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const paths = await getAuthorPaths()
  return paths.map((a) => ({ slug: a.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthorBySlug(slug).catch(() => null)
  if (!author) return {}
  const title = `${author.name} — ${author.role || 'Author'} at Pokcas`
  const description = author.bio || `Articles and reviews by ${author.name}.`
  return {
    title,
    description,
    alternates: { canonical: `${BASE}/author/${slug}/` },
    openGraph: { title, description, url: `${BASE}/author/${slug}/` },
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params
  const [author, settings] = await Promise.all([
    getAuthorBySlug(slug).catch(() => null),
    getSiteSettings().catch(() => null),
  ])
  if (!author) notFound()

  const posts = await getPostsByAuthor(author._id).catch(() => [])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        name: author.name,
        url: `${BASE}/author/${slug}/`,
        jobTitle: author.role,
        description: author.bio,
        ...(author.imageUrl ? { image: author.imageUrl } : {}),
        ...(author.linkedin ? { sameAs: [author.linkedin] } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: author.name, item: `${BASE}/author/${slug}/` },
        ],
      },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <Navbar />

      {/* Hero */}
      <div style={{
        background: 'var(--bg-footer)',
        padding: '56px 24px',
      }}>
        <div style={{ maxWidth: '1220px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '32px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Authors: {author.name}</span>
          </div>

          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }} className="author-hero-inner">
            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              {author.imageUrl ? (
                <div style={{ width: '140px', height: '140px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--green)', flexShrink: 0 }}>
                  <Image src={author.imageUrl} alt={author.name} width={140} height={140}
                    style={{ objectFit: 'cover', width: '140px', height: '140px', display: 'block' }} />
                </div>
              ) : (
                <div style={{
                  width: '140px', height: '140px', borderRadius: '50%',
                  background: 'rgba(34,197,94,0.15)',
                  border: '3px solid var(--green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '52px', fontWeight: 800, color: 'var(--green)',
                  fontFamily: 'var(--font-display)', flexShrink: 0,
                }}>
                  {author.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(24px, 4vw, 38px)',
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  textTransform: 'uppercase',
                }}>
                  {author.name}
                </h1>
                {author.linkedin && (
                  <a href={author.linkedin} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
                    <Icon name="linkedin" size={16} />
                  </a>
                )}
                {author.x && (
                  <a href={author.x} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
                    <Icon name="twitter" size={16} />
                  </a>
                )}
              </div>

              {author.role && (
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--green)', marginBottom: '14px' }}>
                  {author.role}
                </div>
              )}

              {author.bio && (
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, margin: 0, maxWidth: '640px' }}>
                  {author.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts grid */}
      <div className="section">
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(20px, 2.5vw, 26px)',
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
          marginBottom: '24px',
        }}>
          Latest articles from this author
        </h2>

        {posts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>No articles yet.</p>
        ) : (
          <div className="blog-grid">
            {posts.map((post: any) => (
              <Link key={post._id} href={`/${post.slug.current}/`} style={{ textDecoration: 'none' }}>
                <article style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 0.15s',
                }}>
                  {/* Featured image */}
                  {post.featuredImage?.url ? (
                    <div style={{ aspectRatio: '16/9', overflow: 'hidden', position: 'relative' }}>
                      <Image src={post.featuredImage.url} alt={post.featuredImage.alt || post.title}
                        fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 360px" />
                    </div>
                  ) : (
                    <div style={{ aspectRatio: '16/9', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="document-text" size={32} color="var(--text-faint)" />
                    </div>
                  )}

                  <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {post.category && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {post.category.emoji} {post.category.name}
                      </span>
                    )}
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.4, margin: 0 }}>
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.excerpt}
                      </p>
                    )}
                    <div style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '12px', color: 'var(--text-faint)', display: 'flex', gap: '12px' }}>
                      {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                      {post.readingTime && <span>{post.readingTime} min read</span>}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .author-hero-inner { flex-direction: column; align-items: flex-start !important; }
        }
      `}</style>
    </>
  )
}
