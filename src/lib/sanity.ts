import { createClient } from 'next-sanity'
import { cache } from 'react'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
const apiVersion = '2026-04-22'

const publishedClient = createClient({ projectId, dataset, apiVersion, useCdn: true })
const publishedNoCdnClient = createClient({ projectId, dataset, apiVersion, useCdn: false })

// Draft (preview) client — reads unpublished drafts. Only active when a read
// token is set AND Next.js Draft Mode is enabled for the request.
const readToken = process.env.SANITY_API_READ_TOKEN
const draftClient = readToken
  ? createClient({ projectId, dataset, apiVersion, useCdn: false, token: readToken, perspective: 'drafts' })
  : null

async function isPreview(): Promise<boolean> {
  if (!draftClient) return false
  try {
    const { draftMode } = await import('next/headers')
    return (await draftMode()).isEnabled
  } catch {
    return false // no request scope (e.g. build-time generateStaticParams)
  }
}

// Draft-aware clients. When Draft Mode is on they read drafts (fresh, no cache);
// otherwise they behave exactly like the published clients. Call sites use
// `.fetch(...)` unchanged.
//
// The draft fetch is fault-tolerant: if it throws (missing/invalid read token,
// insufficient permissions, transient API error), we log the real cause and
// fall back to the published client so preview never hard-crashes the page.
async function draftAwareFetch<R>(
  fallback: (q: string, p: any, o: any) => Promise<R>,
  query: string,
  params: any,
  options: any
): Promise<R> {
  if (await isPreview()) {
    try {
      return await draftClient!.fetch<R>(query, params, { cache: 'no-store' })
    } catch (err) {
      console.error('[preview] draft fetch failed, falling back to published:', err)
      return fallback(query, params, options)
    }
  }
  return fallback(query, params, options)
}

export const client = {
  fetch: <R = any>(query: string, params: any = {}, options: any = {}): Promise<R> =>
    draftAwareFetch<R>((q, p, o) => publishedClient.fetch<R>(q, p, o), query, params, options),
}

export const clientNoCdn = {
  fetch: <R = any>(query: string, params: any = {}, options: any = {}): Promise<R> =>
    draftAwareFetch<R>((q, p, o) => publishedNoCdnClient.fetch<R>(q, p, o), query, params, options),
}

// ─── Hreflang ─────────────────────────────────────────────────────────────────
// Embed in any query as: "hreflangScript": ${HREFLANG_FRAGMENT}
// Uses a reverse reference lookup — finds any hreflangGroup that includes this doc.

export const HREFLANG_FRAGMENT = `*[_type == "hreflangGroup" && ^._id in pages[]._ref][0].script`

