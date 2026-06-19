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

  // Resolve full ancestor chain for page preview URLs
  const docId = (doc?._id as string | undefined)?.replace(/^drafts\./, '')
  const [ancestorPath, setAncestorPath] = useState('')

  useEffect(() => {
    if (props.type !== 'page' || !docId) { setAncestorPath(''); return }
    client
      .fetch<{ a1?: string; a2?: string; a3?: string; a4?: string } | null>(
        `*[_id == $id || _id == "drafts." + $id][0] {
          "a1": parent->slug.current,
          "a2": parent->parent->slug.current,
          "a3": parent->parent->parent->slug.current,
          "a4": parent->parent->parent->parent->slug.current
        }`,
        { id: docId }
      )
      .then((r) => {
        if (!r) { setAncestorPath(''); return }
        const parts = [r.a4, r.a3, r.a2, r.a1].filter(Boolean) as string[]
        setAncestorPath(parts.length > 0 ? parts.join('/') + '/' : '')
      })
      .catch(() => setAncestorPath(''))
  }, [docId, props.type, client])

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
      if (slug) url = `${BASE}${mp}/${ancestorPath}${slug}/`
      break
    case 'bookmaker':
      url = slug
        ? mp ? `${BASE}${mp}/online-casino/review/${slug}/` : `${BASE}/review/${slug}/`
        : mp ? `${BASE}${mp}/online-casino/review/` : `${BASE}/review/`
      break
    case 'bonus':
      url = slug ? `${BASE}${mp}/online-casino/bonus/${slug}/` : `${BASE}${mp}/online-casino/bonus/`
      break
    case 'paymentMethod':
      url = slug ? `${BASE}${mp}/online-casino/payment/${slug}/` : `${BASE}${mp}/online-casino/payment/`
      break
    case 'software':
      url = slug
        ? `${BASE}${mp}/online-casino/software/${slug}/`
        : `${BASE}${mp}/online-casino/software/`
      break
    case 'casinoGame':
      url = slug ? `${BASE}${mp}/casino-games/${slug}/` : `${BASE}${mp}/casino-games/`
      break
    case 'casinoGuide':
      url = slug ? `${BASE}${mp}/casino-guides/${slug}/` : `${BASE}${mp}/casino-guides/`
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
