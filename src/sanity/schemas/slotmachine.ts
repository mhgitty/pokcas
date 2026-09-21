import { defineField, defineType } from 'sanity'
import { bodyField, relatedPagesFields, slugUniquePerMarket } from './page'

export const slotmachineType = defineType({
  name: 'slotmachine',
  title: 'Slot Machines',
  type: 'document',
  __experimental_search: [
    { weight: 10, path: 'name' },
    { weight: 8, path: 'titel' },
    { weight: 6, path: 'slug.current' },
    { weight: 3, path: 'metaTitle' },
    { weight: 0, path: 'body' },
    { weight: 0, path: 'intro' },
  ],
  groups: [
    { name: 'general', title: '⚙️ General' },
    { name: 'specs',   title: '🎰 Specs' },
    { name: 'content', title: '📝 Content' },
    { name: 'seo',     title: '🔍 SEO' },
  ],
  fields: [
    // ── General ────────────────────────────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'general',
      description: 'The slot name, e.g. "Book of Dead"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'titel',
      title: 'H1',
      type: 'string',
      group: 'general',
      description: 'Displayed as the H1 on the page. Falls back to Name if empty.',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'general',
      options: { source: 'name', isUnique: slugUniquePerMarket('slotmachine') },
      description: 'Used in URL: /online-slots/free/[slug]. The same slug can exist once per market.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'market',
      title: 'Market',
      type: 'string',
      group: 'general',
      options: {
        list: [
          { title: '🌍 Global', value: 'global' },
          { title: '🇨🇦 Canada', value: 'ca' },
          { title: '🇦🇺 Australia', value: 'au' },
        ],
        layout: 'radio',
      },
      initialValue: 'global',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo / thumbnail',
      type: 'image',
      group: 'general',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'ogImage',
      title: 'OG Image',
      type: 'image',
      group: 'general',
      description: 'Used for social sharing previews.',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'casinos',
      title: 'Where to play (casinos)',
      type: 'array',
      group: 'general',
      description: 'Casinos where players can play this slot.',
      of: [{ type: 'reference', to: [{ type: 'bookmaker' }] }],
    }),

    // ── Specs ──────────────────────────────────────────────────────────────────
    defineField({
      name: 'provider', title: 'Provider', type: 'reference', group: 'specs',
      to: [{ type: 'software' }],
      description: 'The game studio — select from your software providers.',
    }),
    defineField({ name: 'rtp', title: 'RTP', type: 'string', group: 'specs', description: 'e.g. "96.21%"' }),
    defineField({
      name: 'volatility', title: 'Volatility', type: 'string', group: 'specs',
      options: {
        list: [
          { title: 'Low', value: 'Low' },
          { title: 'Medium-Low', value: 'Medium-Low' },
          { title: 'Medium', value: 'Medium' },
          { title: 'Medium-High', value: 'Medium-High' },
          { title: 'High', value: 'High' },
        ],
      },
    }),
    defineField({ name: 'maxWin', title: 'Max win', type: 'string', group: 'specs', description: 'e.g. "5,000x" or "$250,000"' }),
    defineField({ name: 'grid', title: 'Grid', type: 'string', group: 'specs', description: 'e.g. "5x3"' }),
    defineField({ name: 'paylines', title: 'Paylines', type: 'string', group: 'specs', description: 'e.g. "20" or "243 ways"' }),
    defineField({ name: 'mechanic', title: 'Mechanic', type: 'string', group: 'specs', description: 'e.g. "Cluster pays", "Megaways"' }),
    defineField({ name: 'theme', title: 'Theme', type: 'string', group: 'specs', description: 'e.g. "Ancient Egypt"' }),
    defineField({
      name: 'features', title: 'Features', type: 'array', group: 'specs',
      of: [{ type: 'string' }], options: { layout: 'tags' },
      description: 'e.g. Free Spins, Wilds, Multipliers',
    }),
    defineField({ name: 'minBetPerSpin', title: 'Min bet per spin', type: 'string', group: 'specs', description: 'e.g. "$0.10"' }),
    defineField({ name: 'maxBetPerSpin', title: 'Max bet per spin', type: 'string', group: 'specs', description: 'e.g. "$100"' }),
    defineField({ name: 'hasBonusBuy', title: 'Has bonus buy', type: 'boolean', group: 'specs', initialValue: false }),
    defineField({ name: 'hasJackpot', title: 'Has jackpot', type: 'boolean', group: 'specs', initialValue: false }),
    defineField({ name: 'hitFrequencyPercent', title: 'Hit frequency (%)', type: 'string', group: 'specs', description: 'e.g. "24%"' }),
    defineField({ name: 'releaseYear', title: 'Release year', type: 'number', group: 'specs', validation: (r) => r.min(1990).max(2100) }),

    // ── Content ────────────────────────────────────────────────────────────────
    { ...bodyField, title: 'Intro', name: 'intro', group: 'content' } as any,
    { ...bodyField, group: 'content' } as any,
    ...relatedPagesFields.map((f) => ({ ...f, group: 'content' })),

    // ── SEO ────────────────────────────────────────────────────────────────────
    defineField({ name: 'metaTitle', title: 'Meta Title', type: 'string', group: 'seo', description: 'SEO title tag. Max 60 characters.' }),
    defineField({ name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 3, group: 'seo', description: 'SEO meta description. 140–155 characters.' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'provider.name', market: 'market', media: 'logo' },
    prepare({ title, subtitle, market, media }: any) {
      const flag = market === 'ca' ? '🇨🇦' : market === 'au' ? '🇦🇺' : '🌍'
      return { title, subtitle: `${flag}${subtitle ? ' · ' + subtitle : ''}`, media }
    },
  },
})
