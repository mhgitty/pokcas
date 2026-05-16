import type { Metadata } from 'next'
import './globals.css'

const BASE = 'https://pokcas.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'Pokcas — Sammenlign betting bonusser i Danmark',
    template: '%s | Pokcas.dk',
  },
  description: 'Find de bedste betting bonusser og bookmaker tilbud i Danmark. Vi sammenligner og anmelder alle store bookmakers.',
  keywords: ['betting bonus', 'bookmaker bonus', 'odds bonus', 'gratis spins', 'velkomstbonus', 'betting sider Danmark'],
  alternates: { canonical: BASE + '/' },
  openGraph: {
    siteName: 'Pokcas.dk',
    locale: 'da_DK',
    type: 'website',
    url: BASE,
    title: 'Pokcas — Sammenlign betting bonusser i Danmark',
    description: 'Find de bedste betting bonusser og bookmaker tilbud i Danmark.',
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
    <html lang="da">
      <body>{children}</body>
    </html>
  )
}
