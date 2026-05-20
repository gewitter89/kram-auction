'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Baby, Bolt, CheckCircle2, Clock3, Gamepad2, Hammer, Home, Laptop, PackageSearch, ShieldCheck, Shirt, Smartphone, Sparkles, TrendingUp, Truck } from 'lucide-react'
import { LotCard } from '@/components/lots/LotCard'

type ApiLot = {
  id: string
  title: string
  images: string
  currentPrice: number
  endsAt: string
  city?: string
  condition?: string
  type?: string
  delivery?: string
  featured?: boolean
  seller?: {
    name?: string
    verified?: boolean
    rating?: number
    reviewsCount?: number
  }
  _count?: { bids?: number }
}

const categories = [
  { name: 'Дитячі товари', slug: 'kids', icon: Baby, tone: 'bg-pink-50 text-pink-600 border-pink-100', hint: 'взуття, одяг, іграшки' },
  { name: 'Одяг та взуття', slug: 'fashion', icon: Shirt, tone: 'bg-rose-50 text-rose-600 border-rose-100', hint: 'нове та б/в' },
  { name: 'Телефони', slug: 'phones', icon: Smartphone, tone: 'bg-violet-50 text-violet-600 border-violet-100', hint: 'смартфони, аксесуари' },
  { name: 'Ноутбуки', slug: 'laptops', icon: Laptop, tone: 'bg-blue-50 text-blue-600 border-blue-100', hint: 'ПК, монітори, комплектуючі' },
  { name: 'Консолі', slug: 'games', icon: Gamepad2, tone: 'bg-cyan-50 text-cyan-600 border-cyan-100', hint: 'PS, Xbox, Nintendo' },
  { name: 'Інструменти', slug: 'tools', icon: Hammer, tone: 'bg-amber-50 text-amber-700 border-amber-100', hint: 'ремонт і майстерня' },
  { name: 'Дім', slug: 'home', icon: Home, tone: 'bg-emerald-50 text-emerald-600 border-emerald-100', hint: 'техніка, декор, речі' },
  { name: 'Електроніка', slug: 'electronics', icon: Bolt, tone: 'bg-indigo-50 text-indigo-600 border-indigo-100', hint: 'гаджети та пристрої' },
]

const fallbackLots: ApiLot[] = [
  {
    id: 'catalog',
    title: 'Дитячі речі, взуття та товари для дому — перші лоти KRAM',
    images: '[]',
    currentPrice: 1,
    endsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    city: 'Україна',
    condition: 'used',
    type: 'auction',
    delivery: 'nova_poshta',
    seller: { name: 'KRAM', verified: true, rating: 0, reviewsCount: 0 },
    _count: { bids: 0 },
  },
]

