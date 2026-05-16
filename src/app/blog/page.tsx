import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { PostCard } from '@/components/PostCard'
import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getPosts, getCategories } from '@/lib/sanity'
import type { Metadata } from 'next'
import Link from 'next/link'

const BASE = 'https://pokcas.com'

export const metadata: Metadata = {
  title: 'Guides & artikler om betting og bonusser',
  description: 'Læs vores guides om betting bonusser og bookmakers i Danmark.',
  alternates: { canonical: `${BASE}/blog/` },
  openGraph: {
    title: 'Guides & artikler om betting og bonusser',
    description: 'Læs vores guides om betting bonusser og bookmakers i Danmark.',
    url: `${BASE}/blog/`,
    type: 'website',
  },
}

export const revalidate = 3600

interface Props { searchParams: Promise<{ kategori?: string }> }

export default async function BlogPage({ searchParams }: Props) {
  const { kategori } = await searchParams
  const [posts, categories] = await Promise.all([
    getPosts(40, kategori).catch(() => []),
    getCategories().catch(() => []),
  ])

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hjem', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Guides & artikler', item: `${BASE}/blog/` },
    ],
  }

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <Navbar />
      <div style={{ background: 'var(--bg-hero)', borderBottom: '1px solid var(--border)', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <Breadcrumbs crumbs={[{ label: 'Hjem', href: '/' }, { label: 'Guides' }]} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.03em' }}>
            Guides & artikler
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Alt om betting bonusser, bookmakers og odds i Danmark.</p>
          {(categories as any[]).length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
              <Link href="/blog" style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', background: !kategori ? 'var(--green-dark)' : 'var(--bg-raised)', color: !kategori ? '#fff' : 'var(--text-muted)', border: !kategori ? 'none' : '1px solid var(--border)' }}>Alle</Link>
              {(categories as any[]).map((cat: any) => (
                <Link key={cat._id} href={`/blog?kategori=${cat.slug.current}`} style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', background: kategori === cat.slug.current ? 'var(--green-dark)' : 'var(--bg-raised)', color: kategori === cat.slug.current ? '#fff' : 'var(--text-muted)', border: kategori === cat.slug.current ? 'none' : '1px solid var(--border)' }}>
                  {cat.emoji} {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="section">
        {(posts as any[]).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-faint)' }}>
            <p>Ingen artikler endnu.</p>
            <Link href="/studio" style={{ color: '#16a34a', marginTop: '12px', display: 'inline-block', fontSize: '14px' }}>Tilføj indhold i Sanity Studio →</Link>
          </div>
        ) : (
          <div className="blog-grid">
            {(posts as any[]).map((post: any) => <PostCard key={post._id} {...post} />)}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
