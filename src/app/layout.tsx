import type { Metadata } from 'next'
import { Figtree } from 'next/font/google'
import './globals.css'

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-figtree',
  display: 'swap',
})

const BASE = 'https://pokcas.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'Pokcas — Your International Casino Guide',
    template: '%s | Pokcas.com',
  },
  description: 'Find the best online casinos and casino bonuses. We test, review and compare all the top casinos.',
  keywords: ['casino bonus', 'online casino', 'free spins', 'welcome bonus', 'casino review', 'best casino'],
  alternates: { canonical: BASE + '/' },
  openGraph: {
    siteName: 'Pokcas.com',
    locale: 'en_US',
    type: 'website',
    url: BASE,
    title: 'Pokcas — Your International Casino Guide',
    description: 'Find the best online casinos and casino bonuses.',
  },
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  icons: {
    icon: [{ url: '/favicon.webp', type: 'image/webp' }],
    apple: '/favicon.webp',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={figtree.variable}>
      <body>{children}</body>
    </html>
  )
}
