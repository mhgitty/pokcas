import { defineField, defineType } from 'sanity'
import { bodyField } from './page'

export const postType = defineType({
  name: 'post',
  title: 'Indlæg',
  type: 'document',
  groups: [
    { name: 'content', title: 'Indhold' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', group: 'content', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', group: 'content', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'excerpt', title: 'Uddrag', type: 'text', rows: 3, group: 'content' }),
    defineField({
      name: 'featuredImage', title: 'Fremhævet billede', type: 'image', group: 'content',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string', description: 'Beskriv billedet for søgemaskiner og skærmlæsere' }),
      ],
    }),
    defineField({ name: 'category', title: 'Kategori', type: 'reference', to: [{ type: 'category' }], group: 'content' }),
    defineField({ name: 'author', title: 'Forfatter', type: 'reference', to: [{ type: 'author' }], group: 'content' }),
    { ...bodyField, group: 'content' } as any,
    defineField({ name: 'readingTime', title: 'Læsetid (minutter)', type: 'number', group: 'content' }),
    defineField({ name: 'publishedAt', title: 'Publiceret dato', type: 'datetime', group: 'content' }),
    defineField({ name: 'lastUpdated', title: 'Sidst opdateret', type: 'datetime', group: 'content' }),
    defineField({ name: 'metaTitle', title: 'Meta titel', type: 'string', group: 'seo' }),
    defineField({ name: 'metaDescription', title: 'Meta beskrivelse', type: 'text', rows: 3, group: 'seo' }),
    defineField({
      name: 'ogImage', title: 'OG-billede (valgfrit)', type: 'image', group: 'seo',
      description: 'Tilsidesæt det fremhævede billede med et separat billede til sociale medier',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'excerpt', media: 'featuredImage' },
  },
})
