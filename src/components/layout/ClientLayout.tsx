'use client'

import { useEffect } from 'react'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { GlobalNotifier } from '@/components/layout/GlobalNotifier'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('PWA Service Worker registered:', reg.scope))
        .catch(err => console.error('PWA Service Worker registration failed:', err))
    }
  }, [])

  return (
    <SessionProvider>
      <Header />
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
      <GlobalNotifier />
    </SessionProvider>
  )
}
