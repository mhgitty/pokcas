import { defineField, defineType } from 'sanity'
import { bodyField } from './page'
import { comparisonTableFields } from './comparisonTable'

export const homepageType = defineType({
  name: 'homepage',
  title: '🏠 Homepage',
  type: 'document',
  groups: [
    { name: 'hero',    title: 'Hero' },
    { name: 'content', title: 'Content' },
    { name: 'seo',     title: 'SEO' },
  ],
  fields: [
    // Hero
    defineField({
      name: 'heroHeading',
      title: 'Hero heading',
      type: 'string',
      group: 'hero',
      initialValue: 'Find the best online casino bonus',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      group: 'hero',
      description: 'Short text below the heading in the hero section',
      initialValue: 'We compare and review the top online casinos. Find the best welcome bonus and get started.',
    }),

    // Comparison table (renders above body text)
    ...comparisonTableFields.map(f => ({ ...f, group: 'content' })) as any,

    // Body content
    { ...bodyField, group: 'content' } as any,

    defineField({
      name: 'howItWorksTitle',
      title: 'Section title',
      type: 'string',
      group: 'content',
      initialValue: 'How It Works',
    }),
    defineField({
      name: 'howItWorksItems',
      title: 'Steps',
      type: 'array',
      group: 'content',
      of: [{
        type: 'object',
        name: 'howItWorksItem',
        title: 'Step',
        fields: [
          { name: 'title', title: 'Title', type: 'string' },
          { name: 'body',  title: 'Body text', type: 'text', rows: 4 },
        ],
        preview: {
          select: { title: 'title', subtitle: 'body' },
        },
      }],
    }),

    // SEO
    defineField({ name: 'metaTitle', title: 'Meta title', type: 'string', group: 'seo', initialValue: 'Best Online Casinos — Compare bonuses and reviews' }),
    defineField({ name: 'metaDescription', title: 'Meta description', type: 'text', rows: 3, group: 'seo', initialValue: 'Find and compare the best casino bonuses from all major online casinos.' }),
    defineField({
      name: 'featuredImage', title: 'OG image', type: 'image', group: 'seo',
      description: 'Image shown when the page is shared on social media',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heroHeading' },
    prepare({ title }) {
      return { title: title || 'Homepage' }
    },
  },
})
