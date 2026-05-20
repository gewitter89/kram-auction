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
    <div className="flex items-end justify-between gap-4 mb-6">
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

  const hasRealLots = lots.length > 0
  const displayLots = hasRealLots ? lots : fallbackLots
  const featured = displayLots[0]
  const sideLots = hasRealLots ? displayLots.slice(1, 5) : []
  const endingLots = useMemo(() => hasRealLots ? [...displayLots].sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()).slice(0, 4) : [], [displayLots, hasRealLots])
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

              {sideLots.length > 0 ? (
                <div className="space-y-3">
                  {sideLots.slice(0, 3).map((lot, idx) => <DenseLotRow key={`${lot.id}-${idx}`} lot={lot} />)}
                </div>
              ) : (
                <div className="bg-white border border-[#E2E8F0] rounded-[1.75rem] p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#2563EB] mb-2">Для продавців</p>
                    <h3 className="text-[22px] font-black text-[#0B1220] tracking-[-0.03em] mb-3">Додайте сильні лоти</h3>
                    <p className="text-[13px] text-[#64748B] leading-relaxed">Професійна добірка тримається на реальних фото, місті, чесному описі стану та зрозумілій доставці.</p>
                  </div>
                  <div className="mt-5 space-y-2">
                    {['3–5 фото товару', 'чесний опис стану', 'місто та доставка', 'без передоплати у тексті'].map(item => (
                      <div key={item} className="flex items-center gap-2 text-[12px] font-bold text-[#475569]">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> {item}
                      </div>
                    ))}
                  </div>
                  <Link href="/sell" className="mt-6 h-11 px-5 bg-[#0B1220] text-white rounded-xl text-[13px] font-black flex items-center justify-center hover:bg-[#111827]">
                    Створити лот
                  </Link>
                </div>
              )}
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

      {hasRealLots ? (
        <ProductGrid lots={displayLots} />
      ) : (
        <section className="max-w-[1320px] mx-auto px-4 py-10">
          <div className="bg-white border border-[#E2E8F0] rounded-[1.75rem] p-7 md:p-9 shadow-sm grid lg:grid-cols-[0.8fr_1.2fr] gap-6 items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#2563EB] mb-2">Старт каталогу</p>
              <h2 className="text-[26px] md:text-[36px] font-black text-[#0B1220] tracking-[-0.04em] mb-3">Перші лоти формують сильну добірку KRAM</h2>
              <p className="text-[14px] text-[#64748B] leading-relaxed">Краще 20 якісних оголошень із реальними фото, ніж сотні випадкових позицій. Починаємо з категорій, де покупцям важлива прозора ціна та чесний стан товару.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {['Дитячі товари', 'Одяг та взуття', 'Телефони', 'Ноутбуки', 'Інструменти', 'Техніка для дому'].map(item => (
                <Link key={item} href="/sell" className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 hover:border-[#2563EB]/30 transition-colors">
                  <p className="text-[14px] font-black text-[#0B1220]">{item}</p>
                  <p className="text-[12px] text-[#64748B] mt-1">додати реальний лот</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-[1320px] mx-auto px-4 py-10">
        <div className="bg-white border border-[#E2E8F0] rounded-[1.75rem] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 h-7 px-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-[11px] font-black text-[#2563EB] uppercase tracking-wide mb-4">
                <ShieldCheck className="w-4 h-4" /> Довіра і правила KRAM
              </div>
              <h2 className="text-[24px] md:text-[34px] font-black text-[#0B1220] tracking-[-0.04em] mb-3">Прозорі торги без оплати через платформу</h2>
              <p className="text-[14px] text-[#475569] leading-relaxed">
                KRAM показує лот, ставку, чат і статус домовленості. Покупець і продавець самі погоджують оплату та доставку; рекомендований сценарій — післяплата після огляду товару.
              </p>
            </div>
            <Link href="/safety" className="inline-flex h-11 px-5 items-center justify-center bg-[#0B1220] text-white rounded-xl text-[13px] font-black hover:bg-[#111827]">
              Правила безпеки
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="group bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 hover:bg-white hover:shadow-md hover:border-[#BFDBFE] transition-all">
              <div className="h-16 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] mb-4 p-3 flex items-end gap-1.5">
                {[18, 26, 22, 34, 42].map((h, i) => <span key={i} style={{ height: `${h}px` }} className="w-3 rounded-t-md bg-[#2563EB]" />)}
                <TrendingUp className="w-5 h-5 text-[#2563EB] ml-auto self-start" />
              </div>
              <p className="text-[14px] font-black text-[#0B1220]">Прозорі ставки</p>
              <p className="text-[12px] text-[#64748B] mt-1 leading-snug">історія торгів видима для всіх</p>
            </div>

            <div className="group bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 hover:bg-white hover:shadow-md hover:border-[#CBD5E1] transition-all">
              <div className="h-16 rounded-2xl bg-white border border-[#E2E8F0] mb-4 p-3 relative overflow-hidden">
                <div className="absolute left-3 top-3 h-7 px-3 rounded-xl bg-[#0B1220] text-white text-[10px] font-black flex items-center">чат</div>
                <div className="absolute right-3 bottom-3 h-7 px-3 rounded-xl bg-[#EFF6FF] text-[#2563EB] text-[10px] font-black flex items-center">статус</div>
              </div>
              <p className="text-[14px] font-black text-[#0B1220]">Чат і статуси</p>
              <p className="text-[12px] text-[#64748B] mt-1 leading-snug">домовленості збережені в системі</p>
            </div>

            <div className="group bg-[#F8FAFC] border border-[#FECACA] rounded-2xl p-5 hover:bg-white hover:shadow-md hover:border-[#FB7185] transition-all">
              <div className="h-16 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] mb-4 p-3 relative overflow-hidden">
                <div className="absolute top-3 left-3 h-5 px-1.5 rounded-md bg-[#E11D48] text-white text-[9px] font-black flex items-center">НП</div>
                <svg viewBox="0 0 120 52" className="absolute right-2 bottom-1 w-[92px] h-[44px]" aria-hidden="true">
                  <rect x="18" y="18" width="52" height="18" rx="4" fill="#E11D48" />
                  <path d="M70 22h18l10 10v4H70z" fill="#FB7185" />
                  <circle cx="34" cy="39" r="6" fill="#0B1220" />
                  <circle cx="82" cy="39" r="6" fill="#0B1220" />
                  <rect x="24" y="22" width="18" height="4" rx="2" fill="white" opacity="0.9" />
                  <path d="M8 30h14M2 36h18" stroke="#E11D48" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-[14px] font-black text-[#0B1220]">Нова Пошта</p>
              <p className="text-[12px] text-[#64748B] mt-1 leading-snug">післяплата після огляду товару</p>
            </div>

            <div className="group bg-[#F8FAFC] border border-[#BBF7D0] rounded-2xl p-5 hover:bg-white hover:shadow-md hover:border-[#10B981] transition-all">
              <div className="h-16 rounded-2xl bg-[#ECFDF5] border border-[#BBF7D0] mb-4 p-3 flex items-center justify-center">
                <div className="w-11 h-11 rounded-2xl bg-white border border-[#BBF7D0] flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-[#059669]" />
                </div>
              </div>
              <p className="text-[14px] font-black text-[#0B1220]">Модерація</p>
              <p className="text-[12px] text-[#64748B] mt-1 leading-snug">скарги й ризики під контролем</p>
            </div>
          </div>
        </div>
      </section>



      <section className="max-w-[1320px] mx-auto px-4 py-10">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0B1220] text-white p-7 md:p-9 shadow-xl">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_18%_20%,#2563EB_0,transparent_28%),radial-gradient(circle_at_85%_85%,#10B981_0,transparent_26%)]" />
          <div className="relative grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#93C5FD] mb-3">Каталог для перших продавців</p>
              <h2 className="text-[28px] md:text-[40px] font-black tracking-[-0.045em] leading-tight mb-4">Якісні лоти створюють довіру до торгів</h2>
              <p className="text-[14px] text-slate-300 leading-relaxed">Сильна добірка починається з реальних фото, зрозумілих цін, міст продавців і прозорої історії ставок.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                ['01', 'Додати лоти', '3–5 фото, опис стану, місто'],
                ['02', 'Поширити', 'Telegram, локальні групи, продавці'],
                ['03', 'Закрити угоди', 'чат, статуси, післяплата після огляду'],
              ].map(([num, title, desc]) => (
                <div key={num} className="bg-white/8 border border-white/10 rounded-2xl p-5">
                  <p className="text-[12px] font-black text-[#93C5FD] mb-3">{num}</p>
                  <p className="text-[15px] font-black text-white mb-2">{title}</p>
                  <p className="text-[12px] text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {endingLots.length > 1 && (
        <section className="max-w-[1320px] mx-auto px-4 py-10">
          <SectionHeader eyebrow="Фініш торгів" title="Завершуються скоро" href="/catalog?sort=ending" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {endingLots.map((lot, idx) => <DenseLotRow key={`ending-${lot.id}-${idx}`} lot={lot} />)}
          </div>
        </section>
      )}
    </div>
  )
}
