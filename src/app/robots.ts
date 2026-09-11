import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/studio/', '/api/'] }],
    sitemap: [
      'https://pokcas.com/sitemap.xml',
      'https://pokcas.com/sitemap-ca.xml',
      'https://pokcas.com/sitemap-au.xml',
    ],
  }
}
