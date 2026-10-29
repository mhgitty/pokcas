import type { Metadata } from 'next'

const BASE = 'https://pokcas.com'
export const DEFAULT_OG_IMAGE = `${BASE}/og.png`

type Img = { url?: string | null; alt?: string | null } | null | undefined

// Sanity CDN serves .webp, which several link-preview scrapers (Facebook,
// LinkedIn, some chat apps) don't reliably render. Ask the CDN for a 1200px JPG.
export function ogImageUrl(url: string): string {
  if (!url.includes('cdn.sanity.io/images/')) return url
  const [base] = url.split('?')
  return `${base}?w=1200&fm=jpg&q=85`
}

/** First image with a url among the candidates (ogImage, featuredImage, logo…). */
export function pickOgImage(...candidates: Img[]): Img {
  for (const c of candidates) if (c?.url) return c
  return null
}

/** OG images for a Sanity page doc: ogImage → featuredImage. */
export function pageOgImages(page: any): { url: string; alt?: string }[] | undefined {
  const img = pickOgImage(page?.ogImage, page?.featuredImage)
  return img?.url ? [{ url: img.url, ...(img.alt ? { alt: img.alt } : {}) }] : undefined
}

function firstImageUrl(images: any): string | undefined {
  if (!images) return undefined
  const first = Array.isArray(images) ? images[0] : images
  if (!first) return undefined
  if (typeof first === 'string') return first
  if (first instanceof URL) return first.toString()
  return first.url ? String(first.url) : undefined
}

/**
 * Normalises a route's metadata so every page gets its own og:url, title,
 * description and image. Without this, any route that omits `openGraph`
 * inherits the root layout's (og:url = homepage, og.png) — so link previews
 * show the same card for every page.
 */
export function finalizeMeta(meta: Metadata | null | undefined): Metadata {
  if (!meta || Object.keys(meta).length === 0) return meta ?? {}

  const og: any = { ...(meta.openGraph ?? {}) }
  const title = (og.title ?? meta.title) as any
  const description = (og.description ?? meta.description) as any
  const canonical = meta.alternates?.canonical
  const canonicalStr = canonical ? String(canonical) : undefined

  if (!og.url && canonicalStr) og.url = canonicalStr
  if (!og.title && title) og.title = title
  if (!og.description && description) og.description = description
  if (!og.type) og.type = 'article'
  if (!og.siteName) og.siteName = 'Pokcas.com'

  const raw = firstImageUrl(og.images) ?? firstImageUrl((meta.twitter as any)?.images)
  const imageUrl = raw ? ogImageUrl(raw) : DEFAULT_OG_IMAGE
  const alt = (Array.isArray(og.images) && og.images[0]?.alt) || (typeof title === 'string' ? title : 'Pokcas.com')
  og.images = imageUrl === DEFAULT_OG_IMAGE
    ? [{ url: imageUrl, width: 1200, height: 630, alt }]
    : [{ url: imageUrl, alt }]

  const tw: any = { ...(meta.twitter ?? {}) }
  tw.card = 'summary_large_image'
  if (!tw.title && title) tw.title = title
  if (!tw.description && description) tw.description = description
  tw.images = [imageUrl]

  return { ...meta, openGraph: og, twitter: tw }
}
