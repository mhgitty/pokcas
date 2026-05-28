import { defineField, defineType } from 'sanity'
import { bodyField, introField } from './page'

// ── Reusable inline section types ────────────────────────────────────────────

const sectionCasinoList = {
  type: 'object' as const,
  name: 'sectionCasinoList',
  title: '🎰 Casino List',
  fields: [
    defineField({ name: 'title', title: 'Section title', type: 'string', initialValue: 'Top Rated Casinos' }),
    defineField({ name: 'count', title: 'Number of casinos to show', type: 'number', initialValue: 5,
      validation: (r: any) => r.min(1).max(20) }),
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }: any) => ({ title: `🎰 ${title || 'Casino List'}` }) },
}

const sectionPaymentMethods = {
  type: 'object' as const,
  name: 'sectionPaymentMethods',
  title: '💳 Payment Methods Grid',
  fields: [
    defineField({ name: 'title', title: 'Section title', type: 'string', initialValue: 'Payment Methods' }),
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }: any) => ({ title: `💳 ${title || 'Payment Methods'}` }) },
}

const sectionSoftware = {
  type: 'object' as const,
  name: 'sectionSoftware',
  title: '🎮 Software Providers Grid',
  fields: [
    defineField({ name: 'title', title: 'Section title', type: 'string', initialValue: 'Software Providers' }),
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }: any) => ({ title: `🎮 ${title || 'Software Providers'}` }) },
}

const sectionCtaBanner = {
  type: 'object' as const,
  name: 'sectionCtaBanner',
  title: '📢 CTA Banner',
  fields: [
    defineField({ name: 'icon', title: 'Solar icon name (e.g. shield-check)', type: 'string' }),
    defineField({ name: 'title', title: 'Heading', type: 'string', validation: (r: any) => r.required() }),
    defineField({ name: 'body', title: 'Body text', type: 'text', rows: 3 }),
    defineField({ name: 'buttonLabel', title: 'Button label', type: 'string' }),
    defineField({ name: 'buttonUrl', title: 'Button URL', type: 'string' }),
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      initialValue: 'green',
      options: { list: [
        { title: 'Green', value: 'green' },
        { title: 'Dark', value: 'dark' },
        { title: 'Purple gradient', value: 'purple' },
        { title: 'Light', value: 'light' },
      ], layout: 'radio' },
    }),
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }: any) => ({ title: `📢 ${title || 'CTA Banner'}` }) },
}

const sectionHighlights = {
  type: 'object' as const,
  name: 'sectionHighlights',
  title: '✨ Highlight Cards',
  fields: [
    defineField({ name: 'title', title: 'Section title', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro text', type: 'text', rows: 2 }),
    defineField({
      name: 'items',
      title: 'Highlight cards',
      type: 'array',
      of: [{
        type: 'object',
        name: 'highlightItem',
        fields: [
          defineField({ name: 'title', title: 'Card title', type: 'string', validation: (r: any) => r.required() }),
          defineField({ name: 'bullets', title: 'Bullet points', type: 'array', of: [{ type: 'string' }] }),
        ],
        preview: { select: { title: 'title' }, prepare: ({ title }: any) => ({ title }) },
      }],
      validation: (r: any) => r.max(4),
    }),
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }: any) => ({ title: `✨ ${title || 'Highlights'}` }) },
}

const sectionGameTypes = {
  type: 'object' as const,
  name: 'sectionGameTypes',
  title: '🃏 Game Types Grid',
  fields: [
    defineField({ name: 'title', title: 'Section title', type: 'string' }),
    defineField({
      name: 'items',
      title: 'Game types',
      type: 'array',
      of: [{
        type: 'object',
        name: 'gameTypeItem',
        fields: [
          defineField({ name: 'title', title: 'Game title', type: 'string', validation: (r: any) => r.required() }),
          defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
          defineField({ name: 'icon', title: 'Solar icon name', type: 'string' }),
          defineField({ name: 'href', title: 'Link URL (optional)', type: 'string' }),
        ],
        preview: { select: { title: 'title' }, prepare: ({ title }: any) => ({ title }) },
      }],
      validation: (r: any) => r.max(6),
    }),
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }: any) => ({ title: `🃏 ${title || 'Game Types'}` }) },
}

// ─────────────────────────────────────────────────────────────────────────────

export const countryHomepageType = defineType({
  name: 'countryHomepage',
  title: 'Country Homepage',
  type: 'document',
  groups: [
    { name: 'content',  title: 'Content' },
    { name: 'sections', title: 'Sections' },
    { name: 'seo',      title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'market',
      title: 'Market',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          { title: '🇨🇦 Canada', value: 'ca' },
          { title: '🇦🇺 Australia', value: 'au' },
        ],
      },
    }),
    defineField({
      name: 'heroHeading',
      title: 'Hero heading',
      type: 'string',
      group: 'content',
      description: 'Main H1 on the country homepage.',
    }),
    { ...introField, title: 'Intro text', group: 'content' } as any,
    { ...bodyField, group: 'content' } as any,
    // ── Page sections builder ──────────────────────────────────────────────
    defineField({
      name: 'sections',
      title: 'Page sections',
      type: 'array',
      group: 'sections',
      description: 'Add, remove and drag to reorder sections on the homepage. Each type has its own settings.',
      of: [
        sectionCasinoList,
        sectionPaymentMethods,
        sectionSoftware,
        sectionCtaBanner,
        sectionHighlights,
        sectionGameTypes,
      ],
    }),
    defineField({ name: 'metaTitle',       title: 'Meta title',       type: 'string', group: 'seo' }),
    defineField({ name: 'metaDescription', title: 'Meta description', type: 'text', rows: 3, group: 'seo' }),
    defineField({
      name: 'ogImage',
      title: 'OG image',
      type: 'image',
      group: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
  ],
  preview: {
    select: { market: 'market' },
    prepare({ market }: any) {
      const labels: Record<string, string> = { ca: '🇨🇦 Canada Homepage', au: '🇦🇺 Australia Homepage' }
      return { title: labels[market] || 'Country Homepage' }
    },
  },
})
