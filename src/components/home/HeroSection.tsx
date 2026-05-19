'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShieldCheck, TrendingUp, Truck, Clock, Info, CheckCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const demoLots = [
  {
    title: 'Apple MacBook Air M2 8/256GB Space Gray',
    currentPrice: 32500,
    bidsCount: 14,
    timeLeft: '02:45:10',
    category: 'Електроніка',
    image: 'https://placehold.co/400x300/EFF6FF/2563EB?text=MacBook+Air',
    seller: 'Олександр К. (м. Київ)',
  },
  {
    title: 'Sony PlayStation 5 Slim 1TB White',
    currentPrice: 16800,
    bidsCount: 9,
    timeLeft: '06:12:45',
    category: 'Ігрові консолі',
    image: 'https://placehold.co/400x300/F0FDF4/10B981?text=PlayStation+5',
    seller: 'Дмитро В. (м. Львів)',
  }
]

export function HeroSection() {
  const [activeLots, setActiveLots] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setActiveLots(d.activeLots ?? 0))
      .catch(() => {})
  }, [])

  return (
    <section className="relative bg-[#FAFBFD] overflow-hidden border-b border-[#E2E8F0] py-16 lg:py-24">
      {/* Background Mesh */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-60" />

      <div className="relative max-w-[1320px] mx-auto px-4">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Core pitch */}
          <div className="flex flex-col text-center lg:text-left">
            {/* Live Indicator */}
            <div className="inline-flex items-center gap-2 h-8 px-3.5 bg-white border border-[#E2E8F0] rounded-full w-fit mx-auto lg:mx-0 mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              <span className="text-[12px] font-bold text-[#475569]">
                {activeLots === null ? 'Торги онлайн' : activeLots > 0 ? `${activeLots} активних лотів` : 'Торги активні'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-[34px] sm:text-[44px] lg:text-[52px] font-extrabold text-[#0B1220] leading-[1.1] tracking-[-0.03em] mb-6">
              KRAM — аукціони та оголошення з прозорими ставками
            </h1>

            {/* Subheadline */}
            <p className="text-[15.5px] sm:text-[16.5px] text-[#475569] leading-relaxed mb-8 max-w-[560px] mx-auto lg:mx-0">
              Продавці створюють лоти, покупці роблять ставки, а умови оплати й доставки сторони погоджують напряму. KRAM фіксує історію торгів і переписку без прийому платежів.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
              <Link
                href="/catalog"
                className="h-12 px-7 bg-[#2563EB] text-white rounded-xl text-[14.5px] font-bold hover:bg-[#1D4ED8] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#2563EB]/15 hover:shadow-lg hover:shadow-[#2563EB]/25"
              >
                Переглянути каталог
              </Link>
              <Link
                href="/sell"
                className="h-12 px-7 bg-white text-[#0B1220] border border-[#E2E8F0] rounded-xl text-[14.5px] font-bold hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all flex items-center justify-center gap-2"
              >
                Створити лот
              </Link>
              <a
                href={process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/kram_auction'}
                target="_blank"
                rel="noreferrer"
                className="h-12 px-7 bg-[#EFF6FF] text-[#2563EB] rounded-xl text-[14.5px] font-bold hover:bg-[#DBEAFE] transition-all flex items-center justify-center gap-2"
              >
                Наш Telegram
              </a>
            </div>

            {/* Trust Chips Grid */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 max-w-[560px]">
              <span className="inline-flex items-center gap-1.5 h-7 px-3 bg-white border border-[#E2E8F0] rounded-full text-[11px] font-semibold text-[#475569] shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                0% комісії на старті
              </span>
              <span className="inline-flex items-center gap-1.5 h-7 px-3 bg-[#EFF6FF] border border-[#2563EB]/10 rounded-full text-[11px] font-semibold text-[#2563EB]">
                <CheckCircle className="w-3.5 h-3.5" />
                Прозорі ставки
              </span>
              <span className="inline-flex items-center gap-1.5 h-7 px-3 bg-[#E8F5E9] border border-[#10B981]/10 rounded-full text-[11px] font-semibold text-[#10B981]">
                <TrendingUp className="w-3.5 h-3.5" />
                Telegram-сповіщення
              </span>
              <span className="inline-flex items-center gap-1.5 h-7 px-3 bg-white border border-[#E2E8F0] rounded-full text-[11px] font-semibold text-[#475569] shadow-sm">
                <Truck className="w-3.5 h-3.5 text-[#94A3B8]" />
                Доставка за домовленістю
              </span>
              <span className="inline-flex items-center gap-1.5 h-7 px-3 bg-[#FEF2F2] border border-[#EF4444]/10 rounded-full text-[11px] font-semibold text-[#EF4444]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Без оплати через KRAM
              </span>
            </div>
          </div>

          {/* RIGHT: Stacked Preview Mockups */}
          <div className="relative flex flex-col gap-5 justify-center">
            {/* Visual Header */}
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                <Info className="w-3 h-3" /> Приклад активних торгів
              </span>
              <span className="text-[10px] text-[#94A3B8]">
                Так виглядає прозора історія ціни
              </span>
            </div>

            {/* Stacked cards grid */}
            <div className="space-y-4">
              {demoLots.map((lot, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-card hover:border-[#2563EB]/25 hover:shadow-premium transition-all duration-300 relative overflow-hidden"
                >
                  {/* Left Sheen */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]/40" />

                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-[100px] h-[75px] rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                      <img src={lot.image} alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wide bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded-full shrink-0">
                          {lot.category}
                        </span>
                        <span className="text-[10px] font-bold text-[#EF4444] bg-[#FEF2F2] px-2 py-0.5 rounded-full uppercase tracking-wide">
Демо
                        </span>
                      </div>
                      
                      <h4 className="text-[13.5px] font-bold text-[#0B1220] truncate mb-2">
                        {lot.title}
                      </h4>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[9px] text-[#94A3B8] block uppercase tracking-wide">Поточна ціна</span>
                          <span className="text-[15px] font-extrabold text-[#0B1220]">{formatPrice(lot.currentPrice)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-right">
                          <div className="bg-[#FAFBFD] border border-slate-100 px-2 py-0.5 rounded-lg">
                            <span className="text-[9px] text-[#94A3B8] block uppercase tracking-wide text-center">Ставки</span>
                            <span className="text-[11px] font-bold text-[#2563EB] block text-center">{lot.bidsCount}</span>
                          </div>
                          <div className="bg-[#FEF2F2] border border-[#EF4444]/10 px-2 py-0.5 rounded-lg text-[#EF4444]">
                            <span className="text-[9px] block uppercase tracking-wide text-center">Час</span>
                            <span className="text-[11px] font-bold font-mono block flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> {lot.timeLeft}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Live activity feed card demo */}
            <div className="bg-white border border-[#E2E8F0] p-3 rounded-xl shadow-sm flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <p className="text-[12px] text-[#475569] leading-none">
                <span className="font-bold text-[#0B1220]">Дмитро В.</span> зробив ставку <span className="font-bold text-[#2563EB]">{formatPrice(16800)}</span> за PS5 Slim
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
