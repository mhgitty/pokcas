import { defineField, defineType } from 'sanity'

// ── Shared link fields ────────────────────────────────────────────────────────
// Pick a page, bookmaker, software provider, payment method, or blog post — or type a custom URL.
const linkFields = [
  defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
  defineField({
    name: 'pageRef',
    title: 'Page (select from CMS)',
    type: 'reference',
    to: [{ type: 'page' }],
    description: 'Select a page — URL is auto-filled',
  }),
  defineField({
    name: 'bookmakerRef',
    title: 'Casino (select from CMS)',
    type: 'reference',
    to: [{ type: 'bookmaker' }],
    description: 'Select a casino — URL is auto-filled',
  }),
  defineField({
    name: 'softwareRef',
    title: 'Software provider (select from CMS)',
    type: 'reference',
    to: [{ type: 'software' }],
    description: 'Select a software provider — URL is auto-filled',
  }),
  defineField({
    name: 'paymentMethodRef',
    title: 'Payment method (select from CMS)',
    type: 'reference',
    to: [{ type: 'paymentMethod' }],
    description: 'Select a payment method — URL is auto-filled',
  }),
  defineField({
    name: 'postRef',
    title: 'Blog post (select from CMS)',
    type: 'reference',
    to: [{ type: 'post' }],
    description: 'Select a blog post — URL is auto-filled',
  }),
  defineField({
    name: 'url',
    title: 'URL (custom / external)',
    type: 'string',
    description: 'Only used if you don\'t select a reference above. E.g. /review/ or https://...',
  }),
]

// ── Sub-menu item ─────────────────────────────────────────────────────────────
const subNavItemFields = [...linkFields]

// ── Top-level nav item ─────────────────────────────────────────────────────────
const navItemFields = [
  ...linkFields,
  defineField({ name: 'isHighlighted', title: 'Highlighted (CTA button)', type: 'boolean', initialValue: false }),
  defineField({
    name: 'children',
    title: 'Dropdown',
    type: 'array',
    description: 'Add sub-items to create a dropdown menu',
    of: [{
      type: 'object',
      name: 'subNavItem',
      fields: subNavItemFields,
      preview: {
        select: {
          title: 'label',
          pageRef: 'pageRef.slug.current',
          bookmakerRef: 'bookmakerRef.slug.current',
          softwareRef: 'softwareRef.slug.current',
          paymentMethodRef: 'paymentMethodRef.slug.current',
          postRef: 'postRef.slug.current',
          url: 'url',
        },
        prepare({ title, pageRef, bookmakerRef, softwareRef, paymentMethodRef, postRef, url }: any) {
          const resolved = pageRef ? `/${pageRef}/`
            : bookmakerRef ? `/review/${bookmakerRef}/`
            : softwareRef ? `/software/${softwareRef}/`
            : paymentMethodRef ? `/payments/${paymentMethodRef}/`
            : postRef ? `/${postRef}/`
            : url
          return { title, subtitle: resolved }
        },
      },
    }],
  }),
]

// ── Footer link fields ────────────────────────────────────────────────────────
const footerLinkFields = [...linkFields]

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: '⚙️ Site Settings',
  type: 'document',
  groups: [
    { name: 'general', title: '⚙️ General' },
    { name: 'header',  title: '🔝 Header' },
    { name: 'footer',  title: '🔻 Footer' },
  ],
  fields: [
    // ── Default author ──────────────────────────────────────────────────────────
    defineField({
      name: 'defaultAuthor',
      title: 'Default author',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'general',
      description: 'Shown as author card at the bottom of all pages, casino and bonus pages',
    }),

    // ── Header ──────────────────────────────────────────────────────────────────
    defineField({
      name: 'headerNav',
      title: 'Header navigation',
      type: 'array',
      group: 'header',
      description: 'Items in the top menu. Drag to reorder.',
      of: [{
        type: 'object',
        name: 'navItem',
        fields: navItemFields,
        preview: {
          select: {
            title: 'label',
            isHighlighted: 'isHighlighted',
            pageRef: 'pageRef.slug.current',
            bookmakerRef: 'bookmakerRef.slug.current',
            softwareRef: 'softwareRef.slug.current',
            paymentMethodRef: 'paymentMethodRef.slug.current',
            postRef: 'postRef.slug.current',
            url: 'url',
            children: 'children',
          },
          prepare({ title, isHighlighted, pageRef, bookmakerRef, softwareRef, paymentMethodRef, postRef, url, children }: any) {
            const resolvedUrl = pageRef ? `/${pageRef}/`
              : bookmakerRef ? `/review/${bookmakerRef}/`
              : softwareRef ? `/software/${softwareRef}/`
              : paymentMethodRef ? `/payments/${paymentMethodRef}/`
              : postRef ? `/${postRef}/`
              : url
            const hasChildren = children?.length > 0
            return {
              title: `${isHighlighted ? '⚡ ' : ''}${hasChildren ? '▾ ' : ''}${title}`,
              subtitle: resolvedUrl,
            }
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
      initialValue: 'Your independent international guide to online casinos and casino bonuses. We compare the best offers.',
    }),
    defineField({
      name: 'footerColumns',
      title: 'Footer columns',
      type: 'array',
      group: 'footer',
      description: 'Up to 2 columns with links.',
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
              name: 'navItem',
              fields: footerLinkFields,
              preview: {
                select: {
                  title: 'label',
                  pageRef: 'pageRef.slug.current',
                  bookmakerRef: 'bookmakerRef.slug.current',
                  softwareRef: 'softwareRef.slug.current',
                  paymentMethodRef: 'paymentMethodRef.slug.current',
                  postRef: 'postRef.slug.current',
                  url: 'url',
                },
                prepare({ title, pageRef, bookmakerRef, softwareRef, paymentMethodRef, postRef, url }: any) {
                  const resolved = pageRef ? `/${pageRef}/`
                    : bookmakerRef ? `/review/${bookmakerRef}/`
                    : softwareRef ? `/software/${softwareRef}/`
                    : paymentMethodRef ? `/payments/${paymentMethodRef}/`
                    : postRef ? `/${postRef}/`
                    : url
                  return { title, subtitle: resolved }
                },
              },
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
      initialValue: '© 2025 Pokcas.com · Play responsibly · 18+',
    }),
    defineField({
      name: 'footerDisclaimer',
      title: 'Footer bottom right',
      type: 'string',
      group: 'footer',
      initialValue: 'Affiliate links may be present · See terms at the casino',
    }),
  ],
  preview: {
    prepare() { return { title: 'Site Settings' } },
  },
})
