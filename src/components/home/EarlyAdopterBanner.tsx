'use client'

import Link from 'next/link'
import { Rocket, ArrowRight, Star } from 'lucide-react'

export function EarlyAdopterBanner() {
  return (
    <section className="max-w-[1320px] mx-auto px-4 py-4">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0B1220] via-[#1E3A8A] to-[#0B1220] rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Animated background dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-64 h-64 bg-[#2563EB]/10 rounded-full -top-16 -left-16 blur-3xl" />
          <div className="absolute w-48 h-48 bg-[#7C3AED]/10 rounded-full -bottom-8 right-20 blur-2xl" />
        </div>

        <div className="relative flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold text-[#FCD34D] uppercase tracking-wider">Ранній доступ</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 text-[#FCD34D] fill-[#FCD34D]" />)}
              </div>
            </div>
            <p className="text-[13px] font-semibold text-white">
              KRAM запускається! Виставляйте перші лоти — <span className="text-[#60A5FA]">безкоштовно та без комісії</span>
            </p>
          </div>
        </div>

        <Link
          href="/sell"
          className="relative flex-shrink-0 flex items-center gap-2 h-9 px-5 bg-white text-[#0B1220] rounded-xl text-[13px] font-bold hover:bg-[#F1F5F9] transition-colors"
        >
          Виставити лот
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  )
}
