import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getBonusesAu } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'
const CANONICAL = `${BASE}/au/online-casino/bonus/`

export const metadata: Metadata = {
  title: `Best Casino Bonuses Australia ${new Date().getFullYear()}`,
  description: 'Find the best casino bonuses for Australian players. Welcome bonuses, free spins and exclusive offers.',
  alternates: { canonical: CANONICAL },
}

export default async function CaBonusesPage() {
  const bonuses = await getBonusesAu(40).catch(() => [])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Australia', item: `${BASE}/au/` },
      { '@type': 'ListItem', position: 3, name: 'Casino Bonuses', item: CANONICAL },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />

      <div style={{ background: 'var(--bg-hero)', borderBottom: '1px solid var(--border)', padding: '40px 15px 32px' }}>
        <div style={{ maxWidth: '1220px', margin: '0 auto' }}>
          <Breadcrumbs crumbs={[{ label: 'Home', href: '/' }, { label: 'Australia', href: '/au/' }, { label: 'Casino Bonuses' }]} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.03em' }}>
            Best Casino Bonuses in Australia
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>The best current bonuses from top online casinos available to Australian players.</p>
        </div>
      </div>

      <div className="section">
        {(bonuses as any[]).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-faint)' }}>
            <p>No bonuses yet — add them in Sanity Studio under 🇨🇦 Australia.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(bonuses as any[]).map((bonus: any) => (
              <div key={bonus._id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr auto',
                  gap: '16px',
                  padding: '20px 24px',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {bonus.casinoLogo?.url ? (
                      <div style={{ background: '#fff', borderRadius: '8px', padding: '6px 10px', border: '1px solid var(--border-faint)' }}>
                        <Image src={bonus.casinoLogo.url} alt={bonus.casinoLogo.alt || bonus.casinoNavn || ''} width={80} height={40}
                          style={{ objectFit: 'contain', maxHeight: '40px', width: 'auto', display: 'block' }} />
                      </div>
                    ) : (
                      <div style={{ width: '80px', height: '40px', background: 'var(--bg-raised)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--text-faint)' }}>
                        {bonus.casinoNavn || bonus.bookmaker?.name || ''}
                      </div>
                    )}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                      {bonus.oddsBonusTitel || bonus.title}
                    </div>
                    {bonus.casinoNavn && (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{bonus.casinoNavn}</div>
                    )}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {bonus.minimumIndbetaling != null && (
                        <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                          Min. deposit: <strong style={{ color: 'var(--text)' }}>AUD {bonus.minimumIndbetaling}</strong>
                        </div>
                      )}
                      {bonus.gennemspilskrav && (
                        <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                          Wager: <strong style={{ color: 'var(--text)' }}>{bonus.gennemspilskrav}</strong>
                        </div>
                      )}
                    </div>
                    {bonus.terms && (
                      <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '6px', lineHeight: 1.4 }}>{bonus.terms}</div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                    {bonus.offerUrl && (
                      <a href={bonus.offerUrl} target="_blank" rel="noopener noreferrer sponsored"
                        style={{ display: 'inline-block', background: 'var(--green)', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        Get bonus →
                      </a>
                    )}
                    <Link href={`/au/online-casino/bonus/${bonus.slug.current}`}
                      style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      Read more
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </>
  )
}