export async function getHreflangScript(docId: string): Promise<string | null> {
  return clientNoCdn.fetch(
    `*[_type == "hreflangGroup" && references($docId)][0].script`,
    { docId }
  )
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function getPosts(limit = 20, categorySlug?: string) {
  const filter = categorySlug
    ? `*[_type == "post" && defined(publishedAt) && category->slug.current == $categorySlug]`
    : `*[_type == "post" && defined(publishedAt)]`

  return client.fetch(
    `${filter} | order(publishedAt desc) [0...$limit] {
      _id, title, slug, excerpt, publishedAt, readingTime,
      "featuredImage": featuredImage { "url": asset->url, alt },
      category-> { name, slug, emoji }
    }`,
    { limit, categorySlug: categorySlug ?? '' }
  )
}

export async function getPostBySlug(slug: string) {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      _id, title, slug, excerpt, publishedAt, lastUpdated, readingTime,
      "body": body[] {
        ...,
        _type == "casinoKortBlock" => {
          ...,
          customTitle, customBody, pros, cons,
          "imageUrl": image.asset->url,
          "bookmaker": bookmaker-> {
            name, score, url,
            "logoUrl": logo.asset->url,
            "logoAlt": logo.alt,
          }
        },
        _type == "bonusKortBlock" => {
          ...,
          customTitle, customBody,
          "imageUrl": image.asset->url,
          "bonus": bonus-> {
            "name": coalesce(bookmaker->name, casinoNavn, title),
            "bonusText": title,
            "logoUrl": coalesce(casinoLogo.asset->url, bookmaker->logo.asset->url),
            "logoAlt": coalesce(casinoLogo.alt, bookmaker->logo.alt),
            "score": bookmaker->score,
            "offerUrl": offerUrl,
            "terms": terms,
          }
        }
      },
      "featuredImage": featuredImage { "url": asset->url, alt },
      "ogImage": ogImage { "url": asset->url, alt },
      metaTitle, metaDescription,
      category-> { name, slug, emoji },
      author-> { name, slug, bio, linkedin, "imageUrl": image.asset->url }
    }`,
    { slug }
  )
}

// ─── Comparison table fragment ─────────────────────────────────────────────────
// Pages store showComparisonTable (bool) + comparisonTemplate (reference).
// We expand the reference inline so the frontend gets the same data shape.
const COMPARISON_TABLE_FRAGMENT = `
  showComparisonTable, comparisonTableTitle,
  "comparisonTable": comparisonTemplate-> {
    tableType,
    bonuses[]-> {
      _id, title, slug, active,
      oddsBonusTitel, minimumOdds, minimumIndbetaling, gennemspilskrav,
      offerUrl, terms, casinoNavn,
      "casinoLogo":      casinoLogo      { "url": asset->url, alt },
      "kampagneBillede": kampagneBillede { "url": asset->url, alt },
      "bookmaker": bookmaker-> { name, slug }
    },
    bookmakers[]-> {
      _id, name, slug, usp, score,
      indbetalingsbonus, minIndbetaling, gennemspilskrav,
      url, terms, market,
      "logo": logo { "url": asset->url, alt },
      "paymentMethods": paymentMethods[]-> {
        _id, name, "slug": slug.current,
        "logo": logo { "url": asset->url, alt }
      },
      "software": software[]-> {
        _id, name, "slug": slug.current,
        "logo": logo { "url": asset->url, alt }
      }
    }
  }
`

// ─── Pages ────────────────────────────────────────────────────────────────────

// Page fields shared by single and nested lookups
const PAGE_FIELDS = `
  _id, title, slug, intro, metaTitle, metaDescription,
  "body": body[] {
    ...,
    _type == "casinoKortBlock" => {
      ...,
      customTitle, customBody, pros, cons,
      "imageUrl": image.asset->url,
      "bookmaker": bookmaker-> {
        name, score, url,
        "logoUrl": logo.asset->url,
        "logoAlt": logo.alt,
      }
    },
    _type == "bonusKortBlock" => {
      ...,
      customTitle, customBody,
      "imageUrl": image.asset->url,
      "bonus": bonus-> {
        "name": coalesce(bookmaker->name, casinoNavn, title),
        "bonusText": coalesce(velkomstbonusTitel, oddsBonusTitel, indbetalingsbonusTitel, title),
        "logoUrl": coalesce(casinoLogo.asset->url, bookmaker->logo.asset->url),
        "logoAlt": coalesce(casinoLogo.alt, bookmaker->logo.alt),
        "score": bookmaker->score,
        "offerUrl": offerUrl,
        "terms": terms,
      }
    }
  },
  "a1Slug": parent->slug.current,
  "a1Title": parent->title,
  "a2Slug": parent->parent->slug.current,
  "a2Title": parent->parent->title,
  "a3Slug": parent->parent->parent->slug.current,
  "a3Title": parent->parent->parent->title,
  "a4Slug": parent->parent->parent->parent->slug.current,
  "a4Title": parent->parent->parent->parent->title,
  "featuredImage": featuredImage { "url": asset->url, alt },
  lastUpdated, hideAuthor,
  "author": author-> {
    name, slug, bio, linkedin, x, facebook,
    "imageUrl": image.asset->url
  },
  "factChecker": factChecker-> {
    name, slug, linkedin,
    "imageUrl": image.asset->url
  },
  ${COMPARISON_TABLE_FRAGMENT}
`

export async function getPageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "page" && slug.current == $slug && !defined(parent) && (market == "global" || !defined(market))][0] { ${PAGE_FIELDS} }`,
    { slug }
  )
}

/** Build a dynamic ancestor filter for any path depth (up to 5 levels) */
function buildAncestorFilter(segments: string[]): { conditions: string; params: Record<string, string> } {
  const reversed = [...segments].reverse() // [child, parent, grandparent, ...]
  const params: Record<string, string> = {}
  const conditions = reversed.map((seg, i) => {
    const key = `seg${i}`
    params[key] = seg
    return `${'parent->'.repeat(i)}slug.current == $${key}`
  })
  // Anchor the chain to the root: the topmost matched segment must itself have
  // no parent. Without this, a partial path matches a deeper page — e.g.
  // /ca/bonus/no-deposit/ would match the page that actually lives at
  // /ca/online-casino/bonus/no-deposit/, since only the immediate parent is checked.
  conditions.push(`!defined(${'parent->'.repeat(segments.length - 1)}parent)`)
  return { conditions: conditions.join(' && '), params }
}

