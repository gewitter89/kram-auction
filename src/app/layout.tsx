import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientLayout } from '@/components/layout/ClientLayout'
import { siteUrl } from '@/lib/site-url'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'KRAM — український маркетплейс безпечних угод',
  description: 'Купуйте, продавайте й торгуйтесь на KRAM: лоти, ставки, доставка, сповіщення та прозорий статус угоди. Чесні торги без зайвого ризику.',
  keywords: ['аукціон Україна', 'маркетплейс безпечних угод', 'продати товар онлайн', 'купити товар аукціон', 'безпечна угода', 'KRAM аукціон'],
  authors: [{ name: 'KRAM Team' }],
  creator: 'KRAM',
  publisher: 'KRAM',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KRAM — український маркетплейс безпечних угод',
    description: 'Купуйте, продавайте й торгуйтесь: лоти, ставки, доставка, сповіщення та прозорий статус угоди.',
    type: 'website',
    locale: 'uk_UA',
    siteName: 'KRAM',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KRAM — український маркетплейс безпечних угод',
    description: 'Купуйте, продавайте й торгуйтесь: лоти, ставки, доставка, сповіщення та прозорий статус угоди.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/kram-mark.svg',
    shortcut: '/kram-mark.svg',
    apple: '/kram-mark.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" suppressHydrationWarning translate="no" className="notranslate">
      <head>
        <meta name="google" content="notranslate" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563EB" />
      </head>
      <body className={`${inter.className} bg-[#F8FAFC] min-h-screen`} suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
