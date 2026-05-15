'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShieldCheck, TrendingUp, Users, Truck } from 'lucide-react'

const liveCards = [
  {
    title: 'MacBook Air M2 256GB',
    price: 32000,
    image: 'https://placehold.co/400x300/F1F5F9/2563EB?text=MacBook+M2',
    bidders: 45,
    seller: 'MacTrader',
    verified: true,
    timeLeft: 8639, // seconds
    recentBid: '+200₴',
    rotate: -3,
    offset: 0,
    z: 30,
  },
  {
    title: 'iPhone 14 Pro Deep Purple',
    price: 18500,
    image: 'https://placehold.co/400x300/F1F5F9/0B1220?text=iPhone+14',
    bidders: 32,
    seller: 'AppleZone',
    verified: true,
    timeLeft: 18000,
    recentBid: '+500₴',
    rotate: 2,
    offset: 24,
    z: 20,
  },
  {
    title: 'PlayStation 5',
    price: 12800,
    image: 'https://placehold.co/400x300/F1F5F9/10B981?text=PS5',
    bidders: 24,
    seller: 'GameHub',
    verified: false,
    timeLeft: 3600,
    recentBid: '+100₴',
    rotate: -2,
    offset: 48,
    z: 10,
  },
]

export function HeroSection() {
  const [activeCard, setActiveCard] = useState(0)
  const [bidPulse, setBidPulse] = useState<number | null>(null)
  const [activeLots, setActiveLots] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => setActiveLots(d.activeLots ?? 0))
  }, [])

  useEffect(() => {
    const i = setInterval(() => {
      setActiveCard(prev => (prev + 1) % 3)
      setBidPulse(Math.floor(Math.random() * 3))
      setTimeout(() => setBidPulse(null), 1200)
    }, 3500)
    return () => clearInterval(i)
  }, [])

  return (
    <section className="relative bg-white overflow-hidden border-b border-[#E2E8F0]">
      {/* Background mesh */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `linear-gradient(#0B1220 1px, transparent 1px), linear-gradient(90deg, #0B1220 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="relative max-w-[1320px] mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          {/* LEFT */}
          <div>
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 h-8 px-3 bg-[#ECFDF5] border border-[#10B981]/20 rounded-full mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              <span className="text-[12px] font-semibold text-[#047857]">
                {activeLots === null ? '...' : activeLots > 0 ? `${activeLots.toLocaleString('uk-UA')} активних лотів` : 'Перший запуск — будьте першим!'}
              </span>
            </div>

            <h1 className="text-[36px] md:text-[52px] font-bold text-[#0B1220] leading-[1.05] tracking-[-0.03em] mb-5">
              Торги, де виграє<br/>
              <span className="gradient-text-premium">чесна ціна</span>
            </h1>

            <p className="text-[16px] md:text-[18px] text-[#64748B] leading-relaxed mb-8 max-w-[480px]">
              Купуйте, продавайте й змагайтесь за найкращу ціну на українському маркетплейсі чесних торгів.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/catalog"
                className="h-12 px-7 inline-flex items-center bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#2563EB]/30">
                Переглянути лоти
              </Link>
              <Link href="/sell"
                className="h-12 px-7 inline-flex items-center bg-white text-[#0B1220] border border-[#E2E8F0] rounded-xl text-[15px] font-semibold hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all">
                Створити лот
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Безпечна угода</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#2563EB]" />
                <span>Перевірені продавці</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#F59E0B]" />
                <span>Нова Пошта</span>
              </div>
            </div>
          </div>

          {/* RIGHT - Live Auction Cards */}
          <div className="hidden lg:block relative h-[480px]">
            {liveCards.map((card, i) => {
              const isActive = activeCard === i
              const isPulsing = bidPulse === i
              return (
                <div
                  key={i}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] transition-all duration-700"
                  style={{
                    transform: `translate(-50%, ${card.offset + (isActive ? -8 : 0)}px) rotate(${isActive ? 0 : card.rotate}deg) scale(${isActive ? 1 : 0.94})`,
                    zIndex: isActive ? 40 : card.z,
                    opacity: isActive ? 1 : 0.85,
                  }}
                >
                  <div className={`bg-white border border-[#E2E8F0] rounded-2xl p-4 ${isActive ? 'shadow-premium' : 'shadow-card'} transition-shadow`}>
                    {/* Live indicator */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]"></span>
                        </span>
                        <span className="text-[10px] font-bold text-[#EF4444] uppercase tracking-wide">LIVE</span>
                      </div>
                      {card.verified && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#EFF6FF] rounded-full">
                          <ShieldCheck className="w-2.5 h-2.5 text-[#2563EB]" />
                          <span className="text-[10px] font-semibold text-[#2563EB]">Перевірений</span>
                        </div>
                      )}
                    </div>

                    {/* Image */}
                    <div className="aspect-[16/10] bg-[#F1F5F9] rounded-xl overflow-hidden mb-3 relative">
                      <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 h-16 gradient-card-bottom" />
                      <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 h-5 px-2 bg-white/95 backdrop-blur-sm rounded-md">
                        <Truck className="w-2.5 h-2.5 text-[#10B981]" />
                        <span className="text-[10px] font-medium text-[#10B981]">Нова Пошта</span>
                      </div>
                      {/* Bid pulse */}
                      {isPulsing && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-[#10B981] text-white rounded-md text-[10px] font-bold animate-fade-in">
                          {card.recentBid}
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-[14px] font-semibold text-[#0F172A] mb-2 truncate">{card.title}</h3>

                    {/* Price + Timer */}
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <p className="text-[10px] text-[#94A3B8] mb-0.5">Поточна ставка</p>
                        <p className="text-[20px] font-bold text-[#0F172A]">
                          {card.price.toLocaleString('uk-UA')} ₴
                        </p>
                      </div>
                      <CountdownDisplay seconds={card.timeLeft} />
                    </div>

                    {/* Bottom info */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> {card.bidders} ставок
                        </span>
                      </div>
                      <span className="text-[11px] text-[#64748B]">@{card.seller}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Floating activity ticker */}
            <div className="absolute -bottom-4 left-0 right-0 flex justify-center">
              <ActivityTicker />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CountdownDisplay({ seconds }: { seconds: number }) {
  const [s, setS] = useState(seconds)
  useEffect(() => {
    const i = setInterval(() => setS(prev => Math.max(0, prev - 1)), 1000)
    return () => clearInterval(i)
  }, [])
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const isUrgent = s < 3600
  return (
    <div className={`px-2 py-1 rounded-md ${isUrgent ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-[#F8FAFC] text-[#64748B]'}`}>
      <p className="text-[10px] font-medium opacity-70">Залишилось</p>
      <p className="text-[12px] font-bold font-mono">
        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(sec).padStart(2, '0')}
      </p>
    </div>
  )
}

function ActivityTicker() {
  const activities = [
    'user***73 поставив ставку на MacBook',
    'tech***02 виграв аукціон',
    'buyer***45 додав в обране',
    'pro***88 створив лот Canon EOS',
  ]
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI(prev => (prev + 1) % activities.length), 2500)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-full pl-2 pr-4 py-1.5 shadow-card flex items-center gap-2 max-w-[280px]">
      <span className="flex-shrink-0 w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center">
        <TrendingUp className="w-3 h-3 text-white" />
      </span>
      <span className="text-[11px] text-[#64748B] truncate animate-fade-in" key={i}>
        {activities[i]}
      </span>
      <span className="flex-shrink-0 text-[10px] text-[#94A3B8]">щойно</span>
    </div>
  )
}
