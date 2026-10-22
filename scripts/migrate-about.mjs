/**
 * Restructure the global About page body into the new visual blocks
 * (stats strip, timeline, step cards, feature cards, team card, contact card).
 *
 * Safe by default:
 *  - Backs up the current published document to scripts/backups/ first.
 *  - Refuses to run if an unpublished draft already exists (won't clobber
 *    in-progress edits) — pass --force to override.
 *  - Verifies every block it expects is still present; aborts otherwise.
 *  - Writes the result as a DRAFT so you can review and Publish in Studio.
 *    Pass --publish to write straight to the live document instead.
 *
 * Usage:   node scripts/migrate-about.mjs            (draft)
 *          node scripts/migrate-about.mjs --publish  (live)
 */
import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { randomBytes } from 'crypto'
import { mkdirSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env.local') })

const FORCE = process.argv.includes('--force')
const PUBLISH = process.argv.includes('--publish')

const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN
if (!token) {
  console.error('✖ No SANITY_WRITE_TOKEN (or SANITY_API_TOKEN) found in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a23xp5s4',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token,
  apiVersion: '2026-04-22',
  useCdn: false,
  perspective: 'raw',
})

const ID = '7d87ccbe-213b-4164-9444-d8d777eb6b18'
const DRAFT_ID = `drafts.${ID}`

const k = () => randomBytes(6).toString('hex')
const txt = (b) => (b?.children || []).map((c) => c.text || '').join('').trim()
const splitTitle = (s) => {
  const i = s.indexOf('. ')
  return i > 0 ? { title: s.slice(0, i).trim(), text: s.slice(i + 2).trim() } : { title: s.trim(), text: '' }
}

// Block keys this migration relies on (from the current About page).
const KEYS = {
  firstH2: '6e48725346ff',
  story: ['b823cf71da64', '318fd0686c51', '90100b29e93f'],
  richieH3: 'bbc7a1501113',
  richieP: ['0a77a0e877b3', '1129bf44f7de'],
  stepsLead: '5032ff1bbd05',
  steps: ['a4fb4b7a12f3', 'b7cae89fe4ac', '32cf94e1c956', '5af0543a18d2', '5a1834b124f8', '3665003d4803', '1d6d4dc4ab01'],
  principles: ['f98a274cd2dd', '3b43c229331b', '7fffcc347c14', 'b4b3cb9559dc'],
  quotes: ['6c3ce1db7781', '9c360779fa41'],
  licenceLead: 'ebdc10fb3533',
  licence: ['c78962e1e8ca', 'eb3a9a0a173c', '38ff0a49c388', 'a27d44799624', '0a57c323dc18'],
  regTable: '39fa2f515040',
  rgLead: 'db19ab63f614',
  rg: ['fbd7a5f422ea', 'bdfdc619d1bd', '54bfcf670221', '4250dd5ab475', 'dbb2e9d8145d'],
  contactText: '3e1ba24dc765',
  contactEmail: 'c1b86a255f2c',
  socialH3: '5f3aeb673557',
  socialText: 'de52566faa55',
  socialTable: '27705fb74c75',
}

async function main() {
  const [published, draft, socials, richie] = await Promise.all([
    client.getDocument(ID),
    client.getDocument(DRAFT_ID),
    client.fetch(`*[_type == "siteSettings"][0].socialLinks`),
    client.fetch(`*[_type == "author" && slug.current == "richie-west"][0]._id`),
  ])

  if (!published) { console.error(`✖ About page ${ID} not found`); process.exit(1) }
  if (draft && !FORCE) {
    console.error('✖ An unpublished draft of the About page exists. Publish or discard it in Studio first,')
    console.error('  or re-run with --force to overwrite that draft.')
    process.exit(1)
  }

  const body = published.body || []
  const byKey = Object.fromEntries(body.map((b) => [b._key, b]))
  const needed = Object.values(KEYS).flat()
  const missing = needed.filter((key) => !byKey[key])
  if (missing.length) {
    console.error('✖ The About page has changed since this migration was written. Missing blocks:', missing.join(', '))
    process.exit(1)
  }

  // ── Backup ──────────────────────────────────────────────────────────────
  const dir = join(__dirname, 'backups')
  mkdirSync(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = join(dir, `about-${stamp}.json`)
  writeFileSync(backupFile, JSON.stringify(published, null, 2))
  console.log('✔ Backup saved:', backupFile)

  // ── New blocks ──────────────────────────────────────────────────────────
  const stats = {
    _type: 'statsBlock', _key: k(),
    items: [
      { _key: k(), value: '2017', label: 'Founded as a poker site' },
      { _key: k(), value: '5', label: 'People on the team' },
      { _key: k(), value: '3', label: 'Core markets: CA, UK & AU' },
      { _key: k(), value: '7', label: 'Review categories per casino' },
    ],
  }

  const storySentences = txt(byKey[KEYS.story[0]]).split(/(?<=\.)\s+/)
  const timeline = {
    _type: 'timelineBlock', _key: k(),
    items: [
      {
        _key: k(), label: '2017', title: 'It started with poker',
        text: storySentences.length >= 3 ? storySentences.slice(0, 2).join(' ') : txt(byKey[KEYS.story[0]]),
        linkLabel: 'Our poker hands guide', href: '/poker-hands/',
      },
      {
        _key: k(), label: 'The shift', title: 'From the tables to online casinos',
        text: [storySentences.length >= 3 ? storySentences.slice(2).join(' ') : '', txt(byKey[KEYS.story[1]])].filter(Boolean).join(' '),
      },
      { _key: k(), label: 'Today', title: 'Canada, the UK, Australia and beyond', text: txt(byKey[KEYS.story[2]]) },
    ],
  }

  const richieHeading = txt(byKey[KEYS.richieH3])
  const richieRole = richieHeading.includes('–') ? richieHeading.split('–').slice(1).join('–').trim() : undefined
  const team = richie ? {
    _type: 'teamBlock', _key: k(),
    members: [{
      _key: k(), _type: 'teamMember',
      author: { _type: 'reference', _ref: richie },
      role: richieRole,
      blurb: KEYS.richieP.map((key) => txt(byKey[key])).join(' '),
    }],
  } : null

  const steps = {
    _type: 'stepCardsBlock', _key: k(), title: 'Our 7-step casino review process', columns: 2,
    items: KEYS.steps.map((key) => ({ _key: k(), ...splitTitle(txt(byKey[key])) })),
  }

  const principleIcons = ['⚖️', '🗣️', '🔎', '💬']
  const principles = {
    _type: 'featureCardsBlock', _key: k(), columns: 2,
    items: KEYS.principles.map((key, i) => ({ _key: k(), icon: principleIcons[i], ...splitTitle(txt(byKey[key])) })),
  }

  const licence = {
    _type: 'stepCardsBlock', _key: k(), columns: 1,
    title: txt(byKey[KEYS.licenceLead]).replace(/\.$/, ''),
    items: KEYS.licence.map((key) => ({ _key: k(), ...splitTitle(txt(byKey[key])) })),
  }

  const markets = {
    _type: 'featureCardsBlock', _key: k(), columns: 3,
    items: [
      {
        _key: k(), icon: '🇬🇧', eyebrow: 'UK Gambling Commission (UKGC)', title: 'United Kingdom', href: '/uk/',
        text: 'Operators serving consumers in Great Britain must hold the appropriate UKGC licence. Online gambling is restricted to adults aged 18 or older.',
      },
      {
        _key: k(), icon: '🇨🇦', eyebrow: 'Provincial regulators · AGCO (Ontario)', title: 'Canada', href: '/ca/',
        text: "Ontario's regulated private iGaming market requires AGCO registration and an agreement with iGaming Ontario. The minimum age is 19 in Ontario. Rules differ across provinces.",
      },
      {
        _key: k(), icon: '🇦🇺', eyebrow: 'ACMA + state & territory regulators', title: 'Australia', href: '/au/',
        text: 'The Interactive Gambling Act 2001 prohibits operators from offering online casino games to people in Australia, even when the operator holds an overseas gambling licence.',
      },
    ],
  }

  const rgIcons = ['🛑', '⏸️', '🆔', '📊', '🤝']
  const rg = {
    _type: 'featureCardsBlock', _key: k(), columns: 3,
    title: txt(byKey[KEYS.rgLead]).replace(/\s*include:?$/i, '').replace(/:$/, ''),
    items: KEYS.rg.map((key, i) => ({ _key: k(), icon: rgIcons[i], ...splitTitle(txt(byKey[key])) })),
  }

  const email = (txt(byKey[KEYS.contactEmail]).match(/[\w.+-]+@[\w.-]+\.\w+/) || ['hello@pokcas.com'])[0]
  const s = socials || {}
  const contact = {
    _type: 'contactCardBlock', _key: k(),
    title: 'Talk to the Pokcas team',
    text: [txt(byKey[KEYS.contactText]), txt(byKey[KEYS.socialText])].filter(Boolean).join('\n\n'),
    email,
    links: [
      ['LinkedIn', s.linkedin || 'https://www.linkedin.com/company/pokcas/'],
      ['Facebook', s.facebook || 'https://www.facebook.com/profile.php?id=61591520909597'],
      ['X (Twitter)', s.x || 'https://x.com/pokcas/'],
      ['Instagram', s.instagram || 'https://www.instagram.com/pokcasdotcom/'],
      ['YouTube', s.youtube || 'https://www.youtube.com/channel/UCHDCW6WX-ei3hgOGnQS6_Kw'],
    ].map(([label, url]) => ({ _key: k(), _type: 'contactLink', label, url })),
  }

  // ── Plan: insert / replace / remove / restyle ───────────────────────────
  const insertBefore = { [KEYS.firstH2]: [stats] }
  const replace = {
    [KEYS.story[0]]: [timeline],
    [KEYS.richieH3]: team ? [team] : [byKey[KEYS.richieH3]],
    [KEYS.stepsLead]: [steps],
    [KEYS.principles[0]]: [principles],
    [KEYS.licenceLead]: [licence],
    [KEYS.regTable]: [markets],
    [KEYS.rgLead]: [rg],
    [KEYS.contactText]: [contact],
  }
  const remove = new Set([
    ...KEYS.story.slice(1),
    ...(team ? KEYS.richieP : []),
    ...KEYS.steps,
    ...KEYS.principles.slice(1),
    ...KEYS.licence,
    ...KEYS.rg,
    KEYS.contactEmail, KEYS.socialH3, KEYS.socialText, KEYS.socialTable,
  ])
  const restyle = new Set(KEYS.quotes)

  const newBody = []
  for (const b of body) {
    if (insertBefore[b._key]) newBody.push(...insertBefore[b._key])
    if (replace[b._key]) { newBody.push(...replace[b._key]); continue }
    if (remove.has(b._key)) continue
    newBody.push(restyle.has(b._key) ? { ...b, style: 'blockquote' } : b)
  }

  // ── Write ───────────────────────────────────────────────────────────────
  const { _rev, _updatedAt, _createdAt, ...rest } = published
  const targetId = PUBLISH ? ID : DRAFT_ID
  await client.createOrReplace({ ...rest, _id: targetId, body: newBody })

  console.log(`✔ Wrote ${newBody.length} blocks (was ${body.length}) to ${PUBLISH ? 'the LIVE document' : 'a draft'} (${targetId})`)
  console.log(PUBLISH
    ? '  The About page is updated — revalidation will pick it up shortly.'
    : '  Open the About page in Studio, review it with Preview, then click Publish.')
  if (!team) console.log('  ⚠ Richie West author not found — kept the original team section.')
}

main().catch((err) => { console.error('✖ Migration failed:', err.message); process.exit(1) })
