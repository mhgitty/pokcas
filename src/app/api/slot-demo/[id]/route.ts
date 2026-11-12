import { createHmac } from 'crypto'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// SlotsLaunch demos: a signed iframe URL for the game, made fresh for every visitor (signed links expire).
// The API secret stays on the server. Env: SLOTSLAUNCH_API_KEY, SLOTSLAUNCH_API_SECRET and optionally
// SLOTSLAUNCH_DOMAIN (the domain registered with SlotsLaunch, without www; default: this site's host).
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'Unknown game' }, { status: 400 })
  const key = process.env.SLOTSLAUNCH_API_KEY
  const secret = process.env.SLOTSLAUNCH_API_SECRET
  const domain = (process.env.SLOTSLAUNCH_DOMAIN || req.headers.get('x-forwarded-host') || req.headers.get('host') || '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[:/].*$/, '')
  let url = `https://slotslaunch.com/iframe/${id}`
  if (key && secret) {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const sig = createHmac('sha256', secret).update(`${id}\n${exp}\n${domain}`).digest('hex')
    url += `?token=${encodeURIComponent(key)}&exp=${exp}&sig=${sig}`
  } else if (key) {
    url += `?token=${encodeURIComponent(key)}`
  }
  return NextResponse.json({ url }, { headers: { 'cache-control': 'no-store' } })
}
