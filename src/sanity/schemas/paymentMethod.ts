import { defineField, defineType } from 'sanity'

export const paymentMethodType = defineType({
  name: 'paymentMethod',
  title: 'Payment Methods',
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
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ],
    }),
    defineField({
      name: 'withdrawalTime',
      title: 'Withdrawal Time',
      type: 'string',
      description: 'e.g. "Instant", "1–3 business days"',
    }),
    defineField({
      name: 'withdrawalFee',
      title: 'Withdrawal Fee',
      type: 'string',
      description: 'e.g. "Free", "$2.50 per transaction"',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'withdrawalTime', media: 'logo' },
  },
})
