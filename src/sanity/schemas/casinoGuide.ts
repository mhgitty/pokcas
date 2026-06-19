import { defineField, defineType } from 'sanity'
import { introField, bodyField } from './page'
import { comparisonTableFields } from './comparisonTable'

/**
 * Casino Guide — a page-like editorial document that lives under
 * /{market}/casino-guides/[slug]/. Same content fields as a page.
 */
export const casinoGuideType = defineType({
  name: 'casinoGuide',
  title: 'Casino Guides',
  type: 'document',
  groups: [
    { name: 'content', title: '📝 Content' },
    { name: 'seo',     title: '🔍 SEO' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Title (H1)', type: 'string', group: 'content', validation: (r) => r.required() }),
    defineField({
      name: 'slug', title: 'Slug', type: 'slug', group: 'content',
      options: { source: 'title' },
      description: 'Used in URL: /casino-guides/[slug]',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'market', title: 'Market', type: 'string', group: 'content',
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
    { ...introField, title: 'Intro', group: 'content' } as any,
    ...comparisonTableFields.map((f) => ({ ...f, group: 'content' })) as any,
    { ...bodyField, group: 'content' } as any,
    defineField({ name: 'author', title: 'Author', type: 'reference', to: [{ type: 'author' }], group: 'content', description: 'Shown in hero and as author card at the bottom' }),
    defineField({ name: 'factChecker', title: 'Fact checker', type: 'reference', to: [{ type: 'author' }], group: 'content' }),
    defineField({ name: 'lastUpdated', title: 'Last updated', type: 'date', group: 'content' }),
    defineField({ name: 'hideAuthor', title: 'Hide author', type: 'boolean', group: 'content', initialValue: false }),
    defineField({ name: 'metaTitle', title: 'Meta title', type: 'string', group: 'seo' }),
    defineField({ name: 'metaDescription', title: 'Meta description', type: 'text', rows: 3, group: 'seo' }),
    defineField({
      name: 'featuredImage', title: 'OG image', type: 'image', group: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', market: 'market' },
    prepare({ title, slug, market }: any) {
      const prefix = market === 'ca' ? '/ca' : market === 'au' ? '/au' : ''
      const flag = market === 'ca' ? '🇨🇦' : market === 'au' ? '🇦🇺' : '🌍'
      return { title: title || '(untitled)', subtitle: `${flag} ${prefix}/casino-guides/${slug || ''}/` }
    },
  },
})
