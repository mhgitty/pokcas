import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pokcas.com'

/** Path of the Pokcas page the click came from: ?placement=… or the same-site Referer. */
function placementFrom(req: NextRequest): string | null {
  const q = req.nextUrl.searchParams.get('placement')
  if (q) return q
  const ref = req.headers.get('referer')
  if (!ref) return null
  try {
    const u = new URL(ref)
    if (!/(^|\.)pokcas\.com$/i.test(u.hostname) && u.hostname !== req.nextUrl.hostname) return null
    return u.pathname
  } catch {
    return null
  }
}

/**
 * Shared handler for /go/[code], /ca/go/[code], /au/go/[code], /uk/go/[code].
 * Looks up the redirect and forwards the click's query params (incl. `placement`,
 * the page the click came from) to the tracking destination.
 */
export async function handleGoRedirect(req: NextRequest, code: string, market: 'global' | 'ca' | 'au' | 'uk') {
  const marketFilter = market === 'global' ? '(market == "global" || !defined(market))' : `market == "${market}"`
  const redirect = await client.fetch<{ destination: string; active: boolean } | null>(
    `*[_type == "redirect" && code.current == $code && ${marketFilter}][0] { destination, active }`,
    { code },
    { next: { revalidate: 60 } }
  )

  if (!redirect || !redirect.active || !redirect.destination) {
    return NextResponse.redirect(new URL(market === 'global' ? '/' : `/${market}/`, SITE), 302)
  }

  let target: URL
  try {
    target = new URL(redirect.destination)
  } catch {
    return NextResponse.redirect(redirect.destination, 302)
  }

  // Pass through incoming params (e.g. placement, sub ids) without overwriting
  // anything already set on the destination.
  req.nextUrl.searchParams.forEach((value, key) => {
    if (!target.searchParams.has(key)) target.searchParams.set(key, value)
  })
  const placement = placementFrom(req)
  if (placement && !target.searchParams.has('placement')) target.searchParams.set('placement', placement)

  const res = NextResponse.redirect(target.toString(), 302)
  res.headers.set('Cache-Control', 'no-store')
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return res
}
