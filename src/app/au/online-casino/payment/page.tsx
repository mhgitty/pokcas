import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { getPaymentMethodsAu } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'
const CANONICAL = `${BASE}/au/online-casino/payment/`

export const metadata: Metadata = {
  title: `Online Casino Payment Methods Australia ${new Date().getFullYear()} — Compare Deposits & Withdrawals`,
  description: 'Compare all online casino payment methods available to Australian players — fees, withdrawal times, and bonus eligibility.',
  alternates: { canonical: CANONICAL },
}

function StatRow({ icon, label, value }: { icon: string; label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
      <span style={{ fontSize: '16px', flexShrink: 0, lineHeight: 1.4 }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '11px', color: 'var(--text-faint)', lineHeight: 1.2 }}>{label}</div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{value}</div>
      </div>
    </div>
  )
}

export default async function AuPaymentMethodsPage() {
  const methods = await getPaymentMethodsAu().catch(() => [])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',            item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Australia',       item: `${BASE}/au/` },
      { '@type': 'ListItem', position: 3, name: 'Payment Methods', item: CANONICAL },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <div style={{ background: 'var(--bg-hero)', borderBottom: '1px solid var(--border)', padding: '40px 15px 32px' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
          <Breadcrumbs crumbs={[
            { label: 'Home',            href: '/' },
            { label: 'Australia',       href: '/au/' },
            { label: 'Payment Methods' },
          ]} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.03em' }}>
            Casino Payment Methods in Australia
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '600px', margin: 0, lineHeight: 1.6 }}>
            Compare all payment methods available at Australian online casinos — fees, withdrawal times, and bonus eligibility at a glance.
          </p>
        </div>
      </div>

      {/* Payment methods grid */}
      <div className="section">
        {(methods as any[]).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-faint)' }}>
            <p>No payment methods yet — add them in Sanity Studio under 🇦🇺 Australia.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px',
          }}>
            {(methods as any[]).map((method: any) => (
              <div key={method._id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Logo area */}
                <div style={{
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '28px 24px',
                  minHeight: '120px',
                  borderBottom: '1px solid var(--border)',
                }}>
                  {method.logo?.url ? (
                    <Image
                      src={method.logo.url}
                      alt={method.logo.alt || method.name}
                      width={140}
                      height={70}
                      style={{ objectFit: 'contain', maxHeight: '70px', width: 'auto' }}
                    />
                  ) : (
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#333', textAlign: 'center' }}>
                      {method.name}
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px', lineHeight: 1.3 }}>
                    {method.name}
                  </div>

                  <div style={{ flex: 1, marginBottom: '14px' }}>
                    <StatRow icon="💳" label="Transaction Fees"   value={method.transactionFees} />
                    <StatRow icon="⏱️" label="Withdrawal Time"    value={method.withdrawalTime} />
                    <StatRow icon="🎁" label="Eligible for Bonus" value={method.eligibleForBonuses} />
                  </div>

                  <Link
                    href={`/au/online-casino/payment/${method.slug.current}/`}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '10px 16px',
                      border: '2px solid var(--green)',
                      borderRadius: '8px',
                      color: 'var(--green)',
                      fontSize: '13px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      letterSpacing: '0.04em',
                    }}
                  >
                    READ REVIEW
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
