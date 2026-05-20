'use client'

import { Footer } from '@/components/layout/Footer'
import { MarketplaceShowcase } from '@/components/home/MarketplaceShowcase'
import {
  MobileAppsTeaser,
  FAQSection,
  EmailCollectionSection,
} from '@/components/home/TelegramSection'

export default function HomePage() {
  return (
    <div className="bg-[#FAFBFD]">
      <MarketplaceShowcase />
      <MobileAppsTeaser />
      <FAQSection />
      <EmailCollectionSection />
      <Footer />
    </div>
  )
}
