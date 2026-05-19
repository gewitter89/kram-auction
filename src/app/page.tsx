'use client'

import { HeroSection } from '@/components/home/HeroSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { Footer } from '@/components/layout/Footer'
import {
  TelegramSection,
  HowItWorksSimple,
  LiveAuctionsNow,
  MobileAppsTeaser,
  FAQSection,
  EmailCollectionSection,
} from '@/components/home/TelegramSection'

export default function HomePage() {
  return (
    <div className="bg-[#FAFBFD]">
      {/* 1. Hero Pitch & Stacked Interactive Mockups */}
      <HeroSection />

      {/* 2. Live Catalog Auction Cards Grid */}
      <LiveAuctionsNow />

      {/* 3. Direct deal safety walkthrough */}
      <HowItWorksSimple />

      {/* 4. Popular Marketplace Categories */}
      <CategoriesSection />

      {/* 5. Clean PWA Application Prompt */}
      <MobileAppsTeaser />

      {/* 6. Accordion direct deal FAQs */}
      <FAQSection />

      {/* 7. Premium Subscription & Telegram Alerts */}
      <EmailCollectionSection />

      {/* 8. Modern minimalist footer */}
      <Footer />
    </div>
  )
}
