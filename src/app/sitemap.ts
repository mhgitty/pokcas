import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'

export const revalidate = 86400

const BASE = 'https://pokcas.com'

function marketPrefix(market?: string) {
  if (market === 'ca') return '/ca'
  if (market === 'au') return '/au'
  return ''
}

// Only include lastModified when we have a real timestamp — never fake it with new Date()
function lastMod(date?: string): { lastModified: Date } | Record<string, never> {
  return date ? { lastModified: new Date(date) } : {}
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, pages, bookmakers, bonusser, paymentMethods, software, casinoGuides] = await Promise.all([

    client.fetch<Array<{ slug: { current: string }; publishedAt?: string; lastUpdated?: string }>>(
      `*[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) { slug, publishedAt, lastUpdated }`
    ).catch(() => []),

    client.fetch<Array<{ slug: { current: string }; a1?: string; a2?: string; a3?: string; a4?: string; market?: string; _updatedAt?: string }>>(
      `*[_type == "page" && defined(slug.current)] {
        slug,
        "a1": parent->slug.current,
        "a2": parent->parent->slug.current,
        "a3": parent->parent->parent->slug.current,
        "a4": parent->parent->parent->parent->slug.current,
        market, _updatedAt
      }`
    ).catch(() => []),

    client.fetch<Array<{ slug: { current: string }; market?: string; _updatedAt?: string }>>(
      `*[_type == "bookmaker" && defined(slug.current)] { slug, market, _updatedAt }`
    ).catch(() => []),

    client.fetch<Array<{ slug: { current: string }; market?: string; _updatedAt?: string }>>(
      `*[_type == "bonus" && active == true && defined(slug.current) && market in ["ca", "au"]] { slug, market, _updatedAt }`
    ).catch(() => []),

    client.fetch<Array<{ slug: { current: string }; market?: string; _updatedAt?: string }>>(
      `*[_type == "paymentMethod" && defined(slug.current)] { slug, market, _updatedAt }`
    ).catch(() => []),

    client.fetch<Array<{ slug: { current: string }; market?: string; _updatedAt?: string }>>(
      `*[_type == "software" && defined(slug.current)] { slug, market, _updatedAt }`
    ).catch(() => []),

    client.fetch<Array<{ slug: { current: string }; market?: string; _updatedAt?: string }>>(
      `*[_type == "casinoGuide" && defined(slug.current)] { slug, market, _updatedAt }`
    ).catch(() => []),
  ])

  // ── Bookmaker review URLs by market ──────────────────────────────────────────
  const bookmakerEntries: MetadataRoute.Sitemap = bookmakers.map((b) => {
    const mp = marketPrefix(b.market)
    const url = mp
      ? `${BASE}${mp}/online-casino/review/${b.slug.current}/`
      : `${BASE}/review/${b.slug.current}/`
    return { url, ...lastMod(b._updatedAt) }
  })

  // ── Page URLs by market ───────────────────────────────────────────────────────
  const pageEntries: MetadataRoute.Sitemap = pages.map((p) => {
    const mp = marketPrefix(p.market)
    const parts = [p.a4, p.a3, p.a2, p.a1, p.slug.current].filter(Boolean)
    return { url: `${BASE}${mp}/${parts.join('/')}/`, ...lastMod(p._updatedAt) }
  })

  // ── Payment method URLs by market ─────────────────────────────────────────────
  const paymentEntries: MetadataRoute.Sitemap = paymentMethods.map((m) => {
    const mp = marketPrefix(m.market)
    return { url: `${BASE}${mp}/online-casino/payment/${m.slug.current}/`, ...lastMod(m._updatedAt) }
  })

  // ── Software URLs by market ───────────────────────────────────────────────────
  const softwareEntries: MetadataRoute.Sitemap = software.map((s) => {
    const mp = marketPrefix(s.market)
    return { url: `${BASE}${mp}/online-casino/software/${s.slug.current}/`, ...lastMod(s._updatedAt) }
  })

  const guideEntries: MetadataRoute.Sitemap = casinoGuides.map((g) => {
    const mp = marketPrefix(g.market)
    return { url: `${BASE}${mp}/casino-guides/${g.slug.current}/`, ...lastMod(g._updatedAt) }
  })

  return [
    // ── Root index pages (no fake lastmod) ──
    { url: `${BASE}/` },
    { url: `${BASE}/review/` },
    { url: `${BASE}/online-casino/payment/` },
    { url: `${BASE}/online-casino/software/` },
    { url: `${BASE}/casino-guides/` },

    // ── Canada index pages ──
    { url: `${BASE}/ca/` },
    { url: `${BASE}/ca/online-casino/review/` },
    { url: `${BASE}/ca/online-casino/bonus/` },
    { url: `${BASE}/ca/online-casino/payment/` },
    { url: `${BASE}/ca/online-casino/software/` },
    { url: `${BASE}/ca/casino-guides/` },

    // ── Australia index pages ──
    { url: `${BASE}/au/` },
    { url: `${BASE}/au/online-casino/review/` },
    { url: `${BASE}/au/online-casino/bonus/` },
    { url: `${BASE}/au/online-casino/payment/` },
    { url: `${BASE}/au/online-casino/software/` },
    { url: `${BASE}/au/casino-guides/` },

    // ── Dynamic content (real lastmod from Sanity _updatedAt) ──
    ...bookmakerEntries,
    ...bonusser.map((b) => ({
      url: `${BASE}${marketPrefix(b.market)}/online-casino/bonus/${b.slug.current}/`,
      ...lastMod(b._updatedAt),
    })),
    ...paymentEntries,
    ...softwareEntries,
    ...guideEntries,
    ...posts.map((p) => ({
      url: `${BASE}/${p.slug.current}/`,
      ...lastMod(p.lastUpdated ?? p.publishedAt),
    })),
    ...pageEntries,
  ]
}
