import { defineConfig } from 'sanity'
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

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Indhold')
          .items([
            // Singletons
            S.listItem()
              .title('🏠 Forside')
              .id('homepage')
              .child(
                S.document()
                  .schemaType('homepage')
                  .documentId('homepage')
              ),
            S.listItem()
              .title('⚙️ Siteindstillinger')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            S.divider(),
            S.listItem()
              .title('🎰 Casino Reviews')
              .schemaType('bookmaker')
              .child(S.documentTypeList('bookmaker').title('Casino Reviews')),
            S.listItem()
              .title('🎁 Bonusser')
              .schemaType('bonus')
              .child(S.documentTypeList('bonus').title('Alle bonusser')),
            S.listItem()
              .title('📊 Sammenligningsskabeloner')
              .schemaType('comparisonTableTemplate')
              .child(S.documentTypeList('comparisonTableTemplate').title('Skabeloner')),
            S.divider(),
            S.listItem()
              .title('📝 Indlæg')
              .schemaType('post')
              .child(S.documentTypeList('post').title('Alle indlæg')),
            S.listItem()
              .title('📄 Sider')
              .schemaType('page')
              .child(S.documentTypeList('page').title('Alle sider')),
            S.listItem()
              .title('💳 Payment Methods')
              .schemaType('paymentMethod')
              .child(S.documentTypeList('paymentMethod').title('Payment Methods')),
            S.listItem()
              .title('🎮 Software')
              .schemaType('software')
              .child(S.documentTypeList('software').title('Software Providers')),
            S.divider(),
            S.listItem()
              .title('🔗 Redirects / Go-links')
              .schemaType('redirect')
              .child(S.documentTypeList('redirect').title('Alle redirects')),
            S.divider(),
            S.listItem()
              .title('👤 Forfattere')
              .schemaType('author')
              .child(S.documentTypeList('author').title('Forfattere')),
            S.listItem()
              .title('🏷️ Kategorier')
              .schemaType('category')
              .child(S.documentTypeList('category').title('Kategorier')),
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
      const PREVIEW_TYPES = ['homepage', 'post', 'page', 'bookmaker', 'bonus']
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
