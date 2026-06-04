import { BonusHero } from '@/components/BonusHero'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { AuthorBio } from '@/components/AuthorBio'
import { JsonLd } from '@/components/JsonLd'
import { getBonusBySlugAu, getSiteSettings, client } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://pokcas.com'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const bonuses = await client.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "bonus" && market == "au" && active == true && defined(slug.current)] { slug }`
  ).catch(() => [])
  return bonuses.map((b) => ({ slug: b.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const bonus = await getBonusBySlugAu(slug).catch(() => null)
  if (!bonus) return {}
  const title = replaceDateVars(bonus.metaTitle || bonus.title)
  const description = replaceDateVars(bonus.metaDescription || '')
  const canonical = `${BASE}/au/online-casino/bonus/${slug}/`
  const img = bonus.ogImage?.url ? bonus.ogImage
    : bonus.kampagneBillede?.url ? bonus.kampagneBillede
    : bonus.casinoLogo?.url ? bonus.casinoLogo
    : null
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title, description, url: canonical, type: 'article',
      ...(img ? { images: [{ url: img.url, alt: img.alt || title }] } : {}),
    },
    twitter: {
      title, description,
      ...(img ? { images: [img.url] } : {}),
    },
  }
}

export default async function CaBonusSlugPage({ params }: Props) {
  const { slug } = await params
  const [bonus, settings] = await Promise.all([
    getBonusBySlugAu(slug).catch(() => null),
    getSiteSettings().catch(() => null),
  ])
  if (!bonus) notFound()
  const author = settings?.defaultAuthor ?? null

  const canonical = `${BASE}/au/online-casino/bonus/${slug}/`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Australia', item: `${BASE}/au/` },
          { '@type': 'ListItem', position: 3, name: 'Casino Bonuses', item: `${BASE}/au/online-casino/bonus/` },
          { '@type': 'ListItem', position: 4, name: bonus.title, item: canonical },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: bonus.title,
        inLanguage: 'en-AU',
        publisher: { '@type': 'Organization', name: 'Pokcas', url: BASE },
      },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <BonusHero
        bonusListHref="/au/online-casino/bonus/"
        title={bonus.title}
        casinoNavn={bonus.casinoNavn}
        logoUrl={bonus.casinoLogo?.url ?? bonus.bookmaker?.logo?.url ?? null}
        logoAlt={bonus.casinoLogo?.alt ?? bonus.bookmaker?.logo?.alt ?? null}
        offerUrl={bonus.offerUrl}
        terms={bonus.terms}
        minimumOdds={bonus.minimumOdds}
        minimumIndbetaling={bonus.minimumIndbetaling}
        gennemspilskrav={bonus.gennemspilskrav}
        maksGevinst={bonus.maksGevinst}
        bonuskode={bonus.bonuskode}
        spinVaerdi={bonus.spinVaerdi}
      />
      <div className="article-layout">
        <article className="article-content">
          {bonus.body && <PortableTextRenderer value={bonus.body} />}
        </article>
        {bonus.body && (
          <aside className="toc-sidebar">
            <TableOfContents body={bonus.body} />
          </aside>
        )}
      </div>
      {author && (
        <div className="section" style={{ paddingTop: '0' }}>
          <AuthorBio author={author} compact />
        </div>
      )}
    </>
  )
}
