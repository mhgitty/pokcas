import { EarthGlobeIcon } from '@sanity/icons'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

const BASE = 'https://pokcas.com'

function marketPrefix(doc: Record<string, any>): string {
  const market = doc?.market as string | undefined
  if (market === 'ca') return '/ca'
  if (market === 'au') return '/au'
  return ''
}

function resolveUrl(type: string, doc: Record<string, any>): string | null {
  const slug = doc?.slug?.current as string | undefined
  const mp = marketPrefix(doc)

  switch (type) {
    case 'homepage':
      return `${BASE}/`
    case 'countryHomepage':
      return doc?.market === 'ca' ? `${BASE}/ca/` : doc?.market === 'au' ? `${BASE}/au/` : `${BASE}/`
    case 'post':
      return slug ? `${BASE}/${slug}/` : `${BASE}/`
    case 'page': {
      if (!slug) return null
      const parentSlug = doc?.parent?.slug?.current as string | undefined
      return parentSlug
        ? `${BASE}${mp}/${parentSlug}/${slug}/`
        : `${BASE}${mp}/${slug}/`
    }
    case 'bookmaker':
      return slug
        ? mp ? `${BASE}${mp}/reviews/${slug}/` : `${BASE}/review/${slug}/`
        : `${BASE}/review/`
    case 'bonus':
      return slug ? `${BASE}/casino-bonus/${slug}/` : `${BASE}/casino-bonus/`
    case 'paymentMethod':
      return slug ? `${BASE}${mp}/payments/${slug}/` : `${BASE}${mp}/payments/`
    case 'software':
      return slug ? `${BASE}${mp}/software/${slug}/` : `${BASE}${mp}/software/`
    case 'ligaStillinger':
      return slug ? `${BASE}/fodbold/stillinger/${slug}/` : `${BASE}/fodbold/stillinger/`
    default:
      return null
  }
}

export const previewAction: DocumentActionComponent = (
  props: DocumentActionProps
) => {
  const doc = props.draft ?? props.published ?? {}
  const url = resolveUrl(props.type, doc as Record<string, any>)

  if (!url) return null

  return {
    label: 'Se på sitet',
    icon: EarthGlobeIcon,
    tone: 'default' as const,
    onHandle: () => {
      window.open(url, '_blank', 'noopener,noreferrer')
    },
  }
}
