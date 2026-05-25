import { useEffect, useState } from 'react'
import { EarthGlobeIcon } from '@sanity/icons'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'
import { useClient } from 'sanity'

const BASE = 'https://pokcas.com'

function marketPrefix(market: string | undefined): string {
  if (market === 'ca') return '/ca'
  if (market === 'au') return '/au'
  return ''
}

export const previewAction: DocumentActionComponent = (
  props: DocumentActionProps
) => {
  const doc = (props.draft ?? props.published ?? {}) as Record<string, any>
  const client = useClient({ apiVersion: '2026-04-22' })

  // Resolve parent slug via API (parent field is a raw reference in the doc)
  const parentRef = doc?.parent?._ref as string | undefined
  const [parentSlug, setParentSlug] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!parentRef) { setParentSlug(undefined); return }
    client
      .fetch<string | null>(`*[_id == $id || _id == "drafts." + $id][0].slug.current`, { id: parentRef })
      .then((s) => setParentSlug(s ?? undefined))
      .catch(() => setParentSlug(undefined))
  }, [parentRef, client])

  const slug = doc?.slug?.current as string | undefined
  const mp = marketPrefix(doc?.market)

  let url: string | null = null

  switch (props.type) {
    case 'homepage':
      url = `${BASE}/`
      break
    case 'countryHomepage':
      url = doc?.market === 'ca' ? `${BASE}/ca/` : doc?.market === 'au' ? `${BASE}/au/` : `${BASE}/`
      break
    case 'post':
      url = slug ? `${BASE}/${slug}/` : `${BASE}/`
      break
    case 'page':
      if (slug) {
        url = parentSlug
          ? `${BASE}${mp}/${parentSlug}/${slug}/`
          : `${BASE}${mp}/${slug}/`
      }
      break
    case 'bookmaker':
      url = slug
        ? mp ? `${BASE}${mp}/reviews/${slug}/` : `${BASE}/review/${slug}/`
        : `${BASE}/review/`
      break
    case 'bonus':
      url = slug ? `${BASE}/casino-bonus/${slug}/` : `${BASE}/casino-bonus/`
      break
    case 'paymentMethod':
      url = slug ? `${BASE}${mp}/payments/${slug}/` : `${BASE}${mp}/payments/`
      break
    case 'software':
      url = slug ? `${BASE}${mp}/software/${slug}/` : `${BASE}${mp}/software/`
      break
    case 'casinoGame':
      url = slug ? `${BASE}${mp}/casino-games/${slug}/` : `${BASE}${mp}/casino-games/`
      break
    default:
      url = null
  }

  if (!url) return null

  return {
    label: 'Se på sitet',
    icon: EarthGlobeIcon,
    tone: 'default' as const,
    onHandle: () => {
      window.open(url!, '_blank', 'noopener,noreferrer')
    },
  }
}
