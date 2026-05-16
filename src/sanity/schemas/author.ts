import { defineField, defineType } from 'sanity'

export const authorType = defineType({
  name: 'author',
  title: 'Forfattere',
  type: 'document',
  fields: [
    defineField({ name: 'name',     title: 'Navn',         type: 'string',  validation: (r) => r.required() }),
    defineField({ name: 'image',    title: 'Foto',         type: 'image',   options: { hotspot: true } }),
    defineField({ name: 'bio',      title: 'Bio',          type: 'text',    rows: 4 }),
    defineField({ name: 'linkedin', title: 'LinkedIn URL', type: 'url' }),
    defineField({ name: 'x',        title: 'X (Twitter) URL', type: 'url' }),
    defineField({ name: 'facebook', title: 'Facebook URL', type: 'url' }),
  ],
  preview: {
    select: { title: 'name', media: 'image' },
  },
})
