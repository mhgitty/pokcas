import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'

export const revalidate = 86400

const BASE = 'https://pokcas.com'

type Market = 'global' | 'ca' | 'au'

// One child sitemap per market. Next serves an index at /sitemap.xml that links
// to /sitemap/global.xml, /sitemap/ca.xml and /sitemap/au.xml — so each market's
// indexing can be tracked separately in Search Console.
export async function generateSitemaps() {
  return [{ id: 'global' }, { id: 'ca' }, { id: 'au' }]
}

function marketPrefix(market: Market) {
  return market === 'ca' ? '/ca' : market === 'au' ? '/au' : ''
}

function marketCondition(market: Market) {
  return market === 'global' ? '(market == "global" || !defined(market))' : `market == "${market}"`
}

// Only include lastModified when we have a real timestamp — never fake it with new Date()
function lastMod(date?: string): { lastModified: Date } | Record<string, never> {
  return date ? { lastModified: new Date(date) } : {}
}

type SlugRow = { slug: { current: string }; _updatedAt?: string }
type PageRow = SlugRow & { a1?: string; a2?: string; a3?: string; a4?: string }
type PostRow = { slug: { current: string }; publishedAt?: string; lastUpdated?: string }

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  const market: Market = id === 'ca' || id === 'au' ? id : 'global'
  const prefix = marketPrefix(market)
  const cond = marketCondition(market)

  const [pages, bookmakers, paymentMethods, software, casinoGuides, bonusser, posts] = await Promise.all([
    client.fetch<PageRow[]>(
      `*[_type == "page" && defined(slug.current) && ${cond}] {
        slug,
        "a1": parent->slug.current,
        "a2": parent->parent->slug.current,
        "a3": parent->parent->parent->slug.current,
        "a4": parent->parent->parent->parent->slug.current,
        _updatedAt
      }`
    ).catch(() => []),

    client.fetch<SlugRow[]>(
      `*[_type == "bookmaker" && defined(slug.current) && ${cond}] { slug, _updatedAt }`
    ).catch(() => []),

    client.fetch<SlugRow[]>(
      `*[_type == "paymentMethod" && defined(slug.current) && ${cond}] { slug, _updatedAt }`
    ).catch(() => []),

    client.fetch<SlugRow[]>(
      `*[_type == "software" && defined(slug.current) && ${cond}] { slug, _updatedAt }`
    ).catch(() => []),

    client.fetch<SlugRow[]>(
      `*[_type == "casinoGuide" && defined(slug.current) && ${cond}] { slug, _updatedAt }`
    ).catch(() => []),

    // Bonuses only exist under the market sections (ca/au), not global.
    market === 'global'
      ? Promise.resolve([] as SlugRow[])
      : client.fetch<SlugRow[]>(
          `*[_type == "bonus" && active == true && defined(slug.current) && market == "${market}"] { slug, _updatedAt }`
        ).catch(() => []),

    // Blog posts are global.
    market === 'global'
      ? client.fetch<PostRow[]>(
          `*[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) { slug, publishedAt, lastUpdated }`
        ).catch(() => [])
      : Promise.resolve([] as PostRow[]),
  ])

  const indexPages: MetadataRoute.Sitemap =
    market === 'global'
      ? [
          { url: `${BASE}/` },
          { url: `${BASE}/review/` },
          { url: `${BASE}/online-casino/payment/` },
          { url: `${BASE}/online-casino/software/` },
          { url: `${BASE}/casino-guides/` },
        ]
      : [
          { url: `${BASE}${prefix}/` },
          { url: `${BASE}${prefix}/online-casino/review/` },
          { url: `${BASE}${prefix}/online-casino/bonus/` },
          { url: `${BASE}${prefix}/online-casino/payment/` },
          { url: `${BASE}${prefix}/online-casino/software/` },
          { url: `${BASE}${prefix}/casino-guides/` },
        ]

  const reviewUrl = (slug: string) =>
    market === 'global' ? `${BASE}/review/${slug}/` : `${BASE}${prefix}/online-casino/review/${slug}/`

  return [
    ...indexPages,
    ...pages.map((p) => ({
      url: `${BASE}${prefix}/${[p.a4, p.a3, p.a2, p.a1, p.slug.current].filter(Boolean).join('/')}/`,
      ...lastMod(p._updatedAt),
    })),
    ...bookmakers.map((b) => ({ url: reviewUrl(b.slug.current), ...lastMod(b._updatedAt) })),
    ...paymentMethods.map((m) => ({ url: `${BASE}${prefix}/online-casino/payment/${m.slug.current}/`, ...lastMod(m._updatedAt) })),
    ...software.map((s) => ({ url: `${BASE}${prefix}/online-casino/software/${s.slug.current}/`, ...lastMod(s._updatedAt) })),
    ...casinoGuides.map((g) => ({ url: `${BASE}${prefix}/casino-guides/${g.slug.current}/`, ...lastMod(g._updatedAt) })),
    ...bonusser.map((b) => ({ url: `${BASE}${prefix}/online-casino/bonus/${b.slug.current}/`, ...lastMod(b._updatedAt) })),
    ...posts.map((p) => ({ url: `${BASE}/${p.slug.current}/`, ...lastMod(p.lastUpdated ?? p.publishedAt) })),
  ]
}
