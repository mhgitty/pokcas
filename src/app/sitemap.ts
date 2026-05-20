import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'

export const revalidate = 86400

const BASE = 'https://pokcas.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, pages, bookmakers, bonusser] = await Promise.all([
    client.fetch<Array<{ slug: { current: string }; publishedAt?: string; lastUpdated?: string }>>(
      `*[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) { slug, publishedAt, lastUpdated }`
    ).catch(() => []),
    client.fetch<Array<{ slug: { current: string }; parentSlug?: string; _updatedAt?: string }>>(
      `*[_type == "page" && defined(slug.current)] { slug, "parentSlug": parent->slug.current, _updatedAt }`
    ).catch(() => []),
    client.fetch<Array<{ slug: { current: string }; _updatedAt?: string }>>(
      `*[_type == "bookmaker" && defined(slug.current)] { slug, _updatedAt }`
    ).catch(() => []),
    client.fetch<Array<{ slug: { current: string }; _updatedAt?: string }>>(
      `*[_type == "bonus" && active == true && defined(slug.current)] { slug, _updatedAt }`
    ).catch(() => []),
  ])

  return [
    { url: BASE + '/', lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/betting-sider/`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/kampagner/`, changeFrequency: 'daily', priority: 0.9 },
    ...bookmakers.map((b) => ({
      url: `${BASE}/betting-sider/${b.slug.current}/`,
      lastModified: b._updatedAt ? new Date(b._updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...bonusser.map((b) => ({
      url: `${BASE}/kampagner/${b.slug.current}/`,
      lastModified: b._updatedAt ? new Date(b._updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: `${BASE}/${p.slug.current}/`,
      lastModified: p.lastUpdated ? new Date(p.lastUpdated) : p.publishedAt ? new Date(p.publishedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...pages.map((p) => ({
      url: p.parentSlug
        ? `${BASE}/${p.parentSlug}/${p.slug.current}/`
        : `${BASE}/${p.slug.current}/`,
      lastModified: p._updatedAt ? new Date(p._updatedAt) : undefined,
      changeFrequency: 'monthly' as const,
      priority: p.parentSlug ? 0.4 : 0.5,
    })),
  ]
}
