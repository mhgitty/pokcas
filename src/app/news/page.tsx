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

// How many posts to show per category on the index
const PREVIEW_COUNT = 4

export default async function NewsPage() {
  const [allPosts, categories] = await Promise.all([
    getPosts(500),
    getCategories(),
  ])

  // Group posts by category
  const grouped = categories.map((cat: any) => ({
    cat,
    posts: allPosts.filter(
      (p: any) => p.category?.slug?.current === cat.slug.current
    ),
  })).filter(({ posts }: any) => posts.length > 0)

  // Posts without a category
  const uncategorised = allPosts.filter((p: any) => !p.category)

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

      <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '40px 15px 64px' }}>

        {grouped.map(({ cat, posts }: any) => {
          const preview = posts.slice(0, PREVIEW_COUNT)
          return (
            <section key={cat._id} style={{ marginBottom: '48px' }}>
              {/* Section header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  letterSpacing: '-0.03em',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  {cat.emoji && <span>{cat.emoji}</span>}
                  {cat.name}
                </h2>
                {posts.length > PREVIEW_COUNT && (
                  <Link href={`/news/${cat.slug.current}/`} style={{
                    fontSize: '13px',
                    color: 'var(--green)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}>
                    See All →
                  </Link>
                )}
              </div>

              {/* Post grid */}
              <div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}
                className="news-grid-4"
              >
                {preview.map((post: any) => (
                  <PostCard key={post._id} {...post} />
                ))}
              </div>
            </section>
          )
        })}

        {/* Uncategorised fallback */}
        {uncategorised.length > 0 && (
          <section style={{ marginBottom: '48px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700,
                color: 'var(--text)', letterSpacing: '-0.03em', margin: 0,
              }}>
                More Articles
              </h2>
            </div>
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}
              className="news-grid-4"
            >
              {uncategorised.slice(0, PREVIEW_COUNT).map((post: any) => (
                <PostCard key={post._id} {...post} />
              ))}
            </div>
          </section>
        )}

      </div>

      <style>{`
        @media (max-width: 768px) {
          .news-grid-4 { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .news-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  )
}
