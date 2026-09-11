import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'

export const revalidate = 86400

const BASE = 'https://pokcas.com'

function marketPrefix(market?: string) {
  if (market === 'ca') return '/ca'
  if (market === 'au') return '/au'
  return ''
}

// Only include lastModified when we have a real timestamp — never fake it.
function lastMod(date?: string): { lastModified: Date } | Record<string, never> {
  return date ? { lastModified: new Date(date) } : {}
}

type SlugRow = { slug: { current: string }; market?: string; _updatedAt?: string }
type PageRow = SlugRow & { a1?: string; a2?: string; a3?: string; a4?: string }
type PostRow = { slug: { current: string }; publishedAt?: string; lastUpdated?: string }

// A single combined sitemap covering all markets (global, ca, au). Each dynamic
// entry is prefixed by its own document's market, so /ca/ and /au/ URLs are
// included alongside global ones.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, bookmakers, paymentMethods, software, casinoGuides, bonusser, posts] = await Promise.all([
    client.fetch<PageRow[]>(
      `*[_type == "page" && defined(slug.current)] {
        slug, market, _updatedAt,
        "a1": parent->slug.current,
        "a2": parent->parent->slug.current,
        "a3": parent->parent->parent->slug.current,
        "a4": parent->parent->parent->parent->slug.current
      }`
    ).catch(() => []),
    client.fetch<SlugRow[]>(`*[_type == "bookmaker" && defined(slug.current)] { slug, market, _updatedAt }`).catch(() => []),
    client.fetch<SlugRow[]>(`*[_type == "paymentMethod" && defined(slug.current)] { slug, market, _updatedAt }`).catch(() => []),
    client.fetch<SlugRow[]>(`*[_type == "software" && defined(slug.current)] { slug, market, _updatedAt }`).catch(() => []),
    client.fetch<SlugRow[]>(`*[_type == "casinoGuide" && defined(slug.current)] { slug, market, _updatedAt }`).catch(() => []),
    client.fetch<SlugRow[]>(`*[_type == "bonus" && active == true && defined(slug.current) && market in ["ca","au"]] { slug, market, _updatedAt }`).catch(() => []),
    client.fetch<PostRow[]>(`*[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) { slug, publishedAt, lastUpdated }`).catch(() => []),
  ])

  const reviewUrl = (mp: string, slug: string) =>
    mp ? `${BASE}${mp}/online-casino/review/${slug}/` : `${BASE}/review/${slug}/`

  return [
    // ── Global index pages ──
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

    // ── Dynamic content (real lastmod from Sanity), prefixed by each doc's market ──
    ...pages.map((p) => ({
      url: `${BASE}${marketPrefix(p.market)}/${[p.a4, p.a3, p.a2, p.a1, p.slug.current].filter(Boolean).join('/')}/`,
      ...lastMod(p._updatedAt),
    })),
    ...bookmakers.map((b) => ({ url: reviewUrl(marketPrefix(b.market), b.slug.current), ...lastMod(b._updatedAt) })),
    ...paymentMethods.map((m) => ({ url: `${BASE}${marketPrefix(m.market)}/online-casino/payment/${m.slug.current}/`, ...lastMod(m._updatedAt) })),
    ...software.map((s) => ({ url: `${BASE}${marketPrefix(s.market)}/online-casino/software/${s.slug.current}/`, ...lastMod(s._updatedAt) })),
    ...casinoGuides.map((g) => ({ url: `${BASE}${marketPrefix(g.market)}/casino-guides/${g.slug.current}/`, ...lastMod(g._updatedAt) })),
    ...bonusser.map((b) => ({ url: `${BASE}${marketPrefix(b.market)}/online-casino/bonus/${b.slug.current}/`, ...lastMod(b._updatedAt) })),
    ...posts.map((p) => ({ url: `${BASE}/${p.slug.current}/`, ...lastMod(p.lastUpdated ?? p.publishedAt) })),
  ]
}
