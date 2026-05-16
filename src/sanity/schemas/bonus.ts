import { defineField, defineType } from 'sanity'
import { bodyField } from './page'

export const bonusType = defineType({
  name: 'bonus',
  title: 'Bonusser',
  type: 'document',
  groups: [
    { name: 'info',    title: '🎁 Bonus info' },
    { name: 'details', title: '📋 Detaljer' },
    { name: 'content', title: '📝 Indhold' },
    { name: 'seo',     title: '🔍 SEO' },
  ],
  fields: [
    // ── Identity ─────────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      group: 'info',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'info',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),

    // ── Active ────────────────────────────────────────────────────────────────
    defineField({
      name: 'active',
      title: 'Aktiv',
      type: 'boolean',
      group: 'info',
      description: 'Kun aktive bonusser vises i sammenligningslister',
      initialValue: false,
    }),

    // ── Bookmaker relation ────────────────────────────────────────────────────
    defineField({
      name: 'bookmaker',
      title: 'Bookmaker',
      type: 'reference',
      group: 'info',
      to: [{ type: 'bookmaker' }],
      description: 'Hvilken bookmaker hører denne bonus til?',
    }),

    // ── Core bonus fields ─────────────────────────────────────────────────────
    defineField({
      name: 'casinoNavn',
      title: 'Casino navn',
      type: 'string',
      group: 'info',
    }),
    defineField({
      name: 'casinoLogo',
      title: 'Casino logo',
      type: 'image',
      group: 'info',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' })],
    }),
    defineField({
      name: 'oddsBonusTitel',
      title: 'Odds bonus titel',
      type: 'string',
      group: 'info',
      description: 'F.eks. "Få 500 kr. i freebet" — vises i sammenligningskortet',
    }),
    defineField({
      name: 'offerUrl',
      title: 'Offer URL',
      type: 'url',
      group: 'info',
      description: 'Affiliate link til bonustilbuddet',
    }),
    defineField({
      name: 'minimumOdds',
      title: 'Minimum odds',
      type: 'string',
      group: 'info',
      description: 'F.eks. "1.70"',
    }),

    // ── Bonus details ─────────────────────────────────────────────────────────
    defineField({
      name: 'minimumIndbetaling',
      title: 'Minimum indbetaling (kr.)',
      type: 'number',
      group: 'details',
    }),
    defineField({
      name: 'gennemspilskrav',
      title: 'Gennemspilskrav',
      type: 'string',
      group: 'details',
      description: 'F.eks. "x10" eller "Ingen"',
    }),
    defineField({
      name: 'spinVaerdi',
      title: 'Spin værdi',
      type: 'string',
      group: 'details',
      description: 'F.eks. "1 kr. pr. spin"',
    }),
    defineField({
      name: 'maksGevinst',
      title: 'Maks gevinst',
      type: 'string',
      group: 'details',
      description: 'F.eks. "500 kr." eller "Ubegrænset"',
    }),
    defineField({
      name: 'terms',
      title: 'Vilkår og betingelser',
      type: 'text',
      rows: 3,
      group: 'details',
    }),
    defineField({
      name: 'bonuskode',
      title: 'Bonuskode',
      type: 'string',
      group: 'details',
    }),

    // ── Campaign ──────────────────────────────────────────────────────────────
    defineField({
      name: 'kampagneBillede',
      title: 'Kampagne billede',
      type: 'image',
      group: 'details',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' })],
    }),
    defineField({
      name: 'kampagneStart',
      title: 'Kampagne start',
      type: 'datetime',
      group: 'details',
    }),
    defineField({
      name: 'kampagneSlut',
      title: 'Kampagne slut',
      type: 'datetime',
      group: 'details',
    }),

    // ── Page content ──────────────────────────────────────────────────────────
    { ...bodyField, group: 'content' } as any,

    // ── SEO ───────────────────────────────────────────────────────────────────
    defineField({ name: 'metaTitle',       title: 'Meta titel',      type: 'string',                    group: 'seo' }),
    defineField({ name: 'metaDescription', title: 'Meta beskrivelse', type: 'text', rows: 3,            group: 'seo' }),
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
    select: {
      title:    'title',
      subtitle: 'casinoNavn',
      media:    'casinoLogo',
    },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: subtitle || '', media }
    },
  },
})
