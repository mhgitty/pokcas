import { client } from '@/lib/sanity'

const BASE = 'https://pokcas.com'

export type Scope = 'all' | 'global' | 'ca' | 'au'
export type SitemapEntry = { url: string; lastModified?: Date }

function marketPrefix(market?: string) {
  if (market === 'ca') return '/ca'
  if (market === 'au') return '/au'
  return ''
}

function lastMod(date?: string): { lastModified: Date } | Record<string, never> {
  return date ? { lastModified: new Date(date) } : {}
}

// GROQ market filter for a scope.
function cond(scope: Scope): string {
  if (scope === 'all') return 'true'
  if (scope === 'global') return '(market == "global" || !defined(market))'
  return `market == "${scope}"`
}

type SlugRow = { slug: { current: string }; market?: string; _updatedAt?: string }
type PageRow = SlugRow & { a1?: string; a2?: string; a3?: string; a4?: string }
type PostRow = { slug: { current: string }; publishedAt?: string; lastUpdated?: string }

function indexPages(scope: Scope): SitemapEntry[] {
  const out: SitemapEntry[] = []
  const wantGlobal = scope === 'all' || scope === 'global'
  const wantCa = scope === 'all' || scope === 'ca'
  const wantAu = scope === 'all' || scope === 'au'
  if (wantGlobal) out.push(
    { url: `${BASE}/` },
    { url: `${BASE}/review/` },
    { url: `${BASE}/online-casino/payment/` },
    { url: `${BASE}/online-casino/software/` },
    { url: `${BASE}/casino-guides/` },
  )
  for (const [want, mp] of [[wantCa, '/ca'], [wantAu, '/au']] as const) {
    if (!want) continue
    out.push(
      { url: `${BASE}${mp}/` },
      { url: `${BASE}${mp}/online-casino/review/` },
      { url: `${BASE}${mp}/online-casino/bonus/` },
      { url: `${BASE}${mp}/online-casino/payment/` },
      { url: `${BASE}${mp}/online-casino/software/` },
      { url: `${BASE}${mp}/casino-guides/` },
    )
  }
  return out
}

export async function sitemapEntries(scope: Scope): Promise<SitemapEntry[]> {
  const c = cond(scope)
  const includePosts = scope === 'all' || scope === 'global'
  const includeBonus = scope !== 'global' // bonuses only exist under ca/au

  const [pages, bookmakers, paymentMethods, software, casinoGuides, bonusser, posts] = await Promise.all([
    client.fetch<PageRow[]>(
      `*[_type == "page" && defined(slug.current) && ${c}] {
        slug, market, _updatedAt,
        "a1": parent->slug.current, "a2": parent->parent->slug.current,
        "a3": parent->parent->parent->slug.current, "a4": parent->parent->parent->parent->slug.current
      }`
    ).catch(() => []),
    client.fetch<SlugRow[]>(`*[_type == "bookmaker" && defined(slug.current) && ${c}] { slug, market, _updatedAt }`).catch(() => []),
    client.fetch<SlugRow[]>(`*[_type == "paymentMethod" && defined(slug.current) && ${c}] { slug, market, _updatedAt }`).catch(() => []),
    client.fetch<SlugRow[]>(`*[_type == "software" && defined(slug.current) && ${c}] { slug, market, _updatedAt }`).catch(() => []),
    client.fetch<SlugRow[]>(`*[_type == "casinoGuide" && defined(slug.current) && ${c}] { slug, market, _updatedAt }`).catch(() => []),
    includeBonus
      ? client.fetch<SlugRow[]>(`*[_type == "bonus" && active == true && defined(slug.current) && ${scope === 'all' ? 'market in ["ca","au"]' : c}] { slug, market, _updatedAt }`).catch(() => [])
      : Promise.resolve([] as SlugRow[]),
    includePosts
      ? client.fetch<PostRow[]>(`*[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) { slug, publishedAt, lastUpdated }`).catch(() => [])
      : Promise.resolve([] as PostRow[]),
  ])

  const reviewUrl = (mp: string, slug: string) =>
    mp ? `${BASE}${mp}/online-casino/review/${slug}/` : `${BASE}/review/${slug}/`

  return [
    ...indexPages(scope),
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

// Serialize entries to a sitemap XML string (for the market-specific route handlers).
export function toSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((e) => {
      const lm = e.lastModified ? `<lastmod>${e.lastModified.toISOString()}</lastmod>` : ''
      return `<url><loc>${e.url}</loc>${lm}</url>`
    })
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
}
