'use client'

import { useEffect } from 'react'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { GlobalNotifier } from '@/components/layout/GlobalNotifier'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. Wipe any old caches from Cache Storage to force fresh fetches
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            console.log('Clearing old Cache Storage:', key)
            return caches.delete(key)
          })
        )
      }).catch(err => console.error('Error clearing Cache Storage:', err))
    }

    // 2. Unregister any service workers that might be intercepting requests
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          console.log('Unregistering Service Worker:', registration)
          registration.unregister()
        }
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

