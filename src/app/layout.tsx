import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientLayout } from '@/components/layout/ClientLayout'
import { siteUrl } from '@/lib/site-url'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563EB',
}

export const metadata: Metadata = {
  title: 'KRAM — чесні онлайн-торги для товарів в Україні',
  description: 'Створюйте лоти, робіть ставки та знаходьте покупців у beta-режимі. KRAM не приймає оплату через платформу — сторони домовляються напряму.',
  keywords: ['аукціон Україна', 'classified Україна', 'продати товар онлайн', 'купити товар аукціон', 'KRAM аукціон', 'beta запуск'],
  authors: [{ name: 'KRAM Team' }],
  creator: 'KRAM',
  publisher: 'KRAM',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KRAM — чесні онлайн-торги для товарів в Україні',
    description: 'Створюйте лоти, робіть ставки та знаходьте покупців у beta-режимі. KRAM не приймає оплату через платформу — сторони домовляються напряму.',
    type: 'website',
    locale: 'uk_UA',
    siteName: 'KRAM',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KRAM — чесні онлайн-торги для товарів в Україні',
    description: 'Створюйте лоти, робіть ставки та знаходьте покупців у beta-режимі. KRAM не приймає оплату через платформу — сторони домовляються напряму.',
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
  manifest: '/manifest.json',
  other: {
    google: 'notranslate'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" suppressHydrationWarning translate="no" className="notranslate">
      <body className={`${inter.className} bg-[#F8FAFC] min-h-screen`} suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
