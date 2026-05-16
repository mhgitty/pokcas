import { defineField, defineType } from 'sanity'
import { bodyField } from './page'
import { comparisonTableFields } from './comparisonTable'

export const homepageType = defineType({
  name: 'homepage',
  title: '🏠 Forside',
  type: 'document',
  groups: [
    { name: 'hero',    title: 'Hero' },
    { name: 'content', title: 'Indhold' },
    { name: 'seo',     title: 'SEO' },
  ],
  fields: [
    // Hero
    defineField({
      name: 'heroHeading',
      title: 'Hero overskrift',
      type: 'string',
      group: 'hero',
      initialValue: 'Find den bedste betting bonus i Danmark',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      group: 'hero',
      description: 'Kort tekst under overskriften i hero-sektionen',
      initialValue: 'Vi sammenligner og anmelder alle store bookmakers i Danmark. Find den bedste velkomstbonus og kom godt i gang.',
    }),

    // Comparison table (renders above body text)
    ...comparisonTableFields.map(f => ({ ...f, group: 'content' })) as any,

    // Body content
    { ...bodyField, group: 'content' } as any,

    // SEO
    defineField({ name: 'metaTitle', title: 'Meta titel', type: 'string', group: 'seo', initialValue: 'Sammenlign betting sider — find den bedste bonus i Danmark' }),
    defineField({ name: 'metaDescription', title: 'Meta beskrivelse', type: 'text', rows: 3, group: 'seo', initialValue: 'Find og sammenlign de bedste betting bonusser fra alle store danske bookmakers.' }),
    defineField({
      name: 'featuredImage', title: 'OG-billede', type: 'image', group: 'seo',
      description: 'Billede der vises når siden deles på sociale medier',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heroHeading' },
    prepare({ title }) {
      return { title: title || 'Forside' }
    },
  },
})
