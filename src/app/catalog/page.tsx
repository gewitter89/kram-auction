'use client'

import { Suspense } from 'react'
import CatalogContent from '@/components/catalog/CatalogContent'

function CatalogSSRShell() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] py-10">
      <div className="max-w-[1320px] mx-auto px-4">
        
        {/* Breadcrumbs */}
        <div className="text-[12px] text-slate-400 mb-4 font-semibold">
          Головна / Каталог лотів
        </div>

        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#0B1220] tracking-tight mb-2">
              Каталог активних лотів
            </h1>
            <p className="text-[#475569] text-[14px]">
              Знайдіть вигідні пропозиції або створіть власний лот безкоштовно та без комісії.
            </p>
          </div>
          
          <a
            href="/sell"
            className="h-11 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-[13.5px] font-bold transition-all shadow-md shadow-[#2563EB]/10 inline-flex items-center justify-center w-fit shrink-0"
          >
            + Створити перший лот
          </a>
        </div>

        {/* Category Chips Mockup */}
        <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-slate-100">
          {[
            'Всі лоти', 'Електроніка', 'Ноутбуки', 'Телефони', 'Авто', 'Одяг', 
            'Дім', 'Дитячі', 'Спорт', 'Книги', 'Колекції', 'Інструменти', 'Ігри'
          ].map((cat, i) => (
            <span
              key={i}
              className={`h-9 px-4 rounded-xl text-[12.5px] font-bold flex items-center justify-center border transition-all ${
                i === 0 
                  ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm' 
                  : 'bg-white border-[#E2E8F0] text-[#0B1220]'
              }`}
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Grid and listings placeholder */}
        <div className="grid md:grid-cols-[260px_1fr] gap-8">
          {/* Mock filters */}
          <div className="hidden md:block space-y-6 bg-white border border-[#E2E8F0] rounded-2xl p-5 h-fit shadow-sm">
            <div className="font-extrabold text-[14px] text-[#0B1220] pb-2 border-b border-slate-100">Фільтри</div>
            <div className="space-y-2">
              <span className="text-[11px] text-[#94A3B8] font-bold uppercase block">Тип лота</span>
              <div className="h-5 bg-slate-100 rounded w-3/4 animate-pulse" />
              <div className="h-5 bg-slate-100 rounded w-1/2 animate-pulse" />
            </div>
            <div className="space-y-2">
              <span className="text-[11px] text-[#94A3B8] font-bold uppercase block">Ціна</span>
              <div className="h-8 bg-slate-100 rounded w-full animate-pulse" />
            </div>
          </div>

          {/* Catalog content list mockup */}
          <div>
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center shadow-sm">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                🔍
              </div>
              <h3 className="text-[16.5px] font-extrabold text-[#0B1220] mb-2">Завантаження активних оголошень...</h3>
              <p className="text-slate-400 text-[13px] max-w-sm mx-auto mb-6 leading-relaxed">
                Зачекайте секунду, ми синхронізуємо ставки та завантажуємо лоти з бази даних.
              </p>
              <div className="inline-flex gap-3 justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#2563EB] animate-spin" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogSSRShell />}>
      <CatalogContent />
    </Suspense>
  )
}