function parseImages(images?: string): string[] {
  try {
    const parsed = JSON.parse(images || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function transformLot(lot: ApiLot) {
  const images = parseImages(lot.images)
  return {
    id: lot.id,
    title: lot.title,
    currentPrice: lot.currentPrice,
    bids: lot._count?.bids || 0,
    endsAt: lot.endsAt,
    city: lot.city || 'Україна',
    seller: lot.seller?.name || 'Продавець',
    sellerRating: lot.seller?.rating || 0,
    sellerReviewsCount: lot.seller?.reviewsCount || 0,
    image: images[0] || '',
    condition: lot.condition || 'used',
    type: lot.type || 'auction',
    delivery: lot.delivery === 'nova_poshta',
    verified: lot.seller?.verified || false,
    featured: lot.featured || false,
  }
}

function ProductRail({ title, eyebrow, lots, sort, emptyText }: { title: string; eyebrow: string; lots: ApiLot[]; sort: string; emptyText: string }) {
  const shown = lots.slice(0, 4)

  return (
    <section className="max-w-[1320px] mx-auto px-4 py-10">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 h-6 px-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-[10.5px] font-black text-[#2563EB] uppercase tracking-wide mb-3">
            <TrendingUp className="w-3.5 h-3.5" /> {eyebrow}
          </div>
          <h2 className="text-[22px] md:text-[30px] font-black text-[#0B1220] tracking-[-0.02em]">{title}</h2>
        </div>
        <Link href={`/catalog?sort=${sort}`} className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-black text-[#2563EB] hover:underline">
          Дивитись всі <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {shown.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shown.map(lot => <LotCard key={`${title}-${lot.id}`} lot={transformLot(lot)} />)}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-[#CBD5E1] rounded-3xl p-8 text-center">
          <PackageSearch className="w-9 h-9 text-[#94A3B8] mx-auto mb-3" />
          <p className="text-[14px] font-bold text-[#475569]">{emptyText}</p>
          <Link href="/sell" className="inline-flex mt-4 h-10 px-5 items-center justify-center bg-[#2563EB] text-white rounded-xl text-[13px] font-black hover:bg-[#1D4ED8]">
            Додати перший лот
          </Link>
        </div>
      )}
    </section>
  )
}

export function MarketplaceShowcase() {
  const [lots, setLots] = useState<ApiLot[]>([])
  const [stats, setStats] = useState<{ activeLots?: number; totalUsers?: number; bidsToday?: number }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/lots?limit=8&sort=new').then(r => r.json()).catch(() => ({ lots: [] })),
      fetch('/api/stats').then(r => r.json()).catch(() => ({})),
    ]).then(([lotsData, statsData]) => {
      setLots(lotsData.lots || [])
      setStats(statsData || {})
    }).finally(() => setLoading(false))
  }, [])

  const displayLots = lots.length > 0 ? lots : fallbackLots
  const endingLots = useMemo(() => [...displayLots].sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()), [displayLots])
  const hotLots = useMemo(() => [...displayLots].sort((a, b) => (b._count?.bids || 0) - (a._count?.bids || 0)), [displayLots])

  return (
    <div className="bg-[#FAFBFD]">
      <section className="relative overflow-hidden bg-white border-b border-[#E2E8F0]">
        <div className="absolute inset-0 gradient-mesh opacity-70 pointer-events-none" />
        <div className="relative max-w-[1320px] mx-auto px-4 py-8 lg:py-12">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-stretch">
            <div className="bg-[#0B1220] text-white rounded-[2rem] p-7 md:p-9 overflow-hidden relative min-h-[420px] flex flex-col justify-between shadow-2xl">
              <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#2563EB]/30 blur-3xl" />
              <div className="absolute -left-20 bottom-0 w-56 h-56 rounded-full bg-[#10B981]/20 blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 h-8 px-3 bg-white/10 border border-white/10 rounded-full text-[12px] font-black text-[#BFDBFE] mb-5">
                  <Sparkles className="w-4 h-4" /> Controlled launch · 0% комісії
                </div>
                <h1 className="text-[36px] md:text-[56px] font-black tracking-[-0.055em] leading-[0.98] mb-5">
                  KRAM — прозорі торги та оголошення в Україні
                </h1>
                <p className="text-[15.5px] text-slate-300 leading-relaxed max-w-[620px] mb-7">
                  Додавайте реальні лоти з фото, робіть ставки та домовляйтесь напряму. KRAM фіксує лот, ціну, чат і статус угоди — без прийому платежів та без утримання коштів.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/catalog" className="h-12 px-7 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-[14px] font-black flex items-center justify-center gap-2 shadow-lg shadow-[#2563EB]/20">
                    Переглянути лоти <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/sell" className="h-12 px-7 bg-white text-[#0B1220] rounded-xl text-[14px] font-black flex items-center justify-center hover:bg-slate-100">
                    Додати свій лот
                  </Link>
                </div>
              </div>
              <div className="relative grid grid-cols-3 gap-3 mt-8">
                <div className="bg-white/8 border border-white/10 rounded-2xl p-3">
                  <p className="text-[22px] font-black">{loading ? '—' : stats.activeLots ?? lots.length}</p>
                  <p className="text-[11px] text-slate-400">активних лотів</p>
                </div>
                <div className="bg-white/8 border border-white/10 rounded-2xl p-3">
                  <p className="text-[22px] font-black">0%</p>
                  <p className="text-[11px] text-slate-400">комісії на старті</p>
                </div>
                <div className="bg-white/8 border border-white/10 rounded-2xl p-3">
                  <p className="text-[22px] font-black">24/7</p>
                  <p className="text-[11px] text-slate-400">каталог онлайн</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {displayLots.slice(0, 4).map((lot, idx) => (
                <Link key={`hero-${lot.id}-${idx}`} href={lot.id === 'catalog' ? '/catalog' : `/lot/${lot.id}`} className={`group bg-white border border-[#E2E8F0] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#2563EB]/30 transition-all ${idx === 0 ? 'sm:row-span-2' : ''}`}>
                  <div className={`${idx === 0 ? 'aspect-[4/3] sm:aspect-[1.15/1]' : 'aspect-[4/3]'} bg-[#F1F5F9] relative overflow-hidden`}>
                    {parseImages(lot.images)[0] ? (
                      <img src={parseImages(lot.images)[0]} alt={lot.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#EFF6FF] via-white to-[#DCFCE7] flex items-center justify-center">
                        <PackageSearch className="w-12 h-12 text-[#2563EB]/40" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 h-7 px-2.5 bg-white/95 rounded-lg text-[10px] font-black text-[#EF4444] flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" /> LIVE
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-[14px] font-black text-[#0B1220] line-clamp-2 mb-2 group-hover:text-[#2563EB]">{lot.title}</h3>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-[#94A3B8] uppercase font-bold">Поточна ставка</p>
                        <p className="text-[18px] font-black text-[#0B1220]">{new Intl.NumberFormat('uk-UA').format(lot.currentPrice)} ₴</p>
                      </div>
                      <span className="text-[11px] font-black text-[#2563EB] bg-[#EFF6FF] rounded-lg px-2 py-1">{lot._count?.bids || 0} ставок</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1320px] mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#2563EB] mb-1">Популярні категорії</p>
            <h2 className="text-[24px] md:text-[32px] font-black text-[#0B1220] tracking-[-0.03em]">З чого стартуємо каталог</h2>
          </div>
          <Link href="/catalog" className="hidden sm:inline-flex text-[13px] font-black text-[#2563EB] hover:underline">Увесь каталог →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map(cat => {
            const Icon = cat.icon
            return (
              <Link key={cat.slug} href={`/category/${cat.slug}`} className="group bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:border-[#2563EB]/25 hover:shadow-lg transition-all min-h-[128px] flex flex-col justify-between">
                <div className={`w-11 h-11 rounded-xl border ${cat.tone} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[13px] font-black text-[#0B1220] leading-tight group-hover:text-[#2563EB]">{cat.name}</p>
                  <p className="text-[10.5px] text-[#64748B] mt-1 leading-tight">{cat.hint}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <ProductRail title="Нові лоти" eyebrow="Свіже в каталозі" lots={displayLots} sort="new" emptyText="Перші продавці ще додають товари." />
      <ProductRail title="Завершуються скоро" eyebrow="Не пропустіть" lots={endingLots} sort="ending" emptyText="Активні аукціони зʼявляться після додавання лотів." />
      <ProductRail title="Більше ставок" eyebrow="Активність покупців" lots={hotLots} sort="bids" emptyText="Ставки зʼявляться після перших покупців." />

      <section className="max-w-[1320px] mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-5">
          <div className="bg-white border border-[#E2E8F0] rounded-[2rem] p-6 md:p-8 shadow-sm">
            <div className="inline-flex items-center gap-2 h-7 px-3 bg-[#ECFDF5] border border-[#BBF7D0] rounded-full text-[11px] font-black text-[#059669] uppercase tracking-wide mb-4">
              <ShieldCheck className="w-4 h-4" /> Безпечна модель
            </div>
            <h2 className="text-[26px] md:text-[36px] font-black text-[#0B1220] tracking-[-0.035em] mb-3">KRAM не приймає оплату — сторони домовляються напряму</h2>
            <p className="text-[14px] text-[#475569] leading-relaxed max-w-2xl">
              Платформа допомагає прозоро показати лот, історію ставок, переписку та статус домовленості. Оплату й доставку покупець і продавець погоджують самостійно; рекомендуємо післяплату після огляду товару.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              ['Прозорі ставки', 'ціна формується відкрито'],
              ['Чат і статуси', 'домовленості збережені'],
              ['Нова Пошта', 'післяплата після огляду'],
              ['Модерація', 'reports і risky-лоти під контролем'],
            ].map(([title, desc]) => (
              <div key={title} className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
                <CheckCircle2 className="w-5 h-5 text-[#10B981] mb-3" />
                <p className="text-[14px] font-black text-[#0B1220]">{title}</p>
                <p className="text-[12px] text-[#64748B] mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
