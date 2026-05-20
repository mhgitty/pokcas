import { defineField, defineType } from 'sanity'
import { TableBlockInput } from '../components/TableBlockInput'
import { comparisonTableFields } from './comparisonTable'

export const bodyField = defineField({
  name: 'body',
  title: 'Indhold',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Citat', value: 'blockquote' },
      ],
      marks: {
        decorators: [
          { title: 'Fed', value: 'strong' },
          { title: 'Kursiv', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              { name: 'href', type: 'url', title: 'URL' },
              { name: 'blank', type: 'boolean', title: 'Åbn i nyt vindue' },
            ],
          },
        ],
      },
    },
    { type: 'image', options: { hotspot: true } },
    {
      type: 'object',
      name: 'calloutBlock',
      title: 'Info / Tip boks',
      fields: [
        {
          name: 'variant', title: 'Type', type: 'string',
          options: {
            list: [
              { title: 'ℹ️ Info', value: 'info' },
              { title: '💡 Tip', value: 'tip' },
              { title: '⚠️ Advarsel', value: 'warning' },
            ],
            layout: 'radio', direction: 'horizontal',
          },
          initialValue: 'info',
        },
        { name: 'title', title: 'Overskrift', type: 'string' },
        { name: 'body', title: 'Indhold', type: 'text', rows: 4 },
      ],
      preview: {
        select: { title: 'title', variant: 'variant' },
        prepare({ title, variant }: any) {
          const icons: Record<string, string> = { info: 'ℹ️', tip: '💡', warning: '⚠️' }
          return { title: title || 'Callout', subtitle: `${icons[variant] || 'ℹ️'} ${variant || 'info'}` }
        },
      },
    },
    {
      type: 'object',
      name: 'faqBlock',
      title: 'FAQ',
      fields: [
        { name: 'title', title: 'Overskrift', type: 'string', initialValue: 'Ofte stillede spørgsmål' },
        {
          name: 'items', title: 'Spørgsmål & svar', type: 'array',
          of: [{
            type: 'object', name: 'faqItem',
            fields: [
              { name: 'question', title: 'Spørgsmål', type: 'string' },
              { name: 'answer', title: 'Svar', type: 'text', rows: 3 },
            ],
            preview: { select: { title: 'question', subtitle: 'answer' } },
          }],
        },
      ],
      preview: {
        select: { title: 'title', items: 'items' },
        prepare({ title, items }: any) {
          return { title: title || 'FAQ', subtitle: `${(items || []).length} spørgsmål` }
        },
      },
    },
    {
      type: 'object',
      name: 'prosConsBlock',
      title: 'Fordele & Ulemper',
      fields: [
        { name: 'title', title: 'Overskrift (valgfri)', type: 'string' },
        { name: 'pros', title: 'Fordele ✅', type: 'array', of: [{ type: 'string' }] },
        { name: 'cons', title: 'Ulemper ❌', type: 'array', of: [{ type: 'string' }] },
      ],
      preview: {
        select: { title: 'title', pros: 'pros', cons: 'cons' },
        prepare({ title, pros, cons }: any) {
          return { title: title || 'Fordele & Ulemper', subtitle: `✅ ${(pros || []).length}  ❌ ${(cons || []).length}` }
        },
      },
    },
    {
      type: 'object',
      name: 'latestPostsBlock',
      title: 'Seneste artikler',
      fields: [
        { name: 'title', title: 'Overskrift', type: 'string', initialValue: 'Seneste guides & artikler' },
        {
          name: 'count', title: 'Antal artikler', type: 'number',
          options: { list: [2, 3, 4, 6], layout: 'radio', direction: 'horizontal' },
          initialValue: 4,
        },
        { name: 'showViewAll', title: 'Vis "Se alle" link', type: 'boolean', initialValue: true },
      ],
      preview: {
        select: { title: 'title', count: 'count' },
        prepare({ title, count }: any) {
          return { title: title || 'Seneste artikler', subtitle: `${count || 4} artikler` }
        },
      },
    },
    {
      type: 'object',
      name: 'ctaButton',
      title: 'CTA Knap',
      fields: [
        { name: 'text', title: 'Knaptekst', type: 'string' },
        { name: 'url',  title: 'URL',       type: 'url' },
      ],
      preview: {
        select: { title: 'text', subtitle: 'url' },
        prepare({ title, subtitle }: any) {
          return { title: title || 'CTA Knap', subtitle: subtitle || '' }
        },
      },
    },
    // ── Casino kort (bookmaker) ──────────────────────────────────────────────
    {
      type: 'object',
      name: 'casinoKortBlock',
      title: '🎰 Casino kort',
      fields: [
        {
          name: 'bookmaker',
          title: 'Vælg bookmaker',
          type: 'reference',
          to: [{ type: 'bookmaker' }],
        },
        { name: 'customTitle', title: 'Titel', type: 'string' },
        { name: 'image', title: 'Billede', type: 'image', options: { hotspot: true } },
        {
          name: 'customBody',
          title: 'Brødtekst',
          type: 'array',
          of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], lists: [{ title: 'Punktliste', value: 'bullet' }, { title: 'Nummerliste', value: 'number' }], marks: { decorators: [{ title: 'Fed', value: 'strong' }, { title: 'Kursiv', value: 'em' }] } }],
        },
        { name: 'pros', title: '✅ Fordele', type: 'array', of: [{ type: 'string' }] },
        { name: 'cons', title: '❌ Ulemper', type: 'array', of: [{ type: 'string' }] },
      ],
      preview: {
        select: { customTitle: 'customTitle', name: 'bookmaker.name', logo: 'bookmaker.logo' },
        prepare({ customTitle, name, logo }: any) {
          return { title: customTitle || name || 'Casino kort', subtitle: name, media: logo }
        },
      },
    },
    // ── Bonus kort ───────────────────────────────────────────────────────────
    {
      type: 'object',
      name: 'bonusKortBlock',
      title: '🎁 Bonus kort',
      fields: [
        {
          name: 'bonus',
          title: 'Vælg bonus',
          type: 'reference',
          to: [{ type: 'bonus' }],
        },
        { name: 'customTitle', title: 'Titel', type: 'string' },
        { name: 'image', title: 'Billede', type: 'image', options: { hotspot: true } },
        {
          name: 'customBody',
          title: 'Brødtekst',
          type: 'array',
          of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], lists: [{ title: 'Punktliste', value: 'bullet' }, { title: 'Nummerliste', value: 'number' }], marks: { decorators: [{ title: 'Fed', value: 'strong' }, { title: 'Kursiv', value: 'em' }] } }],
        },
      ],
      preview: {
        select: { customTitle: 'customTitle', bonusTitle: 'bonus.title', bmName: 'bonus.bookmaker.name', logo: 'bonus.casinoLogo' },
        prepare({ customTitle, bonusTitle, bmName, logo }: any) {
          return { title: customTitle || bmName || bonusTitle || 'Bonus kort', subtitle: bonusTitle, media: logo }
        },
      },
    },
    {
      type: 'object',
      name: 'tableBlock',
      title: 'Tabel',
      components: { input: TableBlockInput },
      fields: [
        { name: 'title', title: 'Overskrift (valgfri)', type: 'string' },
        {
          name: 'headers',
          title: 'Kolonneoverskrifter',
          type: 'array',
          of: [{ type: 'string' }],
        },
        {
          name: 'rows',
          title: 'Rækker',
          type: 'array',
          of: [{
            type: 'object',
            name: 'tableRow',
            title: 'Række',
            fields: [{ name: 'cells', title: 'Celler', type: 'array', of: [{ type: 'string' }] }],
            preview: {
              select: { cells: 'cells' },
              prepare({ cells }: any) { return { title: (cells || []).join(' | ') || '(tom række)' } },
            },
          }],
        },
      ],
      preview: {
        select: { title: 'title', headers: 'headers', rows: 'rows' },
        prepare({ title, headers, rows }: any) {
          return { title: title || 'Tabel', subtitle: `${(headers || []).length} kolonner · ${(rows || []).length} rækker` }
        },
      },
    {
      type: 'object',
      name: 'howToBlock',
      title: '🔢 How-to',
      fields: [
        {
          name: 'title',
          title: 'Section title',
          type: 'string',
          initialValue: 'How It Works',
        },
        {
          name: 'items',
          title: 'Steps',
          type: 'array',
          of: [{
            type: 'object',
            name: 'howToItem',
            title: 'Step',
            fields: [
              { name: 'title', title: 'Step title', type: 'string' },
              { name: 'body',  title: 'Body text',  type: 'text', rows: 3 },
            ],
            preview: {
              select: { title: 'title', subtitle: 'body' },
            },
          }],
        },
      ],
      preview: {
        select: { title: 'title', items: 'items' },
        prepare({ title, items }: any) {
          return { title: title || 'How-to', subtitle: `${(items || []).length} steps` }
        },
      },
    },
  ],
})

