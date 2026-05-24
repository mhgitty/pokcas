import { defineField, defineType } from 'sanity'
import { TableBlockInput } from '../components/TableBlockInput'
import { comparisonTableFields } from './comparisonTable'

export const bodyField = defineField({
  name: 'body',
  title: 'Content',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              { name: 'href', type: 'url', title: 'URL' },
              { name: 'blank', type: 'boolean', title: 'Open in new tab' },
            ],
          },
        ],
      },
    },
    { type: 'image', options: { hotspot: true } },
    {
      type: 'object',
      name: 'calloutBlock',
      title: 'Info / Tip box',
      fields: [
        {
          name: 'variant', title: 'Type', type: 'string',
          options: {
            list: [
              { title: 'ℹ️ Info', value: 'info' },
              { title: '💡 Tip', value: 'tip' },
              { title: '⚠️ Warning', value: 'warning' },
            ],
            layout: 'radio', direction: 'horizontal',
          },
          initialValue: 'info',
        },
        { name: 'title', title: 'Heading', type: 'string' },
        {
          name: 'body',
          title: 'Content',
          type: 'array',
          of: [{
            type: 'block',
            styles: [{ title: 'Normal', value: 'normal' }],
            lists: [
              { title: 'Bullet list', value: 'bullet' },
              { title: 'Numbered list', value: 'number' },
            ],
            marks: {
              decorators: [
                { title: 'Bold', value: 'strong' },
                { title: 'Italic', value: 'em' },
              ],
              annotations: [
                {
                  name: 'link',
                  type: 'object',
                  title: 'Link',
                  fields: [
                    { name: 'href', type: 'url', title: 'URL' },
                    { name: 'blank', type: 'boolean', title: 'Open in new tab' },
                  ],
                },
              ],
            },
          }],
        },
      ],
      preview: {
        select: { title: 'title', variant: 'variant' },
        prepare({ title, variant }: any) {
          const icons: Record<string, string> = { info: 'ℹ️', tip: '💡', warning: '⚠️' }
          return { title: title || 'Callout', subtitle: `${icons[variant] || 'ℹ️'} ${variant || 'info'}` }
        },
      },
    },
    {
      type: 'object',
      name: 'faqBlock',
      title: 'FAQ',
      fields: [
        {
          name: 'items', title: 'Questions & answers', type: 'array',
          of: [{
            type: 'object', name: 'faqItem',
            fields: [
              { name: 'question', title: 'Question', type: 'string' },
              { name: 'answer', title: 'Answer', type: 'text', rows: 3 },
            ],
            preview: { select: { title: 'question', subtitle: 'answer' } },
          }],
        },
      ],
      preview: {
        select: { items: 'items' },
        prepare({ items }: any) {
          return { title: 'FAQ', subtitle: `${(items || []).length} questions` }
        },
      },
    },
    {
      type: 'object',
      name: 'prosConsBlock',
      title: 'Pros & Cons',
      fields: [
        { name: 'title', title: 'Heading (optional)', type: 'string' },
        { name: 'pros', title: 'Pros ✅', type: 'array', of: [{ type: 'string' }] },
        { name: 'cons', title: 'Cons ❌', type: 'array', of: [{ type: 'string' }] },
      ],
      preview: {
        select: { title: 'title', pros: 'pros', cons: 'cons' },
        prepare({ title, pros, cons }: any) {
          return { title: title || 'Pros & Cons', subtitle: `✅ ${(pros || []).length}  ❌ ${(cons || []).length}` }
        },
      },
    },
    {
      type: 'object',
      name: 'latestPostsBlock',
      title: 'Latest articles',
      fields: [
        { name: 'title', title: 'Heading', type: 'string', initialValue: 'Latest guides & articles' },
        {
          name: 'count', title: 'Number of articles', type: 'number',
          options: { list: [2, 3, 4, 6], layout: 'radio', direction: 'horizontal' },
          initialValue: 4,
        },
        { name: 'showViewAll', title: 'Show "View all" link', type: 'boolean', initialValue: true },
      ],
      preview: {
        select: { title: 'title', count: 'count' },
        prepare({ title, count }: any) {
          return { title: title || 'Latest articles', subtitle: `${count || 4} articles` }
        },
      },
    },
    {
      type: 'object',
      name: 'ctaButton',
      title: 'CTA Button',
      fields: [
        { name: 'text', title: 'Button text', type: 'string' },
        { name: 'url',  title: 'URL',         type: 'url' },
      ],
      preview: {
        select: { title: 'text', subtitle: 'url' },
        prepare({ title, subtitle }: any) {
          return { title: title || 'CTA Button', subtitle: subtitle || '' }
        },
      },
    },
    // ── Casino card (bookmaker) ─────────────────────────────────────────────
    {
      type: 'object',
      name: 'casinoKortBlock',
      title: '🎰 Casino card',
      fields: [
        {
          name: 'bookmaker',
          title: 'Select casino',
          type: 'reference',
          to: [{ type: 'bookmaker' }],
        },
        { name: 'customTitle', title: 'Title', type: 'string' },
        { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
        {
          name: 'customBody',
          title: 'Body text',
          type: 'array',
          of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], lists: [{ title: 'Bullet list', value: 'bullet' }, { title: 'Numbered list', value: 'number' }], marks: { decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }] } }],
        },
        { name: 'pros', title: '✅ Pros', type: 'array', of: [{ type: 'string' }] },
        { name: 'cons', title: '❌ Cons', type: 'array', of: [{ type: 'string' }] },
      ],
      preview: {
        select: { customTitle: 'customTitle', name: 'bookmaker.name', logo: 'bookmaker.logo' },
        prepare({ customTitle, name, logo }: any) {
          return { title: customTitle || name || 'Casino card', subtitle: name, media: logo }
        },
      },
    },
    // ── Bonus card ───────────────────────────────────────────────────────────
    {
      type: 'object',
      name: 'bonusKortBlock',
      title: '🎁 Bonus card',
      fields: [
        {
          name: 'bonus',
          title: 'Select bonus',
          type: 'reference',
          to: [{ type: 'bonus' }],
        },
        { name: 'customTitle', title: 'Title', type: 'string' },
        { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
        {
          name: 'customBody',
          title: 'Body text',
          type: 'array',
          of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], lists: [{ title: 'Bullet list', value: 'bullet' }, { title: 'Numbered list', value: 'number' }], marks: { decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }] } }],
        },
      ],
      preview: {
        select: { customTitle: 'customTitle', bonusTitle: 'bonus.title', bmName: 'bonus.bookmaker.name', logo: 'bonus.casinoLogo' },
        prepare({ customTitle, bonusTitle, bmName, logo }: any) {
          return { title: customTitle || bmName || bonusTitle || 'Bonus card', subtitle: bonusTitle, media: logo }
        },
      },
    },
    {
      type: 'object',
      name: 'detailsTable',
      title: 'Details Table (Area / Details)',
      fields: [
        {
          name: 'rows',
          title: 'Rows',
          type: 'array',
          of: [{
            type: 'object',
            name: 'tableRow',
            title: 'Row',
            fields: [
              { name: 'area', title: 'Area', type: 'string' },
              { name: 'details', title: 'Details', type: 'string' },
            ],
            preview: {
              select: { area: 'area', details: 'details' },
              prepare({ area, details }: any) { return { title: area, subtitle: details } },
            },
          }],
        },
      ],
      preview: {
        select: { rows: 'rows' },
        prepare({ rows }: any) {
          return { title: 'Details Table', subtitle: `${(rows || []).length} rows` }
        },
      },
    },
    {
      type: 'object',
      name: 'tableBlock',
      title: 'Table',
      components: { input: TableBlockInput },
      fields: [
        { name: 'title', title: 'Heading (optional)', type: 'string' },
        {
          name: 'headers',
          title: 'Column headers',
          type: 'array',
          of: [{ type: 'string' }],
        },
        {
          name: 'rows',
          title: 'Rows',
          type: 'array',
          of: [{
            type: 'object',
            name: 'tableRow',
            title: 'Row',
            fields: [{ name: 'cells', title: 'Cells', type: 'array', of: [{ type: 'string' }] }],
            preview: {
              select: { cells: 'cells' },
              prepare({ cells }: any) { return { title: (cells || []).join(' | ') || '(empty row)' } },
            },
          }],
        },
      ],
      preview: {
        select: { title: 'title', headers: 'headers', rows: 'rows' },
        prepare({ title, headers, rows }: any) {
          return { title: title || 'Table', subtitle: `${(headers || []).length} columns · ${(rows || []).length} rows` }
        },
      },
    },
    {
      type: 'object',
      name: 'howToBlock',
      title: 'How-to',
      fields: [
        {
          name: 'title',
          title: 'Section title',
          type: 'string',
          initialValue: 'How It Works',
        },
        {
          name: 'items',
          title: 'Steps',
          type: 'array',
          of: [{
            type: 'object',
            name: 'howToItem',
            title: 'Step',
            fields: [
              { name: 'title', title: 'Step title', type: 'string' },
              { name: 'body',  title: 'Body text',  type: 'text', rows: 3 },
            ],
            preview: {
              select: { title: 'title', subtitle: 'body' },
            },
          }],
        },
      ],
      preview: {
        select: { title: 'title', items: 'items' },
        prepare({ title, items }: any) {
          return { title: title || 'How-to', subtitle: `${(items || []).length} steps` }
        },
      },
    },
  ],
})

