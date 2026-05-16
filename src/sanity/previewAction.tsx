import { EarthGlobeIcon } from '@sanity/icons'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

const BASE = 'https://pokcas.com'

function resolveUrl(type: string, doc: Record<string, any>): string | null {
  const slug = doc?.slug?.current as string | undefined

  switch (type) {
    case 'homepage':
      return `${BASE}/`
    case 'post':
      return slug ? `${BASE}/blog/${slug}/` : `${BASE}/blog/`
    case 'page': {
      if (!slug) return null
      const parentSlug = doc?.parent?.slug?.current as string | undefined
      return parentSlug
        ? `${BASE}/${parentSlug}/${slug}/`
        : `${BASE}/${slug}/`
    }
    case 'bookmaker':
      return slug ? `${BASE}/betting-sider/${slug}/` : `${BASE}/betting-sider/`
    case 'bonus':
      return slug ? `${BASE}/kampagner/${slug}/` : `${BASE}/kampagner/`
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
