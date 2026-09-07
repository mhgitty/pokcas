import { createClient } from '@sanity/client'
import { NextResponse, type NextRequest } from 'next/server'

// Fixes documents written by the Make automations that occasionally wrap their
// Portable Text output in a container object like { "p1blocks": [ ...blocks ] }.
// Such an element has no `_type`, which makes Sanity Studio show
// "missing a type name" / "missing keys". This endpoint flattens any such
// wrapper back into real body blocks. Triggered by a Sanity webhook on
// create/update, so it repairs the doc within seconds — before an editor opens it.

export const runtime = 'nodejs'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
const token = process.env.SANITY_WRITE_TOKEN

const PORTABLE_TEXT_FIELDS = ['body', 'intro']

type Block = Record<string, any>

function flatten(arr: unknown): { changed: boolean; out: Block[]; bad: number } {
  if (!Array.isArray(arr)) return { changed: false, out: [], bad: 0 }
  let changed = false
  const out: Block[] = []
  for (const el of arr as Block[]) {
    if (el && typeof el === 'object' && !el._type) {
      const wrapKey = Object.keys(el).find((k) => /blocks$/i.test(k) && Array.isArray(el[k]))
      if (wrapKey) {
        changed = true
        for (const b of el[wrapKey]) out.push(b)
        continue
      }
    }
    out.push(el)
  }
  const bad = out.filter((b) => !b?._type || !b?._key).length
  return { changed, out, bad }
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return new Response('Invalid secret', { status: 401 })
  }
  if (!token) {
    return NextResponse.json({ ok: false, error: 'SANITY_WRITE_TOKEN not set' }, { status: 500 })
  }

  let payload: any = {}
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 })
  }

  const id: string | undefined = payload?._id || payload?.documentId || payload?.ids?.[0]
  if (!id) return NextResponse.json({ ok: false, error: 'no document _id in payload' }, { status: 400 })

  // raw perspective so we can read+fix drafts as well as published docs
  const client = createClient({ projectId, dataset, apiVersion: '2026-04-22', useCdn: false, token, perspective: 'raw' })

  const doc = await client.fetch<Record<string, any> | null>(`*[_id == $id][0]`, { id })
  if (!doc) return NextResponse.json({ ok: false, error: 'document not found', id }, { status: 404 })

  const patch: Record<string, Block[]> = {}
  const report: Record<string, string> = {}
  for (const field of PORTABLE_TEXT_FIELDS) {
    const { changed, out, bad } = flatten(doc[field])
    if (changed && bad === 0) {
      patch[field] = out
      report[field] = `flattened to ${out.length} blocks`
    } else if (changed && bad > 0) {
      report[field] = `skipped — ${bad} blocks still missing _type/_key`
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: true, id, changed: false })
  }

  await client.patch(id).set(patch).commit()
  return NextResponse.json({ ok: true, id, changed: true, report })
}
