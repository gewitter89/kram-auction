'use client'

import { useEffect } from 'react'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { GlobalNotifier } from '@/components/layout/GlobalNotifier'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DISABLE_PWA !== 'true') return

    // Emergency switch only. In normal production we keep the service worker/cache
    // because the homepage advertises KRAM as an installable PWA.
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(err => console.error('Error clearing Cache Storage:', err))
    }

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) registration.unregister()
      }).catch(err => console.error('Error unregistering Service Workers:', err))
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

