import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getBonusser } from '@/lib/sanity'
import Link from 'next/link'
import type { Metadata } from 'next'

const BASE = 'https://pokcas.com'

export const metadata: Metadata = {
  title: `Best Casino Bonuses ${new Date().getFullYear()}`,
  description: 'Overview of the best casino bonuses. Find welcome bonuses, free spins and exclusive offers.',
  alternates: { canonical: `${BASE}/kampagner/` },
}

export const revalidate = 3600

export default async function BonusserPage() {
  const bonusser = await getBonusser(40).catch(() => [])

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Bonuses', item: `${BASE}/kampagner/` },
    ],
  }

  return (
    <>
      <JsonLd data={breadcrumb} />
      <Navbar />

      <div style={{ background: 'var(--bg-hero)', borderBottom: '1px solid var(--border)', padding: '40px 15px 32px' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
          <Breadcrumbs crumbs={[{ label: 'Home', href: '/' }, { label: 'Bonuses' }]} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.03em' }}>
            Casino Bonuses
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Overview of the best current bonuses from top online casinos.</p>
        </div>
      </div>

      <div className="section">
        {(bonusser as any[]).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-faint)' }}>
            <p>No bonuses yet — add them in Sanity Studio.</p>
          </div>
        ) : (
          <div className="blog-grid">
            {(bonusser as any[]).map((bonus: any) => (
              <Link key={bonus._id} href={`/kampagner/${bonus.slug.current}`} style={{ textDecoration: 'none' }}>
                <article style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', height: '100%' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px', lineHeight: 1.35 }}>
                    🎁 {bonus.title}
                  </h3>
                  {bonus.intro && (
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65 }}>{bonus.intro}</p>
                  )}
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}
