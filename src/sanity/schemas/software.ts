import { defineField, defineType } from 'sanity'

export const softwareType = defineType({
  name: 'software',
  title: 'Software',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'titel',
      title: 'H1',
      type: 'string',
      description: 'Displayed as the H1 heading on the page. Falls back to Name if empty.',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'market',
      title: 'Market',
      type: 'string',
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
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'name', media: 'logo' },
  },
})
