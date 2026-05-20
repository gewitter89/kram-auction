'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Baby, CheckCircle2, Clock3, Gamepad2, Hammer, Home, Laptop, PackageSearch, Search, ShieldCheck, Shirt, Smartphone, TrendingUp } from 'lucide-react'
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
  { name: 'Дитячі товари', slug: 'kids', icon: Baby },
  { name: 'Одяг та взуття', slug: 'fashion', icon: Shirt },
  { name: 'Телефони', slug: 'phones', icon: Smartphone },
  { name: 'Ноутбуки', slug: 'laptops', icon: Laptop },
  { name: 'Ігри та консолі', slug: 'games', icon: Gamepad2 },
  { name: 'Інструменти', slug: 'tools', icon: Hammer },
  { name: 'Дім', slug: 'home', icon: Home },
]

const quickSearches = [
  { label: 'Нові лоти', href: '/catalog?sort=new' },
  { label: 'Завершуються скоро', href: '/catalog?sort=ending' },
  { label: 'Дитячі товари', href: '/category/kids' },
  { label: 'Телефони', href: '/category/phones' },
  { label: 'Інструменти', href: '/category/tools' },
]

const fallbackLots: ApiLot[] = [
  {
    id: 'catalog',
    title: 'Перші реальні лоти KRAM — каталог відкритий для продавців',
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

function timeLeftLabel(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now()
  if (diff <= 0) return 'Завершено'
  const hours = Math.floor(diff / 3600000)
  if (hours >= 24) return `${Math.floor(hours / 24)}д ${hours % 24}г`
  return hours > 0 ? `${hours}г` : '<1г'
}

function SectionHeader({ eyebrow, title, href }: { eyebrow: string; title: string; href?: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#2563EB] mb-1.5">{eyebrow}</p>
        <h2 className="text-[22px] md:text-[30px] font-black text-[#0B1220] tracking-[-0.03em]">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-black text-[#2563EB] hover:underline">
          Дивитись всі <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

function DenseLotRow({ lot }: { lot: ApiLot }) {
  const image = parseImages(lot.images)[0]
  const href = lot.id === 'catalog' ? '/catalog' : `/lot/${lot.id}`

  return (
    <Link href={href} className="group grid grid-cols-[84px_1fr] gap-3 bg-white border border-[#E2E8F0] rounded-2xl p-3 hover:border-[#2563EB]/30 hover:shadow-md transition-all">
      <div className="aspect-square rounded-xl bg-[#F1F5F9] overflow-hidden border border-slate-100">
        {image ? (
          <img src={image} alt={lot.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC]">
            <PackageSearch className="w-7 h-7 text-[#94A3B8]" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="text-[13px] font-black text-[#0B1220] line-clamp-2 leading-snug group-hover:text-[#2563EB]">{lot.title}</h3>
          <p className="text-[11px] text-[#64748B] mt-1">{lot.city || 'Україна'} · {timeLeftLabel(lot.endsAt)}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[16px] font-black text-[#0B1220]">{new Intl.NumberFormat('uk-UA').format(lot.currentPrice)} ₴</p>
          <span className="text-[10px] font-black text-[#2563EB] bg-[#EFF6FF] rounded-md px-2 py-1">{lot._count?.bids || 0} ставок</span>
        </div>
      </div>
    </Link>
  )
}

function ProductGrid({ lots }: { lots: ApiLot[] }) {
  const shown = lots.slice(0, 8)
  return (
    <section className="max-w-[1320px] mx-auto px-4 py-10">
      <SectionHeader eyebrow="Торги зараз" title="Актуальні лоти" href="/catalog" />
      {shown.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shown.map(lot => <LotCard key={lot.id} lot={transformLot(lot)} />)}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-[#CBD5E1] rounded-3xl p-8 text-center">
          <PackageSearch className="w-9 h-9 text-[#94A3B8] mx-auto mb-3" />
          <p className="text-[14px] font-bold text-[#475569]">Перші продавці ще додають товари.</p>
          <Link href="/sell" className="inline-flex mt-4 h-10 px-5 items-center justify-center bg-[#2563EB] text-white rounded-xl text-[13px] font-black hover:bg-[#1D4ED8]">
            Додати лот
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
  const featured = displayLots[0]
  const sideLots = displayLots.slice(1, 5)
  const endingLots = useMemo(() => [...displayLots].sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()).slice(0, 4), [displayLots])
  const activeLots = loading ? '—' : stats.activeLots ?? lots.length

  return (
    <div className="bg-[#F8FAFC]">
      <section className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1320px] mx-auto px-4 py-8 lg:py-10">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-5 items-stretch">
            <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0B1220] text-white p-7 md:p-9 min-h-[390px] flex flex-col justify-between shadow-xl">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#2563EB_0,transparent_32%),radial-gradient(circle_at_90%_15%,#10B981_0,transparent_25%)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 h-8 px-3 bg-white/10 border border-white/10 rounded-full text-[12px] font-black text-[#BFDBFE] mb-5">
                  Прямі домовленості · прозорі ставки
                </div>
                <h1 className="text-[34px] md:text-[52px] font-black tracking-[-0.055em] leading-[1.02] mb-5 max-w-[760px]">
                  KRAM — аукціони та оголошення з відкритими ставками
                </h1>
                <p className="text-[15.5px] text-slate-300 leading-relaxed max-w-[640px] mb-7">
                  Шукайте лоти, робіть ставки або купуйте одразу. KRAM показує ціну, час до завершення, продавця й статус домовленості — без прийому оплат на платформі.
                </p>
                <form action="/catalog" className="bg-white rounded-2xl p-2 shadow-xl shadow-black/10 border border-white/10 mb-4 max-w-[620px]">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="flex-1 h-12 px-4 bg-[#F8FAFC] rounded-xl flex items-center gap-2 text-[#0B1220]">
                      <Search className="w-4 h-4 text-[#64748B]" />
                      <input
                        name="search"
                        placeholder="Пошук: iPhone, кросівки, інструмент..."
                        className="w-full bg-transparent outline-none text-[14px] font-semibold placeholder:text-[#94A3B8]"
                      />
                    </label>
                    <button className="h-12 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-[14px] font-black flex items-center justify-center gap-2">
                      Знайти
                    </button>
                  </div>
                </form>

                <div className="flex flex-wrap gap-2 mb-6">
                  {quickSearches.map(item => (
                    <Link key={item.href} href={item.href} className="h-8 px-3 inline-flex items-center rounded-full bg-white/10 border border-white/10 text-[12px] font-bold text-slate-300 hover:bg-white/15 hover:text-white">
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/catalog" className="h-12 px-7 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-[14px] font-black flex items-center justify-center gap-2 shadow-lg shadow-[#2563EB]/20">
                    Переглянути каталог <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/sell" className="h-12 px-7 bg-white text-[#0B1220] rounded-xl text-[14px] font-black flex items-center justify-center hover:bg-slate-100">
                    Додати лот
                  </Link>
                </div>
              </div>
              <div className="relative grid grid-cols-3 gap-3 mt-8">
                <div className="bg-white/8 border border-white/10 rounded-2xl p-3">
                  <p className="text-[22px] font-black">{activeLots}</p>
                  <p className="text-[11px] text-slate-400">активних лотів</p>
                </div>
                <div className="bg-white/8 border border-white/10 rounded-2xl p-3">
                  <p className="text-[22px] font-black">0%</p>
                  <p className="text-[11px] text-slate-400">комісії на старті</p>
                </div>
                <div className="bg-white/8 border border-white/10 rounded-2xl p-3">
                  <p className="text-[22px] font-black">НП</p>
                  <p className="text-[11px] text-slate-400">післяплата</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-[1fr_0.9fr] gap-4">
              <Link href={featured.id === 'catalog' ? '/catalog' : `/lot/${featured.id}`} className="group bg-white border border-[#E2E8F0] rounded-[1.75rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#2563EB]/30 transition-all">
                <div className="aspect-[4/3] bg-[#F1F5F9] relative overflow-hidden">
                  {parseImages(featured.images)[0] ? (
                    <img src={parseImages(featured.images)[0]} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC]">
                      <PackageSearch className="w-14 h-14 text-[#94A3B8]" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 h-7 px-2.5 bg-white/95 rounded-lg text-[10px] font-black text-[#0B1220] flex items-center gap-1 shadow-sm">
                    <TrendingUp className="w-3.5 h-3.5 text-[#2563EB]" /> Лот дня
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-[16px] font-black text-[#0B1220] line-clamp-2 mb-3 group-hover:text-[#2563EB]">{featured.title}</h3>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-[#94A3B8] uppercase font-bold">Поточна ставка</p>
                      <p className="text-[22px] font-black text-[#0B1220]">{new Intl.NumberFormat('uk-UA').format(featured.currentPrice)} ₴</p>
                    </div>
                    <span className="text-[11px] font-black text-[#2563EB] bg-[#EFF6FF] rounded-lg px-2 py-1">{featured._count?.bids || 0} ставок</span>
                  </div>
                </div>
              </Link>

              <div className="space-y-3">
                {(sideLots.length ? sideLots : displayLots).slice(0, 3).map((lot, idx) => <DenseLotRow key={`${lot.id}-${idx}`} lot={lot} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1320px] mx-auto px-4 py-8">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#2563EB] mb-1">Категорії</p>
            <h2 className="text-[22px] md:text-[28px] font-black text-[#0B1220] tracking-[-0.03em]">Швидкий вхід у каталог</h2>
          </div>
          <Link href="/catalog" className="hidden sm:inline-flex text-[13px] font-black text-[#2563EB] hover:underline">Усі категорії →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {categories.map(cat => {
            const Icon = cat.icon
            return (
              <Link key={cat.slug} href={`/category/${cat.slug}`} className="group bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:border-[#2563EB]/30 hover:shadow-md transition-all flex items-center gap-3 min-h-[76px]">
                <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#2563EB] group-hover:bg-[#EFF6FF]">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-[13px] font-black text-[#0B1220] leading-tight group-hover:text-[#2563EB]">{cat.name}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <ProductGrid lots={displayLots} />

      <section className="max-w-[1320px] mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-5">
          <div className="bg-white border border-[#E2E8F0] rounded-[1.75rem] p-6 shadow-sm">
            <div className="inline-flex items-center gap-2 h-7 px-3 bg-[#ECFDF5] border border-[#BBF7D0] rounded-full text-[11px] font-black text-[#059669] uppercase tracking-wide mb-4">
              <ShieldCheck className="w-4 h-4" /> Безпечна модель
            </div>
            <h2 className="text-[24px] md:text-[32px] font-black text-[#0B1220] tracking-[-0.035em] mb-3">KRAM не приймає оплату</h2>
            <p className="text-[14px] text-[#475569] leading-relaxed">
              Платформа фіксує лот, ставки, переписку та статус домовленості. Оплату й доставку покупець і продавець погоджують самостійно; рекомендуємо післяплату після огляду товару.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ['Прозорі ставки', 'історія торгів видима'],
              ['Чат і статуси', 'домовленості збережені'],
              ['Нова Пошта', 'післяплата після огляду'],
              ['Модерація', 'скарги й ризики під контролем'],
            ].map(([title, desc]) => (
              <div key={title} className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
                <CheckCircle2 className="w-5 h-5 text-[#10B981] mb-3" />
                <p className="text-[14px] font-black text-[#0B1220]">{title}</p>
                <p className="text-[12px] text-[#64748B] mt-1 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1320px] mx-auto px-4 py-10">
        <SectionHeader eyebrow="Фініш торгів" title="Завершуються скоро" href="/catalog?sort=ending" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {endingLots.map((lot, idx) => <DenseLotRow key={`ending-${lot.id}-${idx}`} lot={lot} />)}
        </div>
      </section>
    </div>
  )
}
