import { defineField, defineType } from 'sanity'

// ── Shared link fields (used in both top-level and sub-menu items) ─────────────
// Pick a page OR a bookmaker OR type a custom URL — whichever is set wins (in that order).
const linkFields = [
  defineField({ name: 'label', title: 'Tekst', type: 'string', validation: (r) => r.required() }),
  defineField({
    name: 'pageRef',
    title: 'Side (vælg fra CMS)',
    type: 'reference',
    to: [{ type: 'page' }],
    description: 'Vælg en side automatisk — URL udfyldes selv',
  }),
  defineField({
    name: 'bookmakerRef',
    title: 'Bookmaker (vælg fra CMS)',
    type: 'reference',
    to: [{ type: 'bookmaker' }],
    description: 'Vælg en bookmaker — URL udfyldes selv',
  }),
  defineField({
    name: 'url',
    title: 'URL (tilpasset / ekstern)',
    type: 'string',
    description: 'Bruges kun hvis du ikke vælger en side eller bookmaker ovenfor. F.eks. /review/ eller https://...',
  }),
]

// ── Sub-menu item (no nesting, no CTA highlight) ───────────────────────────────
const subNavItemFields = [...linkFields]

// ── Top-level nav item ─────────────────────────────────────────────────────────
const navItemFields = [
  ...linkFields,
  defineField({ name: 'isHighlighted', title: 'Fremhævet (CTA-knap)', type: 'boolean', initialValue: false }),
  defineField({
    name: 'children',
    title: 'Undermenu',
    type: 'array',
    description: 'Tilføj underpunkter for at skabe en dropdown-menu',
    of: [{
      type: 'object',
      name: 'subNavItem',
      fields: subNavItemFields,
      preview: {
        select: { title: 'label', pageRef: 'pageRef.slug.current', bookmakerRef: 'bookmakerRef.slug.current', url: 'url' },
        prepare({ title, pageRef, bookmakerRef, url }: any) {
          return { title, subtitle: pageRef ? `/${pageRef}/` : bookmakerRef ? `/review/${bookmakerRef}/` : url }
        },
      },
    }],
  }),
]

// ── Footer link fields (same as linkFields, no children/CTA) ──────────────────
const footerLinkFields = [...linkFields]

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: '⚙️ Siteindstillinger',
  type: 'document',
  groups: [
    { name: 'general', title: '⚙️ Generelt' },
    { name: 'header',  title: '🔝 Header' },
    { name: 'footer',  title: '🔻 Footer' },
  ],
  fields: [
    // ── Default author ──────────────────────────────────────────────────────────
    defineField({
      name: 'defaultAuthor',
      title: 'Standard forfatter',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'general',
      description: 'Vises som forfatter-kort nederst på alle sider, bookmaker- og bonussider',
    }),

    // ── Header ──────────────────────────────────────────────────────────────────
    defineField({
      name: 'headerNav',
      title: 'Header navigation',
      type: 'array',
      group: 'header',
      description: 'Elementer i topmenuen. Træk for at ændre rækkefølge.',
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
            url: 'url',
            children: 'children',
          },
          prepare({ title, isHighlighted, pageRef, bookmakerRef, url, children }: any) {
            const resolvedUrl = pageRef ? `/${pageRef}/` : bookmakerRef ? `/review/${bookmakerRef}/` : url
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
      initialValue: 'Danmarks uafhængige guide til betting bonusser og bookmakers. Vi sammenligner de bedste tilbud.',
    }),
    defineField({
      name: 'footerColumns',
      title: 'Footer kolonner',
      type: 'array',
      group: 'footer',
      description: 'Op til 2 kolonner med links.',
      validation: (r) => r.max(2),
      of: [{
        type: 'object',
        name: 'footerColumn',
        fields: [
          defineField({ name: 'title', title: 'Kolonnetitel', type: 'string', validation: (r) => r.required() }),
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
                  url: 'url',
                },
                prepare({ title, pageRef, bookmakerRef, url }: any) {
                  return { title, subtitle: pageRef ? `/${pageRef}/` : bookmakerRef ? `/review/${bookmakerRef}/` : url }
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
      title: 'Footer bundtekst (venstre)',
      type: 'string',
      group: 'footer',
      initialValue: '© 2025 Pokcas.dk · Spil ansvarligt · 18+',
    }),
    defineField({
      name: 'footerDisclaimer',
      title: 'Footer bundtekst (højre)',
      type: 'string',
      group: 'footer',
      initialValue: 'Affiliatelinks kan forekomme · Se vilkår hos bookmaker',
    }),
  ],
  preview: {
    prepare() { return { title: 'Siteindstillinger' } },
  },
})
