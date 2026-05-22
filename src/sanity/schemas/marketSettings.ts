import { defineField, defineType } from 'sanity'

const linkFields = [
  defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
  defineField({ name: 'url', title: 'URL', type: 'string', description: 'E.g. /ca/reviews/ or https://...' }),
]

const navItemFields = [
  ...linkFields,
  defineField({ name: 'isHighlighted', title: 'Highlighted (CTA button)', type: 'boolean', initialValue: false }),
  defineField({
    name: 'children',
    title: 'Dropdown items',
    type: 'array',
    of: [{
      type: 'object',
      name: 'subNavItem',
      fields: linkFields,
      preview: {
        select: { title: 'label', subtitle: 'url' },
      },
    }],
  }),
]

export const marketSettingsType = defineType({
  name: 'marketSettings',
  title: 'Market Settings',
  type: 'document',
  groups: [
    { name: 'header', title: '🔝 Header' },
    { name: 'footer', title: '🔻 Footer' },
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

    // ── Header ──────────────────────────────────────────────────────────────────
    defineField({
      name: 'headerNav',
      title: 'Header navigation',
      type: 'array',
      group: 'header',
      description: 'Leave empty to fall back to the global nav.',
      of: [{
        type: 'object',
        name: 'navItem',
        fields: navItemFields,
        preview: {
          select: { title: 'label', subtitle: 'url', isHighlighted: 'isHighlighted' },
          prepare({ title, subtitle, isHighlighted }: any) {
            return { title: `${isHighlighted ? '⚡ ' : ''}${title}`, subtitle }
          },
        },
      }],
    }),

    // ── Footer ──────────────────────────────────────────────────────────────────
    defineField({
      name: 'footerTagline',
      title: 'Footer tagline',
      type: 'text',
      rows: 2,
      group: 'footer',
    }),
    defineField({
      name: 'footerColumns',
      title: 'Footer columns',
      type: 'array',
      group: 'footer',
      validation: (r) => r.max(2),
      of: [{
        type: 'object',
        name: 'footerColumn',
        fields: [
          defineField({ name: 'title', title: 'Column title', type: 'string', validation: (r) => r.required() }),
          defineField({
            name: 'items',
            title: 'Links',
            type: 'array',
            of: [{
              type: 'object',
              name: 'footerLink',
              fields: linkFields,
              preview: { select: { title: 'label', subtitle: 'url' } },
            }],
          }),
        ],
        preview: {
          select: { title: 'title', items: 'items' },
          prepare({ title, items }: any) {
            return { title, subtitle: `${(items || []).length} links` }
          },
        },
      }],
    }),
    defineField({
      name: 'footerNote',
      title: 'Footer bottom left',
      type: 'string',
      group: 'footer',
    }),
    defineField({
      name: 'footerDisclaimer',
      title: 'Footer bottom right',
      type: 'string',
      group: 'footer',
    }),
  ],
  preview: {
    select: { market: 'market' },
    prepare({ market }: any) {
      const labels: Record<string, string> = { ca: '🇨🇦 Canada Settings', au: '🇦🇺 Australia Settings' }
      return { title: labels[market] || 'Market Settings' }
    },
  },
})
