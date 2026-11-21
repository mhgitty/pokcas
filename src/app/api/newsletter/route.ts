import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Inboxroad contact lists (Contacts API v2). Env: INBOXROAD_API_KEY (server only).
const LISTS: Record<string, string> = {
  ca: 'f6c24cf8-21d0-46dd-bed2-5fadd04151ff', // Pokcas CA
  au: 'e5586f44-797a-4830-9b4c-ee0a0d842bea', // Pokcas AU
  uk: '04fda523-6b02-4f28-896e-700b08aba4c6', // Pokcas UK
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: Request) {
  const key = process.env.INBOXROAD_API_KEY?.trim()
  if (!key) {
    console.error('[newsletter] INBOXROAD_API_KEY missing')
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 500 })
  }

  // Only accept submissions from our own pages
  const origin = req.headers.get('origin') || ''
  if (origin && !/^https?:\/\/(www\.)?pokcas\.com$|^https?:\/\/localhost(:\d+)?$|\.vercel\.app$/i.test(origin)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 }) }

  // Honeypot: bots fill hidden fields
  if (body?.website) return NextResponse.json({ ok: true })

  const email = String(body?.email || '').trim().toLowerCase()
  const market = String(body?.market || '')
  const listId = LISTS[market]
  if (!listId || !EMAIL_RE.test(email) || email.length > 150 || body?.consent !== true) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 422 })
  }

  const res = await fetch(`https://webapi.inboxroad.com/api/v2/contacts-lists/${listId}/contacts/`, {
    method: 'POST',
    headers: { 'X-API-Key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, status: 'subscribed' }),
    cache: 'no-store',
  })

  if (res.ok) return NextResponse.json({ ok: true })

  const text = await res.text().catch(() => '')
  // Already on the list → treat as success for the visitor
  if (res.status === 400 && /exist/i.test(text)) return NextResponse.json({ ok: true, existing: true })

  console.error(`[newsletter] Inboxroad ${res.status}: ${text.slice(0, 300)}`)
  return NextResponse.json({ ok: false, error: 'upstream' }, { status: 502 })
}
