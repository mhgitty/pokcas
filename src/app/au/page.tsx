import { HeroSection } from '@/components/HeroSection'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { HomeSections } from '@/components/HomeSections'
import { getCountryHomepage, getSiteSettings } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { AuthorBio } from '@/components/AuthorBio'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'
const CANONICAL = `${BASE}/au/`

export async function generateMetadata(): Promise<Metadata> {
  const hp = await getCountryHomepage('au').catch(() => null)
  const title = replaceDateVars(hp?.metaTitle || hp?.heroHeading || 'Best Online Casinos Australia')
  const description = replaceDateVars(hp?.metaDescription || hp?.intro || 'Find the best online casinos and bonuses for Australian players.')
  const img = hp?.ogImage?.url
  return {
    title,
    description,
    alternates: { canonical: CANONICAL },
    openGraph: { title, description, url: CANONICAL, ...(img ? { images: [{ url: img }] } : {}) },
  }
}

export default async function AuHomePage() {
  const [hp, settings] = await Promise.all([
    getCountryHomepage('au').catch(() => null),
    getSiteSettings().catch(() => null),
  ])

  const title = hp?.heroHeading || 'Best Online Casinos in Australia'
  const intro = hp?.intro || 'Expert reviews of the top Australian online casinos. Compare welcome bonuses, wagering requirements and ratings.'
  const author = settings?.defaultAuthor ?? null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Australia', item: CANONICAL },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${CANONICAL}#webpage`,
        url: CANONICAL,
        name: title,
        description: intro,
        inLanguage: 'en-AU',
        publisher: { '@type': 'Organization', name: 'Pokcas', url: BASE },
      },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <HeroSection
        title={title}
        intro={intro}
        author={author}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Australia' }]}
      />

      {hp?.sections?.length > 0 && (
        <HomeSections sections={hp.sections} market="au" />
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
