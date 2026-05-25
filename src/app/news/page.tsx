import Link from 'next/link'
import { getPosts, getCategories } from '@/lib/sanity'
import { PostCard } from '@/components/PostCard'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'News & Guides — Pokcas',
  description: 'Browse all casino guides, bonus tips and news from the Pokcas team.',
  alternates: { canonical: 'https://pokcas.com/news/' },
}

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function NewsPage({ searchParams }: Props) {
  const { category } = await searchParams

  const [posts, categories] = await Promise.all([
    getPosts(200, category || undefined),
    getCategories(),
  ])

  return (
    <>
      {/* Hero */}
      <div style={{ background: 'var(--bg-hero)', padding: '48px 0 40px' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '0 15px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '34px',
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.04em',
            marginBottom: '10px',
          }}>
            News &amp; Guides
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', maxWidth: '560px', lineHeight: 1.65 }}>
            Casino reviews, bonus breakdowns and strategy guides from the Pokcas team.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '32px 15px 64px' }}>
        {/* Category filter */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
            <Link
              href="/news/"
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
                background: !category ? 'var(--green)' : 'var(--bg-card)',
                color: !category ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${!category ? 'var(--green)' : 'var(--border)'}`,
              }}
            >
              All
            </Link>
            {categories.map((cat: any) => (
              <Link
                key={cat._id}
                href={`/news/?category=${cat.slug.current}`}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  background: category === cat.slug.current ? 'var(--green)' : 'var(--bg-card)',
                  color: category === cat.slug.current ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${category === cat.slug.current ? 'var(--green)' : 'var(--border)'}`,
                }}
              >
                {cat.emoji && `${cat.emoji} `}{cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Post count */}
        <p style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '20px' }}>
          {posts.length} {posts.length === 1 ? 'article' : 'articles'}
        </p>

        {/* Grid */}
        {posts.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}
            className="news-grid"
          >
            {posts.map((post: any) => (
              <PostCard key={post._id} {...post} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            No articles found.
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .news-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .news-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  )
}