/** Resolve a page by its full URL path — supports any depth up to 5 segments */
export async function getPageByPath(segments: string[]) {
  if (segments.length === 1) return getPageBySlug(segments[0])
  const { conditions, params } = buildAncestorFilter(segments)
  return client.fetch(
    `*[_type == "page" && ${conditions} && (market == "global" || !defined(market))][0] { ${PAGE_FIELDS} }`,
    params
  )
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories() {
  return client.fetch(
    `*[_type == "category"] | order(name asc) { _id, name, slug, emoji, description }`
  )
}

// ─── Bookmakers ───────────────────────────────────────────────────────────────

export async function getBookmakers() {
  return clientNoCdn.fetch(
    `*[_type == "bookmaker" && (market == "global" || !defined(market))] | order(score desc, name asc) {
      _id, name, slug, usp, score,
      indbetalingsbonus, minIndbetaling,
      gennemspilskrav, url, terms,
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

export async function getBookmakerBySlug(slug: string) {
  return clientNoCdn.fetch(
    `*[_type == "bookmaker" && slug.current == $slug && (market == "global" || !defined(market))][0] {
      _id, titel, name, slug, usp, score,
      indbetalingsbonus, minIndbetaling, gennemspilskrav,
      url, terms, lanceringsdato, license, body,
      "logo": logo { "url": asset->url, alt },
      "ogImage": ogImage { "url": asset->url, alt },
      metaTitle, metaDescription
    }`,
    { slug }
  )
}

// ─── Bonusser ─────────────────────────────────────────────────────────────────

export async function getBonuses(limit = 50) {
  return client.fetch(
    `*[_type == "bonus" && active == true && (market == "global" || !defined(market))] | order(_createdAt desc) [0...$limit] {
      _id, title, slug,
      oddsBonusTitel, minimumOdds, minimumIndbetaling, gennemspilskrav,
      offerUrl, terms, casinoNavn,
      "casinoLogo":    casinoLogo    { "url": asset->url, alt },
      "kampagneBillede": kampagneBillede { "url": asset->url, alt },
      "bookmaker": bookmaker-> { name, slug }
    }`,
    { limit }
  )
}

// Keep old name as alias for any existing usage
export const getBonusser = getBonuses

export async function getBonusBySlug(slug: string) {
  return client.fetch(
    `*[_type == "bonus" && slug.current == $slug && (market == "global" || !defined(market))][0] {
      _id, title, slug, body, metaTitle, metaDescription,
      minimumOdds, minimumIndbetaling, gennemspilskrav,
      maksGevinst, bonuskode, spinVaerdi,
      offerUrl, terms, casinoNavn,
      "casinoLogo":      casinoLogo      { "url": asset->url, alt },
      "kampagneBillede": kampagneBillede { "url": asset->url, alt },
      "ogImage":         ogImage         { "url": asset->url, alt },
      "bookmaker": bookmaker-> {
        name, slug,
        "logo": logo { "url": asset->url, alt }
      }
    }`,
    { slug }
  )
}

// ─── Site settings (menus) ────────────────────────────────────────────────────
// Wrapped in React cache() so Navbar + Footer share one fetch per page render.

// ── Header nav projection (nested children → multi-level sub-menus) ──────────────
const navSlugFields = (m: boolean) =>
  `"pageSlug": pageRef->slug.current, "pageParentSlug": pageRef->parent->slug.current, "pageParent2Slug": pageRef->parent->parent->slug.current, "pageParent3Slug": pageRef->parent->parent->parent->slug.current, "pageParent4Slug": pageRef->parent->parent->parent->parent->slug.current, ${m ? '"pageMarket": pageRef->market, ' : ''}"bookmakerSlug": bookmakerRef->slug.current, "softwareSlug": softwareRef->slug.current, "paymentMethodSlug": paymentMethodRef->slug.current, "postSlug": postRef->slug.current, "casinoGuideSlug": casinoGuideRef->slug.current, "casinoGuideMarket": casinoGuideRef->market`
const navChildren = (depth: number, m: boolean): string =>
  depth <= 0 ? '' : `, children[] { label, url, ${navSlugFields(m)}${navChildren(depth - 1, m)} }`
const headerNavProjection = (m: boolean) =>
  `headerNav[] { label, url, isHighlighted, icon, ${navSlugFields(m)}${navChildren(3, m)} }`

export const getSiteSettings = cache(async () => {
  return client.fetch(
    `*[_type == "siteSettings"][0] {
      "logoUrl": logo.asset->url,
      "logoWhiteUrl": logoWhite.asset->url,
      "defaultAuthor": defaultAuthor-> {
        name, slug, bio, linkedin, x, facebook,
        "imageUrl": image.asset->url
      },
      ${headerNavProjection(false)},
      footerTagline,
      socialLinks,
      footerColumns[] {
        title,
        items[] {
          label, url,
          "pageSlug": pageRef->slug.current,
          "pageParentSlug": pageRef->parent->slug.current,
          "pageParent2Slug": pageRef->parent->parent->slug.current,
          "pageParent3Slug": pageRef->parent->parent->parent->slug.current,
          "pageParent4Slug": pageRef->parent->parent->parent->parent->slug.current,
          "pageMarket": pageRef->market,
          "bookmakerSlug": bookmakerRef->slug.current,
          "softwareSlug": softwareRef->slug.current,
          "paymentMethodSlug": paymentMethodRef->slug.current,
          "postSlug": postRef->slug.current, "casinoGuideSlug": casinoGuideRef->slug.current, "casinoGuideMarket": casinoGuideRef->market,
        }
      },
      footerLongDisclaimer,
      footerMediaLogos[] {
        alt,
        url,
        "imageUrl": image.asset->url
      },
      footerTrustIcons[] {
        alt,
        url,
        "imageUrl": image.asset->url
      },
      footerNote,
      footerDisclaimer,
      footerBottomNav[] {
        label, url,
        "pageSlug": pageRef->slug.current,
        "pageParentSlug": pageRef->parent->slug.current,
        "pageParent2Slug": pageRef->parent->parent->slug.current,
        "pageParent3Slug": pageRef->parent->parent->parent->slug.current,
        "pageParent4Slug": pageRef->parent->parent->parent->parent->slug.current,
        "pageMarket": pageRef->market,
        "bookmakerSlug": bookmakerRef->slug.current,
        "softwareSlug": softwareRef->slug.current,
        "paymentMethodSlug": paymentMethodRef->slug.current,
        "postSlug": postRef->slug.current, "casinoGuideSlug": casinoGuideRef->slug.current, "casinoGuideMarket": casinoGuideRef->market,
      }
    }`,
    {},
    { next: { revalidate: 3600 } }
  )
})

// ─── Homepage ─────────────────────────────────────────────────────────────────

export async function getHomepage() {
  return client.fetch(
    `*[_type == "homepage" && _id == "homepage"][0] {
      heroHeading, heroGreenText, intro,
      "body": body[] {
        ...,
        _type == "casinoKortBlock" => {
          ...,
          customTitle, customBody, pros, cons,
          "imageUrl": image.asset->url,
          "bookmaker": bookmaker-> {
            name, score, url,
            "logoUrl": logo.asset->url,
            "logoAlt": logo.alt,
          }
        },
        _type == "bonusKortBlock" => {
          ...,
          customTitle, customBody,
          "imageUrl": image.asset->url,
          "bonus": bonus-> {
            "name": coalesce(bookmaker->name, casinoNavn, title),
            "bonusText": title,
            "logoUrl": coalesce(casinoLogo.asset->url, bookmaker->logo.asset->url),
            "logoAlt": coalesce(casinoLogo.alt, bookmaker->logo.alt),
            "score": bookmaker->score,
            "offerUrl": offerUrl,
            "terms": terms,
          }
        }
      },
      howItWorksTitle, showHowItWorks, howItWorksItems,
      latestSectionTitle, casinoReviewsTitle, topRatedTitle, featuredSectionTitle,
      "trustItems": trustItems[] { _key, icon, title, body },
      metaTitle, metaDescription,
      "featuredImage": featuredImage { "url": asset->url, alt },
      ${COMPARISON_TABLE_FRAGMENT}
    }`
  )
}

// ─── Payment Methods ──────────────────────────────────────────────────────────

export async function getPaymentMethods() {
  return client.fetch(
    `*[_type == "paymentMethod" && (market == "global" || !defined(market))] | order(name asc) {
      _id, name, slug, paymentCategory,
      transactionFees, withdrawalTime, eligibleForBonuses,
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

// ─── Author lookup (for the callout / quote body block) ───────────────────────

export type QuoteAuthor = {
  _id: string
  name?: string
  role?: string
  slug?: { current?: string }
  imageUrl?: string
}

export const getAuthorById = cache(async (id: string): Promise<QuoteAuthor | null> => {
  if (!id) return null
  return client.fetch(
    `*[_type == "author" && _id == $id][0] {
      _id, name, role, slug, "imageUrl": image.asset->url
    }`,
    { id }
  )
})

// ─── Provider box (body block) ────────────────────────────────────────────────
// Resolves the payment methods / software providers shown by a providerBoxBlock.
// Either an explicit hand-picked list (order preserved) or the top N for a market.

export type ProviderBoxItem = {
  _id: string
  _type: 'paymentMethod' | 'software'
  name?: string
  slug?: { current?: string }
  logo?: { url?: string; alt?: string }
}

export async function getProviderBoxItems(opts: {
  provider: 'paymentMethod' | 'software'
  market?: string
  ids?: string[]
  limit?: number
}): Promise<ProviderBoxItem[]> {
  const type = opts.provider === 'software' ? 'software' : 'paymentMethod'
  const ids = (opts.ids || []).filter(Boolean)
  const projection = `_id, _type, name, slug, "logo": logo { "url": asset->url, alt }`

  if (ids.length > 0) {
    // Hand-picked: accept either type so a mixed selection still resolves,
    // and let each item's own _type drive its URL.
    const rows: ProviderBoxItem[] = await client.fetch(
      `*[_id in $ids && _type in ["paymentMethod", "software"]] { ${projection} }`,
      { ids }
    )
    // GROQ ignores the order of $ids — restore the editor's chosen order.
    const byId = new Map(rows.map((r) => [r._id, r]))
    return ids.map((id) => byId.get(id)).filter(Boolean) as ProviderBoxItem[]
  }

  const market = opts.market || 'global'
  const marketFilter =
    market === 'global' ? '(market == "global" || !defined(market))' : 'market == $market'
  const limit = Math.max(1, Math.min(opts.limit || 6, 24))

  return client.fetch(
    `*[_type == $type && ${marketFilter}] | order(name asc) [0...$limit] { ${projection} }`,
    { type, market, limit }
  )
}

export async function getPaymentMethodBySlug(slug: string) {
  return client.fetch(
    `*[_type == "paymentMethod" && slug.current == $slug && (market == "global" || !defined(market))][0] {
      _id, name, titel, slug, withdrawalTime,
      ${COMPARISON_TABLE_FRAGMENT},
      paymentCategory, transactionFees, eligibleForBonuses,
      metaTitle, metaDescription,
      "intro": intro[] { ..., _type == "image" => { ..., "url": asset->url } },
      "body": body[] { ..., _type == "image" => { ..., "url": asset->url } },
      "logo": logo { "url": asset->url, alt },
      "casinos": *[_type == "bookmaker" && references(^._id)] | order(score desc) {
        _id, name, slug, score, usp, url,
        "logo": logo { "url": asset->url, alt }
      }
    }`,
    { slug }
  )
}

// ─── Software ─────────────────────────────────────────────────────────────────

export async function getSoftwareProviders() {
  return client.fetch(
    `*[_type == "software" && (market == "global" || !defined(market))] | order(name asc) {
      _id, name, slug, rtp, amountOfSlots, gameCategories,
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

export async function getSoftwareBySlug(slug: string) {
  return client.fetch(
    `*[_type == "software" && slug.current == $slug && (market == "global" || !defined(market))][0] {
      _id, name, titel, slug, metaTitle, metaDescription,
      ${COMPARISON_TABLE_FRAGMENT},
      rtp, amountOfSlots, licenses, gameCategories, highestRtpSlot, bonusBuys,
      "intro": intro[] { ..., _type == "image" => { ..., "url": asset->url } },
      "body": body[] { ..., _type == "image" => { ..., "url": asset->url } },
      "logo": logo { "url": asset->url, alt },
      "casinos": casinos[]-> {
        _id, name, slug, score, usp, url,
        "logo": logo { "url": asset->url, alt }
      }
    }`,
    { slug }
  )
}

// ─── Liga stillinger ──────────────────────────────────────────────────────────

export async function getLigaStillingerBySlug(slug: string) {
  return client.fetch(
    `*[_type == "ligaStillinger" && slug.current == $slug][0] {
      _id, title, leagueName, intro, slug, leagueId, seasonId,
      "logo": logo { "url": asset->url, alt },
      metaTitle, metaDescription, lastUpdated,
      body[] { ..., _type == "image" => { ..., "url": asset->url } }
    }`,
    { slug }
  )
}

export async function getLigaStillingerPaths() {
  return client.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "ligaStillinger" && defined(slug.current)] { slug }`
  ).catch(() => [])
}

// ─── Authors ──────────────────────────────────────────────────────────────────

export async function getAuthorBySlug(slug: string) {
  return clientNoCdn.fetch(
    `*[_type == "author" && slug.current == $slug][0] {
      _id, name, slug, role, bio, intro, education, expertise, linkedin, x, facebook,
      "imageUrl": image.asset->url,
      metaTitle, metaDescription,
      "body": body[] {
        ...,
        _type == "image" => { ..., "url": asset->url }
      }
    }`,
    { slug }
  )
}

export async function getReviewsByAuthor(authorId: string, limit = 20) {
  return client.fetch(
    `*[_type == "bookmaker" && defined(slug.current)] | order(_createdAt desc) [0...$limit] {
      _id, name, slug, usp, score, market,
      "logo": logo { "url": asset->url, alt }
    }`,
    { authorId, limit }
  )
}

export async function getPostsByAuthor(authorId: string, limit = 20) {
  return client.fetch(
    `*[_type == "post" && defined(publishedAt) && author._ref == $authorId]
     | order(publishedAt desc) [0...$limit] {
      _id, title, slug, excerpt, publishedAt, readingTime,
      "featuredImage": featuredImage { "url": asset->url, alt },
      category-> { name, slug, emoji }
    }`,
    { authorId, limit }
  )
}

export async function getAuthorPaths() {
  return clientNoCdn.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "author" && defined(slug.current)] { slug }`
  ).catch(() => [])
}

// ─── Market settings & country homepage ──────────────────────────────────────

export async function getMarketSettings(market: 'ca' | 'au') {
  return client.fetch(
    `*[_type == "marketSettings" && _id == $id][0] {
      market, footerTagline, footerNote, footerDisclaimer, socialLinks,
      footerLongDisclaimer,
      "footerMediaLogos": footerMediaLogos[] {
        alt, url,
        "imageUrl": image.asset->url
      },
      "footerTrustIcons": footerTrustIcons[] {
        alt, url,
        "imageUrl": image.asset->url
      },
      ${headerNavProjection(true)},
      footerColumns[] {
        title,
        items[] {
          label, url,
          "pageSlug": pageRef->slug.current,
          "pageParentSlug": pageRef->parent->slug.current,
          "pageParent2Slug": pageRef->parent->parent->slug.current,
          "pageParent3Slug": pageRef->parent->parent->parent->slug.current,
          "pageParent4Slug": pageRef->parent->parent->parent->parent->slug.current,
          "pageMarket": pageRef->market,
          "bookmakerSlug": bookmakerRef->slug.current,
          "softwareSlug": softwareRef->slug.current,
          "paymentMethodSlug": paymentMethodRef->slug.current,
          "postSlug": postRef->slug.current, "casinoGuideSlug": casinoGuideRef->slug.current, "casinoGuideMarket": casinoGuideRef->market,
        }
      },
      footerBottomNav[] {
        label, url,
        "pageSlug": pageRef->slug.current,
        "pageParentSlug": pageRef->parent->slug.current,
        "pageParent2Slug": pageRef->parent->parent->slug.current,
        "pageParent3Slug": pageRef->parent->parent->parent->slug.current,
        "pageParent4Slug": pageRef->parent->parent->parent->parent->slug.current,
        "pageMarket": pageRef->market,
        "bookmakerSlug": bookmakerRef->slug.current,
        "softwareSlug": softwareRef->slug.current,
        "paymentMethodSlug": paymentMethodRef->slug.current,
        "postSlug": postRef->slug.current, "casinoGuideSlug": casinoGuideRef->slug.current, "casinoGuideMarket": casinoGuideRef->market,
      }
    }`,
    { id: `${market}-settings` },
    { next: { revalidate: 3600 } }
  )
}

export async function getCountryHomepage(market: 'ca' | 'au') {
  return client.fetch(
    `*[_type == "countryHomepage" && _id == $id][0] {
      market, heroHeading, intro,
      "heroCards": heroCards[] { _key, title, icon, href },
      "body": body[] {
        ...,
        _type == "casinoKortBlock" => {
          ...,
          customTitle, customBody, pros, cons,
          "imageUrl": image.asset->url,
          "bookmaker": bookmaker-> {
            name, score, url,
            "logoUrl": logo.asset->url,
            "logoAlt": logo.alt,
          }
        }
      },
      "sections": sections[] {
        _type, _key,
        title, count, body, icon, buttonLabel, buttonUrl, style,
        intro,
        "items": items[] {
          _key, title, description, icon, href,
          "bullets": bullets[]
        }
      },
      metaTitle, metaDescription,
      "ogImage": ogImage { "url": asset->url, alt }
    }`,
    { id: `${market}-homepage` }
  )
}

// ─── Canada (market == 'ca') ──────────────────────────────────────────────────

export async function getBookmakersCa() {
  return clientNoCdn.fetch(
    `*[_type == "bookmaker" && market == "ca"] | order(score desc, name asc) {
      _id, name, slug, usp, score,
      indbetalingsbonus, minIndbetaling,
      gennemspilskrav, url, terms,
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

export async function getBookmakerBySlugCa(slug: string) {
  return clientNoCdn.fetch(
    `*[_type == "bookmaker" && slug.current == $slug && market == "ca"][0] {
      _id, titel, name, slug, usp, score,
      indbetalingsbonus, minIndbetaling, gennemspilskrav,
      url, terms, lanceringsdato, license, body,
      "logo": logo { "url": asset->url, alt },
      "ogImage": ogImage { "url": asset->url, alt },
      metaTitle, metaDescription,
      "paymentMethods": paymentMethods[]-> {
        _id, name, slug,
        "logo": logo { "url": asset->url, alt }
      },
      "software": software[]-> {
        _id, name, slug,
        "logo": logo { "url": asset->url, alt }
      }
    }`,
    { slug }
  )
}

export async function getBonusesCa(limit = 50) {
  return client.fetch(
    `*[_type == "bonus" && active == true && market == "ca"] | order(_createdAt desc) [0...$limit] {
      _id, title, slug,
      oddsBonusTitel, minimumOdds, minimumIndbetaling, gennemspilskrav,
      offerUrl, terms, casinoNavn,
      "casinoLogo":    casinoLogo    { "url": asset->url, alt },
      "kampagneBillede": kampagneBillede { "url": asset->url, alt },
      "bookmaker": bookmaker-> { name, slug }
    }`,
    { limit }
  )
}

export async function getBonusBySlugCa(slug: string) {
  return client.fetch(
    `*[_type == "bonus" && slug.current == $slug && market == "ca"][0] {
      _id, title, slug, body, metaTitle, metaDescription,
      minimumOdds, minimumIndbetaling, gennemspilskrav,
      maksGevinst, bonuskode, spinVaerdi,
      offerUrl, terms, casinoNavn,
      "casinoLogo":      casinoLogo      { "url": asset->url, alt },
      "kampagneBillede": kampagneBillede { "url": asset->url, alt },
      "ogImage":         ogImage         { "url": asset->url, alt },
      "bookmaker": bookmaker-> {
        name, slug,
        "logo": logo { "url": asset->url, alt }
      }
    }`,
    { slug }
  )
}

export async function getPaymentMethodsCa() {
  return client.fetch(
    `*[_type == "paymentMethod" && market == "ca"] | order(name asc) {
      _id, name, slug, paymentCategory,
      transactionFees, withdrawalTime, eligibleForBonuses,
      "casinoCount": count(*[_type == "bookmaker" && market == "ca" && references(^._id)]),
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

export async function getPaymentMethodBySlugCa(slug: string) {
  return client.fetch(
    `*[_type == "paymentMethod" && slug.current == $slug && market == "ca"][0] {
      _id, name, titel, slug, withdrawalTime,
      ${COMPARISON_TABLE_FRAGMENT},
      paymentCategory, transactionFees, eligibleForBonuses,
      metaTitle, metaDescription,
      "intro": intro[] { ..., _type == "image" => { ..., "url": asset->url } },
      "body": body[] { ..., _type == "image" => { ..., "url": asset->url } },
      "logo": logo { "url": asset->url, alt },
      "casinos": *[_type == "bookmaker" && market == "ca" && references(^._id)] | order(score desc) {
        _id, name, slug, score, usp, url,
        "logo": logo { "url": asset->url, alt }
      }
    }`,
    { slug }
  )
}

export async function getSoftwareProvidersCa() {
  return client.fetch(
    `*[_type == "software" && market == "ca"] | order(name asc) {
      _id, name, slug, rtp, amountOfSlots, gameCategories,
      "casinoCount": count(*[_type == "bookmaker" && market == "ca" && references(^._id)]),
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

export async function getSoftwareBySlugCa(slug: string) {
  return client.fetch(
    `*[_type == "software" && slug.current == $slug && market == "ca"][0] {
      _id, name, titel, slug, metaTitle, metaDescription,
      ${COMPARISON_TABLE_FRAGMENT},
      rtp, amountOfSlots, licenses, gameCategories, highestRtpSlot, bonusBuys,
      "intro": intro[] { ..., _type == "image" => { ..., "url": asset->url } },
      "body": body[] { ..., _type == "image" => { ..., "url": asset->url } },
      "logo": logo { "url": asset->url, alt },
      "casinos": casinos[]-> {
        _id, name, slug, score, usp, url,
        "logo": logo { "url": asset->url, alt }
      }
    }`,
    { slug }
  )
}

export async function getPageBySlugCa(slug: string) {
  return client.fetch(
    `*[_type == "page" && slug.current == $slug && market == "ca" && !defined(parent)][0] { ${PAGE_FIELDS} }`,
    { slug }
  )
}

// ─── Australia (market == 'au') ───────────────────────────────────────────────

export async function getBookmarkersAu() {
  return clientNoCdn.fetch(
    `*[_type == "bookmaker" && market == "au"] | order(score desc, name asc) {
      _id, name, slug, usp, score,
      indbetalingsbonus, minIndbetaling,
      gennemspilskrav, url, terms,
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

export async function getBookmakerBySlugAu(slug: string) {
  return clientNoCdn.fetch(
    `*[_type == "bookmaker" && slug.current == $slug && market == "au"][0] {
      _id, titel, name, slug, usp, score,
      indbetalingsbonus, minIndbetaling, gennemspilskrav,
      url, terms, lanceringsdato, license, body,
      "logo": logo { "url": asset->url, alt },
      "ogImage": ogImage { "url": asset->url, alt },
      metaTitle, metaDescription,
      "paymentMethods": paymentMethods[]-> {
        _id, name, slug,
        "logo": logo { "url": asset->url, alt }
      },
      "software": software[]-> {
        _id, name, slug,
        "logo": logo { "url": asset->url, alt }
      }
    }`,
    { slug }
  )
}

export async function getBonusesAu(limit = 50) {
  return client.fetch(
    `*[_type == "bonus" && active == true && market == "au"] | order(_createdAt desc) [0...$limit] {
      _id, title, slug,
      oddsBonusTitel, minimumOdds, minimumIndbetaling, gennemspilskrav,
      offerUrl, terms, casinoNavn,
      "casinoLogo":    casinoLogo    { "url": asset->url, alt },
      "kampagneBillede": kampagneBillede { "url": asset->url, alt },
      "bookmaker": bookmaker-> { name, slug }
    }`,
    { limit }
  )
}

export async function getBonusBySlugAu(slug: string) {
  return client.fetch(
    `*[_type == "bonus" && slug.current == $slug && market == "au"][0] {
      _id, title, slug, body, metaTitle, metaDescription,
      minimumOdds, minimumIndbetaling, gennemspilskrav,
      maksGevinst, bonuskode, spinVaerdi,
      offerUrl, terms, casinoNavn,
      "casinoLogo":      casinoLogo      { "url": asset->url, alt },
      "kampagneBillede": kampagneBillede { "url": asset->url, alt },
      "ogImage":         ogImage         { "url": asset->url, alt },
      "bookmaker": bookmaker-> {
        name, slug,
        "logo": logo { "url": asset->url, alt }
      }
    }`,
    { slug }
  )
}

export async function getPaymentMethodsAu() {
  return client.fetch(
    `*[_type == "paymentMethod" && market == "au"] | order(name asc) {
      _id, name, slug, paymentCategory,
      transactionFees, withdrawalTime, eligibleForBonuses,
      "casinoCount": count(*[_type == "bookmaker" && market == "au" && references(^._id)]),
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

export async function getPaymentMethodBySlugAu(slug: string) {
  return client.fetch(
    `*[_type == "paymentMethod" && slug.current == $slug && market == "au"][0] {
      _id, name, titel, slug, withdrawalTime,
      ${COMPARISON_TABLE_FRAGMENT},
      paymentCategory, transactionFees, eligibleForBonuses,
      metaTitle, metaDescription,
      "intro": intro[] { ..., _type == "image" => { ..., "url": asset->url } },
      "body": body[] { ..., _type == "image" => { ..., "url": asset->url } },
      "logo": logo { "url": asset->url, alt },
      "casinos": *[_type == "bookmaker" && market == "au" && references(^._id)] | order(score desc) {
        _id, name, slug, score, usp, url,
        "logo": logo { "url": asset->url, alt }
      }
    }`,
    { slug }
  )
}

export async function getSoftwareProvidersAu() {
  return client.fetch(
    `*[_type == "software" && market == "au"] | order(name asc) {
      _id, name, slug, rtp, amountOfSlots, gameCategories,
      "casinoCount": count(*[_type == "bookmaker" && market == "au" && references(^._id)]),
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

export async function getSoftwareBySlugAu(slug: string) {
  return client.fetch(
    `*[_type == "software" && slug.current == $slug && market == "au"][0] {
      _id, name, titel, slug, metaTitle, metaDescription,
      ${COMPARISON_TABLE_FRAGMENT},
      rtp, amountOfSlots, licenses, gameCategories, highestRtpSlot, bonusBuys,
      "intro": intro[] { ..., _type == "image" => { ..., "url": asset->url } },
      "body": body[] { ..., _type == "image" => { ..., "url": asset->url } },
      "logo": logo { "url": asset->url, alt },
      "casinos": casinos[]-> {
        _id, name, slug, score, usp, url,
        "logo": logo { "url": asset->url, alt }
      }
    }`,
    { slug }
  )
}

export async function getPageBySlugAu(slug: string) {
  return client.fetch(
    `*[_type == "page" && slug.current == $slug && market == "au" && !defined(parent)][0] { ${PAGE_FIELDS} }`,
    { slug }
  )
}

export async function getPageByPathAu(segments: string[]) {
  if (segments.length === 1) return getPageBySlugAu(segments[0])
  const { conditions, params } = buildAncestorFilter(segments)
  return client.fetch(
    `*[_type == "page" && ${conditions} && market == "au"][0] { ${PAGE_FIELDS} }`,
    params
  )
}

export async function getPageByPathCa(segments: string[]) {
  if (segments.length === 1) return getPageBySlugCa(segments[0])
  const { conditions, params } = buildAncestorFilter(segments)
  return client.fetch(
    `*[_type == "page" && ${conditions} && market == "ca"][0] { ${PAGE_FIELDS} }`,
    params
  )
}

// ─── Casino Games ─────────────────────────────────────────────────────────────

const CASINO_GAME_FIELDS = `
  _id, name, titel, slug, market,
  "logo":    logo    { "url": asset->url, alt },
  "ogImage": ogImage { "url": asset->url, alt },
  "intro": intro[] { ..., _type == "image" => { ..., "url": asset->url } },
  "body":  body[]  { ..., _type == "image" => { ..., "url": asset->url } },
  metaTitle, metaDescription,
  "casinos": casinos[]-> {
    _id, name, slug, usp, url,
    "logo": logo { "url": asset->url, alt }
  }
`

export async function getCasinoGameBySlug(slug: string) {
  return client.fetch(
    `*[_type == "casinoGame" && slug.current == $slug && market == "global"][0] { ${CASINO_GAME_FIELDS} }`,
    { slug }
  )
}

export async function getCasinoGameBySlugCa(slug: string) {
  return client.fetch(
    `*[_type == "casinoGame" && slug.current == $slug && market == "ca"][0] { ${CASINO_GAME_FIELDS} }`,
    { slug }
  )
}

export async function getCasinoGameBySlugAu(slug: string) {
  return client.fetch(
    `*[_type == "casinoGame" && slug.current == $slug && market == "au"][0] { ${CASINO_GAME_FIELDS} }`,
    { slug }
  )
}

// ─── Casino Guides ──────────────────────────────────────────────────────────────

export async function getCasinoGuideBySlug(slug: string) {
  return client.fetch(
    `*[_type == "casinoGuide" && slug.current == $slug && market == "global"][0] { ${PAGE_FIELDS} }`,
    { slug }
  )
}

export async function getCasinoGuideBySlugCa(slug: string) {
  return client.fetch(
    `*[_type == "casinoGuide" && slug.current == $slug && market == "ca"][0] { ${PAGE_FIELDS} }`,
    { slug }
  )
}

export async function getCasinoGuideBySlugAu(slug: string) {
  return client.fetch(
    `*[_type == "casinoGuide" && slug.current == $slug && market == "au"][0] { ${PAGE_FIELDS} }`,
    { slug }
  )
}

/** List of guides for the archive grid (light projection). */
export async function getCasinoGuides(market: 'global' | 'ca' | 'au') {
  return client.fetch(
    `*[_type == "casinoGuide" && market == $market && defined(slug.current)] | order(title asc) {
      _id, title, "slug": slug.current, metaDescription, lastUpdated,
      "featuredImage": featuredImage { "url": asset->url, alt }
    }`,
    { market }
  )
}
