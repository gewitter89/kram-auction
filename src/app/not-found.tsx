'use client'

import Link from 'next/link'
import { Search, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-[480px]">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[120px] font-black text-[#F1F5F9] leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#2563EB] to-[#7C3AED] rounded-3xl flex items-center justify-center shadow-lg">
              <Search className="w-9 h-9 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-[26px] font-bold text-[#0B1220] mb-3">
          Сторінку не знайдено
        </h1>
        <p className="text-[15px] text-[#64748B] mb-8 leading-relaxed">
          Можливо, лот вже продано, посилання застаріло або сторінка була переміщена.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-[#2563EB] text-white rounded-xl text-[14px] font-semibold hover:bg-[#1D4ED8] transition-colors"
          >
            <Home className="w-4 h-4" />
            На головну
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-white text-[#0B1220] border border-[#E2E8F0] rounded-xl text-[14px] font-semibold hover:bg-[#F8FAFC] transition-colors"
          >
            <Search className="w-4 h-4" />
            Переглянути каталог
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
      </div>
    </div>
  )
}
