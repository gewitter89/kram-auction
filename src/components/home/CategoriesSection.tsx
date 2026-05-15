'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Laptop, Smartphone, Car, Shirt, Home, Baby, Dumbbell, BookOpen, Wrench, Gamepad, Package, Monitor, TrendingUp } from 'lucide-react'

const initialCategories = [
  { name: 'Електроніка', slug: 'electronics', icon: Laptop, count: 0, gradient: 'from-blue-50 to-blue-100', iconColor: 'text-blue-600', trending: true },
  { name: 'Ноутбуки', slug: 'laptops', icon: Monitor, count: 0, gradient: 'from-indigo-50 to-indigo-100', iconColor: 'text-indigo-600' },
  { name: 'Телефони', slug: 'phones', icon: Smartphone, count: 0, gradient: 'from-purple-50 to-purple-100', iconColor: 'text-purple-600', trending: true },
  { name: 'Авто', slug: 'auto', icon: Car, count: 0, gradient: 'from-green-50 to-green-100', iconColor: 'text-green-600' },
  { name: 'Одяг', slug: 'fashion', icon: Shirt, count: 0, gradient: 'from-pink-50 to-pink-100', iconColor: 'text-pink-600' },
  { name: 'Дім', slug: 'home', icon: Home, count: 0, gradient: 'from-amber-50 to-amber-100', iconColor: 'text-amber-600' },
  { name: 'Дитячі', slug: 'kids', icon: Baby, count: 0, gradient: 'from-rose-50 to-rose-100', iconColor: 'text-rose-600' },
  { name: 'Спорт', slug: 'sport', icon: Dumbbell, count: 0, gradient: 'from-emerald-50 to-emerald-100', iconColor: 'text-emerald-600' },
  { name: 'Книги', slug: 'books', icon: BookOpen, count: 0, gradient: 'from-violet-50 to-violet-100', iconColor: 'text-violet-600' },
  { name: 'Колекції', slug: 'collections', icon: Package, count: 0, gradient: 'from-orange-50 to-orange-100', iconColor: 'text-orange-600' },
  { name: 'Інструменти', slug: 'tools', icon: Wrench, count: 0, gradient: 'from-yellow-50 to-yellow-100', iconColor: 'text-yellow-600' },
  { name: 'Ігри', slug: 'games', icon: Gamepad, count: 0, gradient: 'from-cyan-50 to-cyan-100', iconColor: 'text-cyan-600' },
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
    <section className="max-w-[1320px] mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[22px] font-bold text-[#0F172A] tracking-tight">Категорії</h2>
          <p className="text-[13px] text-[#64748B] mt-0.5">Знайдіть товари в популярних категоріях</p>
        </div>
        <Link href="/catalog" className="text-[13px] font-medium text-[#2563EB] hover:underline">
          Всі категорії →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.slug}
              href={`/catalog?category=${cat.slug}`}
              className="group relative flex flex-col items-center gap-3 p-4 bg-white border border-[#E2E8F0] rounded-2xl hover:border-[#2563EB]/30 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              {cat.trending && (
                <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#FEF2F2] rounded-full">
                  <TrendingUp className="w-2.5 h-2.5 text-[#EF4444]" />
                  <span className="text-[9px] font-bold text-[#EF4444]">HOT</span>
                </span>
              )}
              <div className={`w-12 h-12 bg-gradient-to-br ${cat.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${cat.iconColor}`} />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-[#0F172A] leading-tight">{cat.name}</p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">{cat.count > 0 ? `${cat.count} лотів` : 'Немає лотів'}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
