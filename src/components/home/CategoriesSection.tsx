'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Laptop, Smartphone, Wrench, Gamepad, Monitor, Camera } from 'lucide-react'

const initialCategories = [
  { name: 'Електроніка', slug: 'electronics', icon: Laptop, count: 0, gradient: 'from-blue-50 to-blue-100/50', iconColor: 'text-blue-600' },
  { name: 'Телефони', slug: 'phones', icon: Smartphone, count: 0, gradient: 'from-purple-50 to-purple-100/50', iconColor: 'text-purple-600' },
  { name: 'Ноутбуки', slug: 'laptops', icon: Monitor, count: 0, gradient: 'from-indigo-50 to-indigo-100/50', iconColor: 'text-indigo-600' },
  { name: 'Ігри та консолі', slug: 'games', icon: Gamepad, count: 0, gradient: 'from-cyan-50 to-cyan-100/50', iconColor: 'text-cyan-600' },
  { name: 'Фото/відео', slug: 'electronics', icon: Camera, count: 0, gradient: 'from-emerald-50 to-emerald-100/50', iconColor: 'text-emerald-600' },
  { name: 'Комплектуючі', slug: 'tools', icon: Wrench, count: 0, gradient: 'from-yellow-50 to-yellow-100/50', iconColor: 'text-yellow-600' },
]

export function CategoriesSection() {
  const [categories, setCategories] = useState(initialCategories)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => {
      if (d.categoryStats) {
        setCategories(prev => prev.map(cat => ({
          ...cat,
          count: d.categoryStats[cat.slug] || 0
        })))
      }
    }).catch(() => {})
  }, [])

  return (
    <section className="max-w-[1320px] mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 h-6 px-2.5 bg-[#EFF6FF] border border-[#2563EB]/10 rounded-full text-[10.5px] font-bold text-[#2563EB] uppercase tracking-wide mb-3">
            📂 Каталог лотів
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1220] tracking-tight mb-1">Категорії для перших лотів</h2>
          <p className="text-[#475569] text-[13.5px]">Оберіть напрям і створіть перший реальний лот без комісії</p>
        </div>
        <Link href="/catalog" className="text-[13px] font-bold text-[#2563EB] hover:underline">
          Всі категорії →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.slug}
              href={`/catalog?category=${cat.slug}`}
              className="group relative flex flex-col items-center gap-3 p-5 bg-white border border-[#E2E8F0] rounded-2xl hover:border-[#2563EB]/25 hover:shadow-premium transition-all duration-300"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${cat.gradient} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                <Icon className={`w-5.5 h-5.5 ${cat.iconColor}`} />
              </div>
              
              <div className="text-center">
                <p className="text-[13.5px] font-bold text-[#0B1220] leading-tight mb-1 group-hover:text-[#2563EB] transition-colors">{cat.name}</p>
                <p className="text-[11px] text-[#475569] font-medium">
                  {cat.count > 0 ? `${cat.count} лотів` : 'Очікує лоти'}
                </p>
              </div>

              {/* Action Hint on Hover */}
              <div className="absolute inset-0 bg-white/95 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 p-3">
                <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wide">Додати лот</span>
                <span className="text-[9px] text-[#94A3B8] text-center leading-snug">Станьте першим продавцем у цій категорії</span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
