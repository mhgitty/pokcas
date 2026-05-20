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
    default: 'Pokcas — Danmarks bedste casino guide',
    template: '%s | Pokcas.com',
  },
  description: 'Find de bedste online casinoer og casino bonusser i Danmark. Vi tester, anmelder og sammenligner alle store casinoer.',
  keywords: ['casino bonus', 'online casino', 'gratis spins', 'velkomstbonus', 'casino anmeldelse', 'bedste casino Danmark'],
  alternates: { canonical: BASE + '/' },
  openGraph: {
    siteName: 'Pokcas.com',
    locale: 'da_DK',
    type: 'website',
    url: BASE,
    title: 'Pokcas — Danmarks bedste casino guide',
    description: 'Find de bedste online casinoer og casino bonusser i Danmark.',
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
    <html lang="da" className={figtree.variable}>
      <body>{children}</body>
    </html>
  )
}
