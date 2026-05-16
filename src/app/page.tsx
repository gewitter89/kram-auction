'use client'

import { HeroSection } from '@/components/home/HeroSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { HowItWorks } from '@/components/home/HowItWorks'
import { TrustSection } from '@/components/home/TrustSection'
import { Footer } from '@/components/layout/Footer'
import {
  TelegramSection,
  EarlyAccessBanner,
  AIAssistantTeaser,
  ForSellersSection,
  HowItWorksSimple,
  LiveAuctionsNow,
  TrustSectionUpdated,
  MobileAppsTeaser,
  FAQSection,
  FinalCTA,
} from '@/components/home/TelegramSection'

export default function HomePage() {
  return (
    <div>
      {/* Hero with live auction mockup */}
      <HeroSection />

      {/* Launch cards - early access benefits */}
      <EarlyAccessBanner />

      {/* Live auctions section with empty state */}
      <LiveAuctionsNow />

      {/* How it works - 4 steps */}
      <HowItWorksSimple />

      {/* Trust and safety */}
      <TrustSectionUpdated />

      {/* For sellers and buyers */}
      <ForSellersSection />

      {/* Categories */}
      <CategoriesSection />

      {/* Telegram CTA */}
      <TelegramSection />

      {/* AI Assistant teaser */}
      <AIAssistantTeaser />

      {/* Mobile apps teaser */}
      <MobileAppsTeaser />

      {/* FAQ */}
      <FAQSection />

      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </div>
  )
}
