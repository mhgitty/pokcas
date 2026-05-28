import { defineConfig, type InitialValueTemplateItem } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { schemaTypes } from './src/sanity/schemas'
import { WideStudioLayout } from './src/sanity/StudioLayout'
import { previewAction } from './src/sanity/previewAction'

export default defineConfig({
  name: 'default',
  title: 'Pokcas.com',
  basePath: '/studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  // Market-aware initial value templates so new pages created inside a market
  // section automatically get the correct market pre-filled.
  templates: (prev: InitialValueTemplateItem[]) => [
    ...prev,
    { id: 'page-global', title: '📄 Page (Global)',    schemaType: 'page', value: { market: 'global' } },
    { id: 'page-ca',     title: '📄 Page (Canada)',    schemaType: 'page', value: { market: 'ca' } },
    { id: 'page-au',     title: '📄 Page (Australia)', schemaType: 'page', value: { market: 'au' } },
  ],

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Indhold')
          .items([
            // ── Singletons ──────────────────────────────────────────────────
            S.listItem()
              .title('🏠 Homepage')
              .id('homepage')
              .child(
                S.document()
                  .schemaType('homepage')
                  .documentId('homepage')
              ),
            S.listItem()
              .title('⚙️ Site Settings')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            S.divider(),

            // ── 🌍 Global ────────────────────────────────────────────────────
            S.listItem()
              .title('🌍 Global')
              .child(
                S.list()
                  .title('🌍 Global')
                  .items([
                    S.listItem()
                      .title('🎰 Casino Reviews')

                      .schemaType('bookmaker')
                      .child(
                        S.documentTypeList('bookmaker')
                          .title('Casino Reviews — Global')
                          .filter('_type == "bookmaker" && market == $market')
                          .params({ market: 'global' })
                      ),
                    S.listItem()
                      .title('🎁 Bonuses')
                      .schemaType('bonus')
                      .child(
                        S.documentTypeList('bonus')
                          .title('Bonuses — Global')
                          .filter('_type == "bonus" && market == $market')
                          .params({ market: 'global' })
                      ),
                    S.listItem()
                      .title('📄 Pages')
                      .schemaType('page')
                      .child(
                        S.documentTypeList('page')
                          .title('Pages — Global')
                          .filter('_type == "page" && (market == $market || !defined(market))')
                          .params({ market: 'global' })
                      ),
                    S.listItem()
                      .title('💳 Payment Methods')
                      .schemaType('paymentMethod')
                      .child(
                        S.documentTypeList('paymentMethod')
                          .title('Payment Methods — Global')
                          .filter('_type == "paymentMethod" && market == $market')
                          .params({ market: 'global' })
                      ),
                    S.listItem()
                      .title('🎮 Software')
                      .schemaType('software')
                      .child(
                        S.documentTypeList('software')
                          .title('Software — Global')
                          .filter('_type == "software" && market == $market')
                          .params({ market: 'global' })
                      ),
                    S.listItem()
                      .title('🎲 Casino Games')
                      .schemaType('casinoGame')
                      .child(
                        S.documentTypeList('casinoGame')
                          .title('Casino Games — Global')
                          .filter('_type == "casinoGame" && market == $market')
                          .params({ market: 'global' })
                      ),
                  ])
              ),

            // ── 🇨🇦 Canada ───────────────────────────────────────────────────
            S.listItem()
              .title('🇨🇦 Canada')
              .child(
                S.list()
                  .title('🇨🇦 Canada')
                  .items([
                    S.listItem()
                      .title('🏠 Homepage')
                      .id('ca-homepage')
                      .child(
                        S.document()
                          .schemaType('countryHomepage')
                          .documentId('ca-homepage')
                      ),
                    S.listItem()
                      .title('⚙️ Menu Settings')
                      .id('ca-settings')
                      .child(
                        S.document()
                          .schemaType('marketSettings')
                          .documentId('ca-settings')
                      ),
                    S.divider(),
                    S.listItem()
                      .title('🎰 Casino Reviews')
                      .schemaType('bookmaker')
                      .child(
                        S.documentTypeList('bookmaker')
                          .title('Casino Reviews — Canada')
                          .filter('_type == "bookmaker" && market == $market')
                          .params({ market: 'ca' })
                      ),
                    S.listItem()
                      .title('🎁 Bonuses')
                      .schemaType('bonus')
                      .child(
                        S.documentTypeList('bonus')
                          .title('Bonuses — Canada')
                          .filter('_type == "bonus" && market == $market')
                          .params({ market: 'ca' })
                      ),
                    S.listItem()
                      .title('📄 Pages')
                      .schemaType('page')
                      .child(
                        S.documentTypeList('page')
                          .title('Pages — Canada')
                          .filter('_type == "page" && market == $market')
                          .params({ market: 'ca' })
                      ),
                    S.listItem()
                      .title('💳 Payment Methods')
                      .schemaType('paymentMethod')
                      .child(
                        S.documentTypeList('paymentMethod')
                          .title('Payment Methods — Canada')
                          .filter('_type == "paymentMethod" && market == $market')
                          .params({ market: 'ca' })
                      ),
                    S.listItem()
                      .title('🎮 Software')
                      .schemaType('software')
                      .child(
                        S.documentTypeList('software')
                          .title('Software — Canada')
                          .filter('_type == "software" && market == $market')
                          .params({ market: 'ca' })
                      ),
                    S.listItem()
                      .title('🎲 Casino Games')
                      .schemaType('casinoGame')
                      .child(
                        S.documentTypeList('casinoGame')
                          .title('Casino Games — Canada')
                          .filter('_type == "casinoGame" && market == $market')
                          .params({ market: 'ca' })
                      ),
                    S.listItem()
                      .title('🔗 Redirects')
                      .schemaType('redirect')
                      .child(
                        S.documentTypeList('redirect')
                          .title('Redirects — Canada (/ca/go/...)')
                          .filter('_type == "redirect" && market == $market')
                          .params({ market: 'ca' })
                      ),
                  ])
              ),

            // ── 🇦🇺 Australia ────────────────────────────────────────────────
            S.listItem()
              .title('🇦🇺 Australia')
              .child(
                S.list()
                  .title('🇦🇺 Australia')
                  .items([
                    S.listItem()
                      .title('🏠 Homepage')
                      .id('au-homepage')
                      .child(
                        S.document()
                          .schemaType('countryHomepage')
                          .documentId('au-homepage')
                      ),
                    S.listItem()
                      .title('⚙️ Menu Settings')
                      .id('au-settings')
                      .child(
                        S.document()
                          .schemaType('marketSettings')
                          .documentId('au-settings')
                      ),
                    S.divider(),
                    S.listItem()
                      .title('🎰 Casino Reviews')
                      .schemaType('bookmaker')
                      .child(
                        S.documentTypeList('bookmaker')
                          .title('Casino Reviews — Australia')
                          .filter('_type == "bookmaker" && market == $market')
                          .params({ market: 'au' })
                      ),
                    S.listItem()
                      .title('🎁 Bonuses')
                      .schemaType('bonus')
                      .child(
                        S.documentTypeList('bonus')
                          .title('Bonuses — Australia')
                          .filter('_type == "bonus" && market == $market')
                          .params({ market: 'au' })
                      ),
                    S.listItem()
                      .title('📄 Pages')
                      .schemaType('page')
                      .child(
                        S.documentTypeList('page')
                          .title('Pages — Australia')
                          .filter('_type == "page" && market == $market')
                          .params({ market: 'au' })
                      ),
                    S.listItem()
                      .title('💳 Payment Methods')
                      .schemaType('paymentMethod')
                      .child(
                        S.documentTypeList('paymentMethod')
                          .title('Payment Methods — Australia')
                          .filter('_type == "paymentMethod" && market == $market')
                          .params({ market: 'au' })
                      ),
                    S.listItem()
                      .title('🎮 Software')
                      .schemaType('software')
                      .child(
                        S.documentTypeList('software')
                          .title('Software — Australia')
                          .filter('_type == "software" && market == $market')
                          .params({ market: 'au' })
                      ),
                    S.listItem()
                      .title('🎲 Casino Games')
                      .schemaType('casinoGame')
                      .child(
                        S.documentTypeList('casinoGame')
                          .title('Casino Games — Australia')
                          .filter('_type == "casinoGame" && market == $market')
                          .params({ market: 'au' })
                      ),
                    S.listItem()
                      .title('🔗 Redirects')
                      .schemaType('redirect')
                      .child(
                        S.documentTypeList('redirect')
                          .title('Redirects — Australia (/au/go/...)')
                          .filter('_type == "redirect" && market == $market')
                          .params({ market: 'au' })
                      ),
                  ])
              ),

            S.divider(),

            // ── Shared / global content ──────────────────────────────────────
            S.listItem()
              .title('📝 Posts')
              .schemaType('post')
              .child(S.documentTypeList('post').title('All Posts')),
            S.listItem()
              .title('📊 Comparison Templates')
              .schemaType('comparisonTableTemplate')
              .child(S.documentTypeList('comparisonTableTemplate').title('Templates')),
            S.listItem()
              .title('🔗 Redirects')
              .schemaType('redirect')
              .child(
                S.documentTypeList('redirect')
                  .title('Redirects — Global (/go/...)')
                  .filter('_type == "redirect" && (market == "global" || !defined(market))')
              ),
            S.listItem()
              .title('↩ 301 Redirects')
              .schemaType('pageRedirect')
              .child(
                S.documentTypeList('pageRedirect')
                  .title('301 Redirects')
                  .defaultOrdering([{ field: 'from', direction: 'asc' }])
              ),
            S.divider(),
            S.listItem()
              .title('👤 Authors')
              .schemaType('author')
              .child(S.documentTypeList('author').title('Authors')),
            S.listItem()
              .title('🏷️ Categories')
              .schemaType('category')
              .child(S.documentTypeList('category').title('Categories')),
          ]),
    }),
    visionTool(),
    media(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, ctx) => {
      const PREVIEW_TYPES = ['homepage', 'post', 'page', 'bookmaker', 'bonus', 'paymentMethod', 'software', 'countryHomepage', 'casinoGame']
      if (PREVIEW_TYPES.includes(ctx.schemaType)) {
        return [previewAction, ...prev]
      }
      return prev
    },
  },

  studio: {
    components: {
      layout: WideStudioLayout,
    },
  },
})
