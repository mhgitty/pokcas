import { defineField, defineType } from 'sanity'
import { bodyField } from './page'

export const bookmakerType = defineType({
  name: 'bookmaker',
  title: 'Bookmakers',
  type: 'document',
  groups: [
    { name: 'info', title: 'Info & bonus' },
    { name: 'content', title: 'Indhold' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // ── Identity ─────────────────────────────────────────────────────────────
    defineField({
      name: 'titel',
      title: 'Titel (H1)',
      type: 'string',
      group: 'info',
      description: 'Vises som H1 på anmeldelsessiden. Hvis tom bruges "Navn anmeldelse".',
    }),
    defineField({
      name: 'name',
      title: 'Navn',
      type: 'string',
      group: 'info',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'info',
      options: { source: 'name' },
      description: 'Bruges i URL: /betting-sider/[slug]',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'info',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
      ],
    }),
    defineField({
      name: 'score',
      title: 'Score (0–10)',
      type: 'number',
      group: 'info',
      description: 'Vores samlede vurdering af bookmaker',
      validation: (r) => r.min(0).max(10),
    }),
    defineField({
      name: 'usp',
      title: 'USP',
      type: 'string',
      group: 'info',
      description: 'Kort salgsargument — vises på kortet, f.eks. "Markedets bedste velkomstbonus"',
    }),

    // ── Bonus info ────────────────────────────────────────────────────────────
    defineField({
      name: 'indbetalingsbonus',
      title: 'Indbetalingsbonus',
      type: 'string',
      group: 'info',
      description: 'F.eks. "100% op til 1.000 kr."',
    }),
    defineField({
      name: 'freeSpinsBonus',
      title: 'Free spins bonus',
      type: 'string',
      group: 'info',
      description: 'F.eks. "50 free spins"',
    }),
    defineField({
      name: 'minIndbetaling',
      title: 'Min. indbetaling (kr.)',
      type: 'number',
      group: 'info',
    }),
    defineField({
      name: 'gennemspilskrav',
      title: 'Gennemspilskrav',
      type: 'string',
      group: 'info',
      description: 'F.eks. "x40" eller "Ingen"',
    }),
    defineField({
      name: 'trustpilot',
      title: 'Trustpilot score',
      type: 'number',
      group: 'info',
      description: 'Score fra Trustpilot (0–5)',
      validation: (r) => r.min(0).max(5),
    }),
    defineField({
      name: 'lanceringsdato',
      title: 'Lanceringsdato',
      type: 'date',
      group: 'info',
    }),
    defineField({
      name: 'url',
      title: 'Affiliate URL',
      type: 'url',
      group: 'info',
      description: 'Link der bruges i "Hent bonus" knappen',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'terms',
      title: 'Vilkår',
      type: 'text',
      rows: 2,
      group: 'info',
      description: 'Kort tekst med vilkår — vises under bonusoplysningerne',
    }),

    // ── Page content ──────────────────────────────────────────────────────────
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Kort tekst der vises under overskriften',
    }),
    { ...bodyField, group: 'content' } as any,

    // ── SEO ───────────────────────────────────────────────────────────────────
    defineField({ name: 'metaTitle', title: 'Meta titel', type: 'string', group: 'seo' }),
    defineField({ name: 'metaDescription', title: 'Meta beskrivelse', type: 'text', rows: 3, group: 'seo' }),
    defineField({
      name: 'ogImage',
      title: 'OG-billede',
      type: 'image',
      group: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' })],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'usp', media: 'logo' },
  },
})
