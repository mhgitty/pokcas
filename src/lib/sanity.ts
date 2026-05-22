import { createClient } from 'next-sanity'
import { cache } from 'react'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2026-04-22',
  useCdn: true,
})

// Bypasses CDN — use for queries that need fresh/uncached data
export const clientNoCdn = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2026-04-22',
  useCdn: false,
})

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
      url, terms,
      "logo": logo { "url": asset->url, alt }
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
  "parentSlug": parent->slug.current,
  "parentTitle": parent->title,
  "featuredImage": featuredImage { "url": asset->url, alt },
  lastUpdated,
  "author": author-> {
    name, slug, bio, linkedin, x, facebook,
    "imageUrl": image.asset->url
  },
  "factChecker": factChecker-> {
    name, linkedin,
    "imageUrl": image.asset->url
  },
  ${COMPARISON_TABLE_FRAGMENT}
`

export async function getPageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "page" && slug.current == $slug && !defined(parent)][0] { ${PAGE_FIELDS} }`,
    { slug }
  )
}

/** Resolve a page by its full URL path (supports 1 or 2 segments) */
export async function getPageByPath(segments: string[]) {
  if (segments.length === 1) {
    return getPageBySlug(segments[0])
  }
  // Two-segment path: /parent/child
  const [parentSlug, childSlug] = segments
  return client.fetch(
    `*[_type == "page" && slug.current == $childSlug && parent->slug.current == $parentSlug][0] { ${PAGE_FIELDS} }`,
    { parentSlug, childSlug }
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
    `*[_type == "bookmaker"] | order(score desc, name asc) {
      _id, name, slug, usp, score,
      indbetalingsbonus, minIndbetaling,
      gennemspilskrav, url, terms,
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

export async function getBookmakerBySlug(slug: string) {
  return clientNoCdn.fetch(
    `*[_type == "bookmaker" && slug.current == $slug][0] {
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
    `*[_type == "bonus" && active == true] | order(_createdAt desc) [0...$limit] {
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
    `*[_type == "bonus" && slug.current == $slug][0] {
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

export const getSiteSettings = cache(async () => {
  return client.fetch(
    `*[_type == "siteSettings"][0] {
      "defaultAuthor": defaultAuthor-> {
        name, slug, bio, linkedin, x, facebook,
        "imageUrl": image.asset->url
      },
      headerNav[] {
        label, url, isHighlighted,
        "pageSlug": pageRef->slug.current,
        "pageParentSlug": pageRef->parent->slug.current,
        "bookmakerSlug": bookmakerRef->slug.current,
        children[] {
          label, url,
          "pageSlug": pageRef->slug.current,
          "pageParentSlug": pageRef->parent->slug.current,
          "bookmakerSlug": bookmakerRef->slug.current,
        }
      },
      footerTagline,
      footerColumns[] {
        title,
        items[] {
          label, url,
          "pageSlug": pageRef->slug.current,
          "pageParentSlug": pageRef->parent->slug.current,
          "bookmakerSlug": bookmakerRef->slug.current,
        }
      },
      footerNote,
      footerDisclaimer
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
      metaTitle, metaDescription,
      "featuredImage": featuredImage { "url": asset->url, alt },
      ${COMPARISON_TABLE_FRAGMENT}
    }`
  )
}

// ─── Payment Methods ──────────────────────────────────────────────────────────

export async function getPaymentMethods() {
  return client.fetch(
    `*[_type == "paymentMethod"] | order(name asc) {
      _id, name, slug,
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

export async function getPaymentMethodBySlug(slug: string) {
  return client.fetch(
    `*[_type == "paymentMethod" && slug.current == $slug][0] {
      _id, name, titel, slug, withdrawalTime, withdrawalFee,
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
    `*[_type == "software"] | order(name asc) {
      _id, name, slug,
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

export async function getSoftwareBySlug(slug: string) {
  return client.fetch(
    `*[_type == "software" && slug.current == $slug][0] {
      _id, name, titel, slug,
      "logo": logo { "url": asset->url, alt },
      "casinos": *[_type == "bookmaker" && references(^._id)] | order(score desc) {
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
      _id, name, slug, role, bio, linkedin, x, facebook,
      "imageUrl": image.asset->url
    }`,
    { slug }
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
      market, headerNav, footerTagline, footerColumns, footerNote, footerDisclaimer
    }`,
    { id: `${market}-settings` },
    { next: { revalidate: 3600 } }
  )
}

export async function getCountryHomepage(market: 'ca' | 'au') {
  return client.fetch(
    `*[_type == "countryHomepage" && _id == $id][0] {
      market, heroHeading, intro,
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
      _id, name, slug,
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

export async function getPaymentMethodBySlugCa(slug: string) {
  return client.fetch(
    `*[_type == "paymentMethod" && slug.current == $slug && market == "ca"][0] {
      _id, name, titel, slug, withdrawalTime, withdrawalFee,
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
      _id, name, slug,
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

export async function getSoftwareBySlugCa(slug: string) {
  return client.fetch(
    `*[_type == "software" && slug.current == $slug && market == "ca"][0] {
      _id, name, titel, slug,
      "logo": logo { "url": asset->url, alt },
      "casinos": *[_type == "bookmaker" && market == "ca" && references(^._id)] | order(score desc) {
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
      _id, name, slug,
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

export async function getPaymentMethodBySlugAu(slug: string) {
  return client.fetch(
    `*[_type == "paymentMethod" && slug.current == $slug && market == "au"][0] {
      _id, name, titel, slug, withdrawalTime, withdrawalFee,
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
      _id, name, slug,
      "logo": logo { "url": asset->url, alt }
    }`
  )
}

export async function getSoftwareBySlugAu(slug: string) {
  return client.fetch(
    `*[_type == "software" && slug.current == $slug && market == "au"][0] {
      _id, name, titel, slug,
      "logo": logo { "url": asset->url, alt },
      "casinos": *[_type == "bookmaker" && market == "au" && references(^._id)] | order(score desc) {
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
  if (segments.length === 1) {
    return getPageBySlugAu(segments[0])
  }
  const [parentSlug, childSlug] = segments
  return client.fetch(
    `*[_type == "page" && slug.current == $childSlug && market == "au" && parent->slug.current == $parentSlug][0] { ${PAGE_FIELDS} }`,
    { parentSlug, childSlug }
  )
}

export async function getPageByPathCa(segments: string[]) {
  if (segments.length === 1) {
    return getPageBySlugCa(segments[0])
  }
  const [parentSlug, childSlug] = segments
  return client.fetch(
    `*[_type == "page" && slug.current == $childSlug && market == "ca" && parent->slug.current == $parentSlug][0] { ${PAGE_FIELDS} }`,
    { parentSlug, childSlug }
  )
}