export const pageType = defineType({
  name: 'page',
  title: 'Pages',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content' },
    { name: 'seo',     title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', group: 'content', validation: (r) => r.required() }),
    defineField({ name: 'slug',  title: 'Slug',  type: 'slug',   group: 'content', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({
      name: 'market',
      title: 'Market',
      type: 'string',
      group: 'content',
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
      name: 'parent',
      title: 'Parent page',
      type: 'reference',
      to: [{ type: 'page' }],
      group: 'content',
      options: { disableNew: true },
      description: 'Optional — generates URL as /parent/this-page and adds breadcrumb',
    }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 3, group: 'content' }),
    ...comparisonTableFields.map(f => ({ ...f, group: 'content' })) as any,
    { ...bodyField, group: 'content' } as any,
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'content',
      description: 'Shown in hero and as author card at the bottom of the page',
    }),
    defineField({
      name: 'factChecker',
      title: 'Fact checker',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'content',
      description: 'Shown next to the author in the hero section',
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last updated',
      type: 'date',
      group: 'content',
      description: 'Shown below the author name in hero',
    }),
    defineField({
      name: 'hideAuthor',
      title: 'Hide author',
      type: 'boolean',
      group: 'content',
      initialValue: false,
      description: 'When enabled, the author bar and author card are not shown on this page (e.g. About us, Privacy Policy)',
    }),
    defineField({ name: 'metaTitle', title: 'Meta title', type: 'string', group: 'seo' }),
    defineField({ name: 'metaDescription', title: 'Meta description', type: 'text', rows: 3, group: 'seo' }),
    defineField({
      name: 'featuredImage', title: 'OG image', type: 'image', group: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
  },
})