export const pageType = defineType({
  name: 'page',
  title: 'Sider',
  type: 'document',
  groups: [
    { name: 'content', title: 'Indhold' },
    { name: 'seo',     title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', group: 'content', validation: (r) => r.required() }),
    defineField({ name: 'slug',  title: 'Slug',  type: 'slug',   group: 'content', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({
      name: 'parent',
      title: 'Forældreside',
      type: 'reference',
      to: [{ type: 'page' }],
      group: 'content',
      options: { disableNew: true },
      description: 'Valgfri — genererer URL som /forælder/denne-side og tilføjer brødkrumme',
    }),
    defineField({ name: 'intro', title: 'Intro', type: 'text',   rows: 3, group: 'content' }),
    ...comparisonTableFields.map(f => ({ ...f, group: 'content' })) as any,
    { ...bodyField, group: 'content' } as any,
    defineField({
      name: 'author',
      title: 'Forfatter',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'content',
      description: 'Vises i hero og som forfatter-kort nederst på siden',
    }),
    defineField({
      name: 'factChecker',
      title: 'Faktatjekker',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'content',
      description: 'Vises ved siden af forfatteren i hero-sektionen',
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Sidst opdateret',
      type: 'date',
      group: 'content',
      description: 'Vises under forfatternavn i hero',
    }),
    defineField({ name: 'metaTitle', title: 'Meta titel', type: 'string', group: 'seo' }),
    defineField({ name: 'metaDescription', title: 'Meta beskrivelse', type: 'text', rows: 3, group: 'seo' }),
    defineField({
      name: 'featuredImage', title: 'OG-billede', type: 'image', group: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' })],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
  },
})
