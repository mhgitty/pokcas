import { defineField, defineType } from 'sanity'

export const authorType = defineType({
  name: 'author',
  title: 'Authors',
  type: 'document',
  fields: [
    defineField({ name: 'name',     title: 'Name',         type: 'string',  validation: (r) => r.required() }),
    defineField({ name: 'slug',     title: 'Slug',         type: 'slug',    options: { source: 'name' }, validation: (r) => r.required() }),
    defineField({ name: 'role',     title: 'Role/Title',   type: 'string',  description: 'E.g. "Casino Expert" or "Senior Editor"' }),
    defineField({ name: 'image',    title: 'Photo',         type: 'image',   options: { hotspot: true } }),
    defineField({ name: 'bio',      title: 'Bio',          type: 'text',    rows: 4 }),
    defineField({ name: 'linkedin', title: 'LinkedIn URL', type: 'url' }),
    defineField({ name: 'x',        title: 'X (Twitter) URL', type: 'url' }),
    defineField({ name: 'facebook', title: 'Facebook URL', type: 'url' }),
  ],
  preview: {
    select: { title: 'name', media: 'image' },
  },
})
