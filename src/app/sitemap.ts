import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'

export const revalidate = 86400

const BASE = 'https://pokcas.com'

function marketPrefix(market?: string) {
  if (market === 'ca') return '/ca'
  if (market === 'au') return '/au'
  return ''
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, pages, bookmakers, bonusser, paymentMethods, software] = await Promise.all([

    client.fetch<Array<{ slug: { current: string }; publishedAt?: string; lastUpdated?: string }>>(
      `*[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) { slug, publishedAt, lastUpdated }`
    ).catch(() => []),

    client.fetch<Array<{ slug: { current: string }; parentSlug?: string; market?: string; _updatedAt?: string }>>(
      `*[_type == "page" && defined(slug.current)] { slug, "parentSlug": parent->slug.current, market, _updatedAt }`
    ).catch(() => []),

    client.fetch<Array<{ slug: { current: string }; market?: string; _updatedAt?: string }>>(
      `*[_type == "bookmaker" && defined(slug.current)] { slug, market, _updatedAt }`
    ).catch(() => []),

    client.fetch<Array<{ slug: { current: string }; _updatedAt?: string }>>(
      `*[_type == "bonus" && active == true && defined(slug.current) && (market == "global" || !defined(market))] { slug, _updatedAt }`
    ).catch(() => []),

    client.fetch<Array<{ slug: { current: string }; market?: string; _updatedAt?: string }>>(
      `*[_type == "paymentMethod" && defined(slug.current)] { slug, market, _updatedAt }`
    ).catch(() => []),

    client.fetch<Array<{ slug: { current: string }; market?: string; _updatedAt?: string }>>(
      `*[_type == "software" && defined(slug.current)] { slug, market, _updatedAt }`
    ).catch(() => []),
  ])

  // ── Bookmaker review URLs by market ──────────────────────────────────────────
  const bookmakerEntries = bookmakers.map((b) => {
    const mp = marketPrefix(b.market)
    const url = mp
      ? `${BASE}${mp}/online-casino/review/${b.slug.current}/`
      : `${BASE}/review/${b.slug.current}/`
    return {
      url,
      lastModified: b._updatedAt ? new Date(b._updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }
  })

  // ── Page URLs by market ───────────────────────────────────────────────────────
  const pageEntries = pages.map((p) => {
    const mp = marketPrefix(p.market)
    const slug = p.parentSlug
      ? `${p.parentSlug}/${p.slug.current}`
      : p.slug.current
    return {
      url: `${BASE}${mp}/${slug}/`,
      lastModified: p._updatedAt ? new Date(p._updatedAt) : undefined,
      changeFrequency: 'monthly' as const,
      priority: p.parentSlug ? 0.4 : 0.5,
    }
  })

  // ── Payment method URLs by market ─────────────────────────────────────────────
  const paymentEntries = paymentMethods.map((m) => {
    const mp = marketPrefix(m.market)
    return {
      url: `${BASE}${mp}/online-casino/payment/${m.slug.current}/`,
      lastModified: m._updatedAt ? new Date(m._updatedAt) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }
  })

  // ── Software URLs by market ───────────────────────────────────────────────────
  const softwareEntries = software.map((s) => {
    const mp = marketPrefix(s.market)
    return {
      url: `${BASE}${mp}/online-casino/software/${s.slug.current}/`,
      lastModified: s._updatedAt ? new Date(s._updatedAt) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }
  })

  return [
    // ── Root ──
    { url: `${BASE}/`,                         lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/review/`,                  changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/casino-bonus/`,            changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/online-casino/payment/`,   changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/online-casino/software/`,  changeFrequency: 'weekly',  priority: 0.8 },

    // ── Canada ──
    { url: `${BASE}/ca/`,                                lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/ca/online-casino/review/`,           changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/ca/online-casino/payment/`,          changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/ca/online-casino/software/`,         changeFrequency: 'weekly',  priority: 0.8 },

    // ── Australia ──
    { url: `${BASE}/au/`,                                lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/au/online-casino/review/`,           changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/au/online-casino/payment/`,          changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/au/online-casino/software/`,         changeFrequency: 'weekly',  priority: 0.8 },

    // ── Dynamic content ──
    ...bookmakerEntries,
    ...bonusser.map((b) => ({
      url: `${BASE}/casino-bonus/${b.slug.current}/`,
      lastModified: b._updatedAt ? new Date(b._updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...paymentEntries,
    ...softwareEntries,
    ...posts.map((p) => ({
      url: `${BASE}/${p.slug.current}/`,
      lastModified: p.lastUpdated ? new Date(p.lastUpdated) : p.publishedAt ? new Date(p.publishedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...pageEntries,
  ]
}
