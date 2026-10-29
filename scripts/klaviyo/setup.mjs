// Creates (or updates) the Pokcas CA/AU newsletter setup in Klaviyo:
//   lists → welcome email templates → "added to list" welcome flows,
// then writes the public ids into src/lib/newsletter.ts for the popup.
//
// Usage: node scripts/klaviyo/setup.mjs
// Needs KLAVIYO_PRIVATE_KEY in .env.local (never printed).
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { buildEmail } from './emails.mjs'

dotenv.config({ path: path.join(process.cwd(), '.env.local'), quiet: true })
const KEY = process.env.KLAVIYO_PRIVATE_KEY
if (!KEY) { console.error('Missing KLAVIYO_PRIVATE_KEY in .env.local'); process.exit(1) }

const REV = '2024-10-15'
const FLOW_REVS = ['2025-01-15', '2024-10-15.pre']

async function k(method, url, body, rev = REV) {
  const res = await fetch(`https://a.klaviyo.com/api${url}`, {
    method,
    headers: {
      Authorization: `Klaviyo-API-Key ${KEY}`,
      accept: 'application/vnd.api+json',
      'content-type': 'application/vnd.api+json',
      revision: rev,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  const json = text ? JSON.parse(text) : {}
  if (!res.ok) {
    const err = new Error(`${method} ${url} → ${res.status}: ${JSON.stringify(json.errors ?? json).slice(0, 600)}`)
    err.status = res.status
    throw err
  }
  return json
}

const MARKETS = {
  ca: { list: 'Pokcas CA – Newsletter', template: 'Pokcas CA – Welcome (no deposit)', flow: 'Pokcas CA – Welcome flow' },
  au: { list: 'Pokcas AU – Newsletter', template: 'Pokcas AU – Welcome (no deposit)', flow: 'Pokcas AU – Welcome flow' },
}

async function findByName(endpoint, name) {
  const filter = encodeURIComponent(`equals(name,"${name}")`)
  const r = await k('GET', `/${endpoint}/?filter=${filter}`)
  return r.data?.[0] ?? null
}

async function main() {
  const acct = (await k('GET', '/accounts/')).data[0]
  const companyId = acct.id
  const ci = acct.attributes.contact_information ?? {}
  const fromEmail = ci.default_sender_email
  const fromLabel = 'Pokcas'
  console.log(`Account ${companyId} · sender ${fromEmail}`)

  const out = {}
  for (const [m, names] of Object.entries(MARKETS)) {
    // 1. List
    let list = await findByName('lists', names.list)
    if (!list) list = (await k('POST', '/lists/', { data: { type: 'list', attributes: { name: names.list } } })).data
    console.log(`[${m}] list ${list.id}`)

    // 2. Template (create or update)
    const email = buildEmail(m)
    let tpl = await findByName('templates', names.template)
    if (tpl) {
      await k('PATCH', `/templates/${tpl.id}/`, { data: { type: 'template', id: tpl.id, attributes: { html: email.html } } })
    } else {
      tpl = (await k('POST', '/templates/', { data: { type: 'template', attributes: { name: names.template, editor_type: 'CODE', html: email.html } } })).data
    }
    console.log(`[${m}] template ${tpl.id}`)

    // 3. Flow (skip if one with this name exists)
    let flowId = null
    try {
      const existing = await findByName('flows', names.flow)
      if (existing) flowId = existing.id
    } catch { /* flows filter may be unsupported; fall through */ }

    if (!flowId) {
      const body = {
        data: {
          type: 'flow',
          attributes: {
            name: names.flow,
            definition: {
              triggers: [{ type: 'list', id: list.id }],
              profile_filter: null,
              entry_action_id: 'welcome_email',
              actions: [{
                temporary_id: 'welcome_email',
                type: 'send-email',
                links: { next: null },
                data: {
                  message: {
                    name: 'Welcome email',
                    from_email: fromEmail,
                    from_label: fromLabel,
                    reply_to_email: null,
                    cc_email: null,
                    bcc_email: null,
                    subject_line: email.subject,
                    preview_text: email.preview,
                    template_id: tpl.id,
                    smart_sending_enabled: false,
                    transactional: false,
                    add_tracking_params: true,
                    custom_tracking_params: null,
                    additional_filters: null,
                  },
                  status: 'draft',
                },
              }],
            },
          },
        },
      }
      let lastErr
      for (const rev of FLOW_REVS) {
        try { flowId = (await k('POST', '/flows/', body, rev)).data.id; break } catch (e) { lastErr = e }
      }
      if (!flowId) console.error(`[${m}] flow NOT created: ${lastErr?.message}`)
    }
    if (flowId) console.log(`[${m}] flow ${flowId}`)
    out[m] = { listId: list.id, templateId: tpl.id, flowId }
  }

  // 4. Write public ids into the popup config
  const cfgPath = path.join(process.cwd(), 'src/lib/newsletter.ts')
  let src = fs.readFileSync(cfgPath, 'utf8')
  src = src.replace(/export const KLAVIYO_COMPANY_ID = '[^']*'/, `export const KLAVIYO_COMPANY_ID = '${companyId}'`)
  for (const m of Object.keys(MARKETS)) {
    const re = new RegExp(`(\\n  ${m}: \\{\\n    listId: )'[^']*'`)
    src = src.replace(re, `$1'${out[m].listId}'`)
  }
  fs.writeFileSync(cfgPath, src)
  console.log('Updated src/lib/newsletter.ts')
  console.log(JSON.stringify(out, null, 1))
}

main().catch((e) => { console.error(e.message); process.exit(1) })
