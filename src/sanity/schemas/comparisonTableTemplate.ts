import { defineField, defineType } from 'sanity'

/**
 * Standalone template document for comparison tables.
 * Pages reference a template — change the template once, all pages update.
 */
export const comparisonTableTemplateType = defineType({
  name: 'comparisonTableTemplate',
  title: '📊 Sammenligningsskabeloner',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Skabelonnavn',
      type: 'string',
      description: 'Internt navn — vises kun i Studio. F.eks. "Forside – top bonusser"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'tableType',
      title: 'Vis',
      type: 'string',
      options: {
        list: [
          { title: '🎁 Bonusser', value: 'bonus' },
          { title: '🏆 Bookmakers', value: 'bookmaker' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'bonus',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'bonuses',
      title: 'Bonusser',
      type: 'array',
      description: 'Træk for at ændre rækkefølge. Kun aktive bonusser kan tilføjes.',
      of: [
        {
          type: 'reference',
          to: [{ type: 'bonus' }],
          options: {
            filter: 'active == true',
            disableNew: true,
          },
        },
      ],
      hidden: ({ document }: any) => document?.tableType !== 'bonus',
    }),
    defineField({
      name: 'bookmakers',
      title: 'Bookmakers',
      type: 'array',
      description: 'Træk for at ændre rækkefølge.',
      of: [
        {
          type: 'reference',
          to: [{ type: 'bookmaker' }],
          options: {
            disableNew: true,
          },
        },
      ],
      hidden: ({ document }: any) => document?.tableType !== 'bookmaker',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      tableType: 'tableType',
      bonuses: 'bonuses',
      bookmakers: 'bookmakers',
    },
    prepare({ title, tableType, bonuses, bookmakers }: any) {
      const count = tableType === 'bonus'
        ? (bonuses || []).length
        : (bookmakers || []).length
      const label = tableType === 'bonus' ? 'bonusser' : 'bookmakers'
      return { title, subtitle: `${count} ${label}` }
    },
  },
})
