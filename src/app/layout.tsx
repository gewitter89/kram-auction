import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientLayout } from '@/components/layout/ClientLayout'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'KRAM — український маркетплейс чесних торгів',
  description: 'Купуйте й продавайте товари через живі аукціони з безпечною оплатою, перевіреними продавцями та доставкою Новою Поштою.',
  keywords: ['аукціон Україна', 'маркетплейс торгів Україна', 'продати техніку онлайн', 'купити техніку аукціон', 'безпечна угода Нова Пошта'],
  openGraph: {
    title: 'KRAM — український маркетплейс чесних торгів',
    description: 'Купуйте й продавайте товари через живі аукціони з безпечною оплатою та доставкою Новою Поштою.',
    type: 'website',
    locale: 'uk_UA',
  },
  icons: {
    icon: '/kram-mark.svg',
    shortcut: '/kram-mark.svg',
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
