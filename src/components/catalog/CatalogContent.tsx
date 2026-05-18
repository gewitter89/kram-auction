'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { LotCard } from '@/components/lots/LotCard'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const categories = [
  { slug: 'all', name: 'Всі' },
  { slug: 'electronics', name: 'Електроніка' },
  { slug: 'phones', name: 'Телефони' },
  { slug: 'laptops', name: 'Ноутбуки' },
  { slug: 'auto', name: 'Авто' },
  { slug: 'fashion', name: 'Одяг' },
  { slug: 'home', name: 'Дім' },
  { slug: 'sport', name: 'Спорт' },
  { slug: 'tools', name: 'Інструменти' },
  { slug: 'games', name: 'Ігри' },
]

const cities = ['Київ', 'Харків', 'Одеса', 'Дніпро', 'Львів', 'Запоріжжя', 'Вінниця', 'Полтава']

export default function CatalogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [lots, setLots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [sort, setSort] = useState(searchParams.get('sort') || 'ending')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [condition, setCondition] = useState(searchParams.get('condition') || '')
  const [type, setType] = useState(searchParams.get('type') || '')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('sort', sort)
    if (search) params.set('search', search)
    if (category !== 'all') params.set('category', category)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (city) params.set('city', city)
    if (condition) params.set('condition', condition)
    if (type) params.set('type', type)

    fetch(`/api/lots?${params}`)
      .then(r => r.json())
      .then(data => {
        setLots(data.lots || [])
        setTotal(data.pagination?.total || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [search, category, sort, minPrice, maxPrice, city, condition, type, page])

  function transformLot(lot: any) {
    let images: string[] = []
    try { images = JSON.parse(lot.images || '[]') } catch {}
    return {
      id: lot.id,
      title: lot.title,
      currentPrice: lot.currentPrice,
      bids: lot._count?.bids || 0,
      endsAt: lot.endsAt,
      city: lot.city || 'Україна',
      seller: lot.seller?.name || 'Продавець',
      sellerRating: lot.seller?.rating || 0,
      image: images[0] || '',
      condition: lot.condition,
      type: lot.type,
      delivery: lot.delivery === 'nova_poshta',
      verified: lot.seller?.verified || false,
      featured: lot.featured || false,
    }
  }

  function clearFilters() {
    setSearch(''); setCategory('all'); setSort('ending')
    setMinPrice(''); setMaxPrice(''); setCity(''); setCondition(''); setType('')
    setPage(1)
  }

  const hasActiveFilters = search || category !== 'all' || minPrice || maxPrice || city || condition || type

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-6">
      {/* Search bar */}
      <div className="mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Пошук лотів, брендів, моделей..."
            className="w-full pl-11 pr-4 h-12 bg-white border border-[#E2E8F0] rounded-xl text-[14px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20"
          />
        </div>
      </div>

      {/* Categories pills */}
      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.slug}
            onClick={() => { setCategory(cat.slug); setPage(1) }}
            className={`flex-shrink-0 px-4 h-9 rounded-full text-[13px] font-medium border transition-colors ${
              category === cat.slug
                ? 'bg-[#0B1220] text-white border-[#0B1220]'
                : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#94A3B8]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-[260px] flex-shrink-0`}>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sticky top-[80px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-[#0F172A]">Фільтри</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-[12px] text-[#2563EB] hover:underline">
                  Скинути
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[12px] font-medium text-[#0F172A] mb-2">Ціна, ₴</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="від" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1) }}
                    className="h-9 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]" />
                  <input type="number" placeholder="до" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1) }}
                    className="h-9 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#0F172A] mb-2">Місто</label>
                <select value={city} onChange={e => { setCity(e.target.value); setPage(1) }}
                  className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]">
                  <option value="">Всі міста</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#0F172A] mb-2">Стан</label>
                <div className="space-y-1.5">
                  {[
                    { v: '', l: 'Будь-який' },
                    { v: 'new', l: 'Новий' },
                    { v: 'like_new', l: 'Як новий' },
                    { v: 'used', l: 'Вживаний' },
                  ].map(c => (
                    <label key={c.v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="condition" checked={condition === c.v} onChange={() => { setCondition(c.v); setPage(1) }}
                        className="w-4 h-4 accent-[#2563EB]" />
                      <span className="text-[13px] text-[#64748B]">{c.l}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#0F172A] mb-2">Тип продажу</label>
                <div className="space-y-1.5">
                  {[
                    { v: '', l: 'Всі' },
                    { v: 'auction', l: 'Аукціон' },
                    { v: 'buy_now', l: 'Купити зараз' },
                    { v: 'both', l: 'Обидва' },
                  ].map(t => (
                    <label key={t.v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="type" checked={type === t.v} onChange={() => { setType(t.v); setPage(1) }}
                        className="w-4 h-4 accent-[#2563EB]" />
                      <span className="text-[13px] text-[#64748B]">{t.l}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="text-[13px] text-[#64748B]">
              <strong className="text-[#0F172A]">{total}</strong> {total === 1 ? 'лот' : total >= 2 && total <= 4 ? 'лоти' : 'лотів'}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-1.5 h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] font-medium"
              >
                <SlidersHorizontal className="w-4 h-4" /> Фільтри
              </button>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] font-medium focus:outline-none focus:border-[#2563EB]">
                <option value="ending">Завершуються скоро</option>
                <option value="new">Найновіші</option>
                <option value="price-asc">Найдешевші</option>
                <option value="price-desc">Найдорожчі</option>
                <option value="bids">Більше ставок</option>
              </select>
            </div>
          </div>

          {/* Lots */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
                  <div className="aspect-[4/3] bg-[#F1F5F9] animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-[#E2E8F0] rounded animate-pulse w-3/4"></div>
                    <div className="h-6 bg-[#E2E8F0] rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : lots.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-[#EFF6FF] to-[#F5F3FF] rounded-3xl flex items-center justify-center mx-auto mb-5">
                <span className="text-4xl">🌟</span>
              </div>
              {hasActiveFilters ? (
                <>
                  <h3 className="text-[18px] font-bold text-[#0F172A] mb-2">Нічого не знайдено</h3>
                  <p className="text-[14px] text-[#64748B] mb-5">Спробуйте змінити фільтри або пошуковий запит</p>
                  <button onClick={clearFilters} className="h-10 px-6 bg-[#2563EB] text-white rounded-xl text-[14px] font-semibold">
                    Скинути фільтри
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-[20px] font-bold text-[#0F172A] mb-2">KRAM тільки запускається!</h3>
                  <p className="text-[14px] text-[#64748B] max-w-[380px] mx-auto mb-6">
                    Будьте першим! Виставте свій лот і отримайте реальних покупців.
                    На старті — безкоштовно та без комісії.
                  </p>
                  <a href="/sell" className="inline-flex items-center gap-2 h-12 px-8 bg-[#2563EB] text-white rounded-xl text-[15px] font-bold hover:bg-[#1D4ED8] transition-colors">
                    🚀 Виставити перший лот
                  </a>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lots.map((lot) => (
                  <LotCard key={lot.id} lot={transformLot(lot)} />
                ))}
              </div>

              {/* Pagination */}
              {total > 20 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button disabled={page === 1} onClick={() => setPage(page - 1)}
                    className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] disabled:opacity-50">
                    ← Назад
                  </button>
                  <span className="text-[13px] text-[#64748B]">
                    Сторінка {page} з {Math.ceil(total / 20)}
                  </span>
                  <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)}
                    className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] disabled:opacity-50">
                    Далі →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
