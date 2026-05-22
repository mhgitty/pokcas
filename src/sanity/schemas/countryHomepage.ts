import { defineField, defineType } from 'sanity'
import { bodyField } from './page'

export const countryHomepageType = defineType({
  name: 'countryHomepage',
  title: 'Country Homepage',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content' },
    { name: 'seo',     title: 'SEO' },
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
    defineField({
      name: 'intro',
      title: 'Intro text',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    { ...bodyField, group: 'content' } as any,
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
