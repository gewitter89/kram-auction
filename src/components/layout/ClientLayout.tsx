'use client'

import { SessionProvider } from '@/components/providers/SessionProvider'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Header />
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </SessionProvider>
  )
}
