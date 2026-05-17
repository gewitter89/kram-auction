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
  BetaBanner,
  EmailCollectionSection,
} from '@/components/home/TelegramSection'

export default function HomePage() {
  return (
    <div className="bg-[#FAFBFD]">
      {/* Beta banner - at the top */}
      <BetaBanner />

      {/* Hero with live auction mockup */}
      <HeroSection />

      {/* Live auctions section with active lists */}
      <LiveAuctionsNow />

      {/* How it works - simple steps */}
      <HowItWorksSimple />

      {/* Trust and safety badges */}
      <TrustSectionUpdated />

      {/* Categories grid */}
      <CategoriesSection />

      {/* PWA 3D smartphone installation section */}
      <MobileAppsTeaser />

      {/* FAQ */}
      <FAQSection />

      {/* Waitlist and early-access email collection */}
      <EmailCollectionSection />

      {/* Beautiful dark corporate footer */}
      <Footer />
    </div>
  )
}
