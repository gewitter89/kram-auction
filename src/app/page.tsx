'use client'

import { HeroSection } from '@/components/home/HeroSection'
import { StatsSection } from '@/components/home/StatsSection'
import { LiveActivityFeed } from '@/components/home/LiveActivityFeed'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { AuctionGrid } from '@/components/home/AuctionGrid'
import { HowItWorks } from '@/components/home/HowItWorks'
import { TrustSection } from '@/components/home/TrustSection'
import { Footer } from '@/components/layout/Footer'
import { EarlyAdopterBanner } from '@/components/home/EarlyAdopterBanner'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <EarlyAdopterBanner />
      <StatsSection />
      <CategoriesSection />
      <AuctionGrid title="Нові лоти" type="new" />
      <AuctionGrid title="Завершуються скоро" type="ending" />
      <LiveActivityFeed />
      <AuctionGrid title="Гарячі лоти" type="hot" />
      <HowItWorks />
      <TrustSection />
      <Footer />
    </div>
  )
}
