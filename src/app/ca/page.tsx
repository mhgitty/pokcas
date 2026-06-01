import { CountryHero } from '@/components/CountryHero'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { HomeSections } from '@/components/HomeSections'
import { getCountryHomepage, getSiteSettings, getHreflangScript } from '@/lib/sanity'
import { HreflangHead } from '@/components/HreflangHead'
import { replaceDateVars } from '@/lib/dateVars'
import { AuthorBio } from '@/components/AuthorBio'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'
const CANONICAL = `${BASE}/ca/`

export async function generateMetadata(): Promise<Metadata> {
  const hp = await getCountryHomepage('ca').catch(() => null)
  const title = replaceDateVars(hp?.metaTitle || hp?.heroHeading || 'Best Online Casinos Canada')
  const description = replaceDateVars(hp?.metaDescription || hp?.intro || 'Find the best online casinos and bonuses for Canadian players.')
  const img = hp?.ogImage?.url
  return {
    title,
    description,
    alternates: { canonical: CANONICAL },
    openGraph: { title, description, url: CANONICAL, type: 'website', images: hp?.ogImage?.url ? [{ url: hp.ogImage.url }] : [{ url: `${BASE}/og.png` }] },
  }
}

export default async function CaHomePage() {
  const [hp, settings] = await Promise.all([
    getCountryHomepage('ca').catch(() => null),
    getSiteSettings().catch(() => null),
  ])

  const title = hp?.heroHeading || 'Best Online Casinos in Canada'
  const intro = hp?.intro || 'Expert reviews of the top Canadian online casinos. Compare welcome bonuses, wagering requirements and ratings.'
  const author = settings?.defaultAuthor ?? null
  const heroCards = hp?.heroCards ?? []
  const hreflangScript = await getHreflangScript('ca-homepage').catch(() => null)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Canada', item: CANONICAL },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${CANONICAL}#webpage`,
        url: CANONICAL,
        name: title,
        description: intro,
        inLanguage: 'en-CA',
        publisher: { '@type': 'Organization', name: 'Pokcas', url: BASE },
      },
    ],
  }

  return (
    <>
      <HreflangHead script={hreflangScript} />
      <JsonLd data={jsonLd} />
      <CountryHero
        title={title}
        intro={intro}
        heroCards={heroCards}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Canada' }]}
      />

      {hp?.sections?.length > 0 && (
        <HomeSections sections={hp.sections} market="ca" />
      )}

      {hp?.body && (
        <div className="section" style={{ paddingTop: 0 }}>
          <MobileToc body={hp.body} />
          <PortableTextRenderer value={hp.body} />
        </div>
      )}

      {author && (
        <div className="section" style={{ paddingTop: '0' }}>
          <AuthorBio author={author} compact />
        </div>
      )}
    </>
  )
}
