'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Send, ShieldCheck, Gavel, Clock, User, ArrowRight, Smartphone, AlertTriangle, Check, HelpCircle, Star, MessageSquare, TrendingUp } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

// ────────────────────────────────────────────────────────
// 1. TELEGRAM PROMO BANNER
// ────────────────────────────────────────────────────────
export function TelegramSection() {
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/kram_auction'

  return (
    <section className="py-12 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220] text-white border-b border-slate-800">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#229ED9]/10 border border-[#229ED9]/25 rounded-full mb-3">
              <Send className="w-3.5 h-3.5 text-[#229ED9]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#229ED9]">Telegram Канал</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
              KRAM у вашому месенджері
            </h2>
            <p className="text-slate-400 text-[14px] max-w-md mx-auto lg:mx-0 leading-relaxed">
              Підписуйтесь на сповіщення про свіжі лоти, поточні ставки та останні хвилини торгів. Завжди будьте в курсі активності.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-[#229ED9] hover:bg-[#1f8fc4] text-white rounded-xl text-[13.5px] font-bold transition-all hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
              Підписатися в Telegram
            </a>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center h-11 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[13.5px] font-bold transition-all"
            >
              Переглянути топ-лоти дня
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────
// 2. LIVE AUCTIONS SECTION
// ────────────────────────────────────────────────────────
interface Lot {
  id: string
  title: string
  images: string
  currentPrice: number
  endsAt: string
  seller: {
    id: string
    name: string
  }
  _count: {
    bids: number
  }
}

export function LiveAuctionsNow() {
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/lots?limit=3&status=active')
      .then(r => r.json())
      .then(data => {
        setLots(data.lots || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const hasLots = lots.length > 0

  return (
    <section className="py-16 bg-[#FAFBFD] border-b border-[#E2E8F0]">
      <div className="max-w-[1320px] mx-auto px-4">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 h-6 px-2.5 bg-[#EFF6FF] border border-[#2563EB]/10 rounded-full text-[10.5px] font-bold text-[#2563EB] uppercase tracking-wide mb-3">
              <TrendingUp className="w-3.5 h-3.5" /> Beta-Каталог
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1220] tracking-tight mb-2">
              {hasLots ? 'Живі торги зараз' : 'Перші лоти очікують продавців'}
            </h2>
            <p className="text-[#475569] text-[14px]">
              {hasLots 
                ? 'Чесні торги та прозора історія пропозицій в реальному часі.' 
                : 'Станьте першим продавцем на KRAM без комісії та посередників.'}
            </p>
          </div>
          <Link
            href="/catalog"
            className="hidden md:inline-flex items-center gap-1.5 h-10 px-4 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0B1220] rounded-xl text-[13px] font-bold transition-colors"
          >
            Усі лоти
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading Shell */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-card animate-pulse">
                <div className="aspect-[4/3] bg-slate-100 rounded-xl mb-4" />
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
                <div className="h-6 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : hasLots ? (
          <div className="grid md:grid-cols-3 gap-6">
            {lots.map(lot => {
              let images: string[] = []
              try { images = JSON.parse(lot.images || '[]') } catch {}
              const end = new Date(lot.endsAt).getTime()
              const diff = end - Date.now()
              const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)))
              const isUrgent = diff > 0 && diff < 2 * 3600000

              return (
                <Link
                  key={lot.id}
                  href={`/lot/${lot.id}`}
                  className="group bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:border-[#2563EB]/30 hover:shadow-premium transition-all duration-300 flex flex-col h-full"
                >
                  {/* Photo area */}
                  <div className="aspect-[4/3] bg-[#F1F5F9] relative overflow-hidden shrink-0 border-b border-slate-100">
                    {images?.[0] ? (
                      <img 
                        src={images[0]} 
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#EFF6FF] to-white p-6">
                        <div className="w-10 h-10 bg-[#2563EB]/10 rounded-xl flex items-center justify-center mb-2">
                          <Gavel className="w-5 h-5 text-[#2563EB]" />
                        </div>
                        <span className="text-[12px] font-bold text-[#2563EB] tracking-[0.1em] uppercase">KRAM</span>
                        <span className="text-[11px] text-[#475569] mt-0.5">Демонстраційний товар</span>
                      </div>
                    )}

                    {/* Live Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 h-6 px-2.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#EF4444]"></span>
                      </span>
                      <span className="text-[10px] font-extrabold text-[#EF4444] uppercase tracking-wide">LIVE</span>
                    </div>

                    {/* Urgent Time Left Badge */}
                    <div className={`absolute bottom-3 right-3 h-6 px-2.5 rounded-lg backdrop-blur-sm ${isUrgent ? 'bg-[#FEF2F2]/95 text-[#EF4444]' : 'bg-white/95 text-[#475569]'}`}>
                      <div className="flex items-center gap-1 text-[11px] font-bold h-full">
                        <Clock className="w-3.5 h-3.5" />
                        {diff <= 0 ? 'Завершено' : hours > 0 ? `${hours} год` : '< 1 год'}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-[14px] font-bold text-[#0B1220] leading-snug line-clamp-2 mb-3 group-hover:text-[#2563EB] transition-colors min-h-[40px]">
                      {lot.title || 'Лот без назви'}
                    </h3>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
                      <div>
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wide block mb-0.5">Поточна ставка</span>
                        <span className="text-[18px] font-extrabold text-[#0B1220] tracking-tight">{formatPrice(lot.currentPrice)}</span>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md">
                          <Gavel className="w-3 h-3" />
                          {lot._count.bids} {lot._count.bids === 1 ? 'ставка' : lot._count.bids > 1 && lot._count.bids < 5 ? 'ставки' : 'ставок'}
                        </span>
                      </div>
                    </div>

                    {/* Seller details */}
                    <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-slate-50 text-[11.5px] text-[#475569]">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-[#2563EB]">
                        {lot.seller.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate flex-1 font-semibold">{lot.seller.name}</span>
                      <span className="inline-flex items-center gap-0.5 text-[#10B981] font-bold">
                        <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                        5.0
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          /* Empty / Launch State */
          <div className="text-center py-16 bg-white border border-[#E2E8F0] rounded-3xl max-w-xl mx-auto shadow-sm">
            <div className="w-14 h-14 bg-[#2563EB]/8 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[26px]">
              📦
            </div>
            <h3 className="text-[17px] font-extrabold text-[#0B1220] mb-2">
              Перші лоти зʼявляться незабаром
            </h3>
            <p className="text-[#475569] text-[13.5px] mb-6 max-w-sm mx-auto leading-relaxed">
              Платформа запущена в beta-режимі. Створіть перший безкоштовний лот, щоб розпочати прозорі торги!
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center justify-center h-11 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-[13.5px] font-bold transition-all shadow-md shadow-[#2563EB]/10"
            >
              Створити перший лот
            </Link>
          </div>
        )}

        {/* Mobile View CTA */}
        <div className="mt-6 text-center md:hidden">
          <Link
            href="/catalog"
            className="w-full inline-flex items-center justify-center gap-1.5 h-11 bg-white border border-[#E2E8F0] text-[#0B1220] rounded-xl text-[13px] font-bold"
          >
            Переглянути всі лоти
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────
// 3. BETA SAFETY FLOW (HOW IT WORKS TIMELINE REPLACEMENT)
// ────────────────────────────────────────────────────────
export function HowItWorksSimple() {
  const steps = [
    {
      step: '1',
      title: 'Знайдіть або створіть лот',
      desc: 'Покупець вибирає цікавий товар у каталозі, а продавець може безкоштовно та швидко виставити власний.',
      icon: <HelpCircle className="w-5 h-5 text-slate-700" />,
    },
    {
      step: '2',
      title: 'Зробіть пропозицію у торгах',
      desc: 'Робіть ставки для чесного формування ціни або переходьте до обговорення у безпечному чаті KRAM.',
      icon: <MessageSquare className="w-5 h-5 text-slate-700" />,
    },
    {
      step: '3',
      title: 'Узгодьте деталі напряму',
      desc: 'Сторони самостійно домовляються про зручний спосіб оплати й доставки (наприклад, післяплата Новою Поштою).',
      icon: <User className="w-5 h-5 text-slate-700" />,
    },
    {
      step: '4',
      title: 'Завершіть безпечну зустріч',
      desc: 'Перевірте лот при отриманні у відділенні або при особистій зустрічі перед тим, як сплачувати кошти.',
      icon: <ShieldCheck className="w-5 h-5 text-slate-700" />,
    },
  ]

  return (
    <section className="py-16 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-[1320px] mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 h-6 px-3 bg-[#E8F5E9] border border-[#10B981]/10 rounded-full text-[10.5px] font-bold text-[#10B981] uppercase tracking-wide mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Безпечний Beta-Процес
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1220] tracking-tight mb-3">
            Як безпечно купувати та продавати
          </h2>
          <p className="text-[#475569] text-[14.5px] leading-relaxed">
            KRAM працює за моделлю прямих домовленостей (Classified). Ми надаємо прозору історію ставок та чат, але не виступаємо фінансовим чи логістичним посередником.
          </p>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {steps.map((item, idx) => (
            <div key={idx} className="bg-[#FAFBFD] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:border-[#2563EB]/15 hover:shadow-card transition-all relative">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-lg shadow-sm mb-4">
                {item.icon}
              </div>
              <div className="absolute top-6 right-6 text-[32px] font-black text-slate-100/80 leading-none select-none">
                {item.step}
              </div>
              <h3 className="text-[14.5px] font-extrabold text-[#0B1220] mb-2">{item.title}</h3>
              <p className="text-[12.5px] text-[#475569] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Informative Disclaimer Banner */}
        <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl max-w-3xl mx-auto">
          <p className="text-[12.5px] text-[#1E40AF] leading-relaxed text-center font-medium">
            📢 <strong>Офіційне роз’яснення:</strong> У beta-режимі KRAM не обробляє платежі, не приймає передплати, не забезпечує холдування (escrow) чи автоматичне повернення коштів. Усі фінансові та поштові питання сторони вирішують особисто та самостійно поза межами системи.
          </p>
        </div>

      </div>
    </section>
  )
}

// Dummy backward exports to keep next compiler quiet
export function TrustSectionUpdated() { return null }
export function EarlyAccessBanner() { return null }
export function AIAssistantTeaser() { return null }
export function ForSellersSection() { return null }
export function FinalCTA() { return null }

// ────────────────────────────────────────────────────────
// 4. MOBILE PWA TEASER
// ────────────────────────────────────────────────────────
export function MobileAppsTeaser() {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
        setIsInstalled(true)
      }
    }
  }, [])

  return (
    <section className="py-16 bg-[#0B1220] text-white border-b border-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
        backgroundSize: '24px 24px'
      }} />

      <div className="max-w-[1320px] mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <div className="inline-flex items-center gap-1.5 h-6 px-2.5 bg-white/5 border border-white/10 rounded-full text-[10.5px] font-bold text-slate-400 uppercase tracking-wide mb-4">
              📱 Мобільний Доступ
            </div>
            
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
              KRAM завжди під рукою
            </h2>
            
            <p className="text-slate-400 text-[14.5px] leading-relaxed mb-6 max-w-lg">
              KRAM можна встановити як PWA-додаток, щоб швидше повертатися до лотів і сповіщень. Це не займає місця на пристрої та працює безпосередньо через ваш веб-браузер.
            </p>

            <div className="space-y-4">
              {isInstalled ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold">
                  ✓ Додаток успішно встановлено на домашній екран!
                </div>
              ) : (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl max-w-md">
                  <span className="text-[11px] font-bold text-[#60A5FA] uppercase tracking-wider block mb-2">Як встановити:</span>
                  <p className="text-[12.5px] text-slate-400 leading-relaxed">
                    Натисніть на кнопку меню браузера (наприклад, три крапки в Chrome або «Поділитися» у Safari) та виберіть пункт <strong className="text-white">«Додати на початковий екран»</strong>.
                  </p>
                </div>
              )}

              {/* Stores coming soon */}
              <div className="flex flex-wrap gap-2.5 pt-4">
                <div className="h-9 px-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2 text-slate-400 text-[11px] font-semibold select-none">
                  <span>🍎 App Store</span>
                  <span className="bg-white/5 text-[9px] px-1 rounded text-slate-500">скоро</span>
                </div>
                <div className="h-9 px-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2 text-slate-400 text-[11px] font-semibold select-none">
                  <span>🤖 Google Play</span>
                  <span className="bg-white/5 text-[9px] px-1 rounded text-slate-500">скоро</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Phone Mockup */}
          <div className="flex justify-center relative">
            <div className="absolute w-[240px] h-[240px] bg-[#2563EB]/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative w-[230px] h-[440px] bg-[#020617] border-[4px] border-[#334155] rounded-[36px] shadow-2xl overflow-hidden ring-4 ring-slate-800/30">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-slate-900 rounded-full z-30" />
              <div className="w-full h-full p-3 pt-7 pb-3 flex flex-col justify-between text-white bg-[#0B1220]">
                {/* Mock Phone App Header */}
                <div className="border-b border-white/5 pb-1 flex items-center gap-1 justify-between">
                  <span className="text-[9px] font-black tracking-tight text-[#2563EB]">KRAM BETA</span>
                  <span className="text-[8px] text-slate-500">12:00</span>
                </div>

                {/* Mock content list */}
                <div className="flex-1 py-3 space-y-2 overflow-hidden">
                  <span className="text-[7.5px] uppercase tracking-wider text-slate-500 font-extrabold block">Активні пропозиції</span>
                  
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex gap-2 items-center">
                    <div className="w-6 h-6 rounded bg-[#2563EB]/25 flex items-center justify-center text-xs">💻</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-bold truncate">MacBook Air M2</p>
                      <p className="text-[7.5px] text-[#2563EB]">32 500 ₴</p>
                    </div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex gap-2 items-center opacity-80">
                    <div className="w-6 h-6 rounded bg-[#10B981]/25 flex items-center justify-center text-xs">📱</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-bold truncate">iPhone 14 Pro</p>
                      <p className="text-[7.5px] text-[#10B981]">18 500 ₴</p>
                    </div>
                  </div>
                </div>

                {/* Mock bottom tabs */}
                <div className="border-t border-white/5 pt-1.5 flex justify-around text-[7.5px] text-slate-500">
                  <span className="text-[#2563EB] font-bold">Лоти</span>
                  <span>Обране</span>
                  <span>Кабінет</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────
// 5. FAQ SECTION
// ────────────────────────────────────────────────────────
export function FAQSection() {
  const faqs = [
    {
      q: 'Як створити перший лот?',
      a: 'Зареєструйтесь на платформі, натисніть синю кнопку «Продати» у верхньому меню, завантажте фотографії товару, опишіть його стан, вкажіть стартову ставку та термін дії. Публікація безкоштовна.',
    },
    {
      q: 'Чи бере KRAM комісію?',
      a: 'Ні. Платформа діє безкоштовно для покупців і продавців. Комісія з розміщення або успішних ставок становить 0% протягом усього періоду beta-тестування.',
    },
    {
      q: 'Як домовитись про оплату?',
      a: 'Оплата узгоджується безпосередньо між сторонами у чаті KRAM. Ми наполегливо рекомендуємо здійснювати розрахунки виключно післяплатою при отриманні посилки у відділенні Нової Пошти (накладений платіж) або готівкою під час особистої зустрічі.',
    },
    {
      q: 'Чи гарантує KRAM угоду?',
      a: 'KRAM працює виключно як інформаційне табло історії ставок і лотів. Ми не є посередником, не приймаємо платежі та не зберігаємо гроші, тому не надаємо фінансових гарантій повернення.',
    },
    {
      q: 'Що робити з підозрілим лотом?',
      a: 'Якщо ви виявили порушення правил, шахрайство або вимагання передоплати, натисніть кнопку «Поскаржитись на лот» на сторінці товару. Модератори оперативно заблокують акаунт зловмисника.',
    },
  ]

  return (
    <section className="py-16 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-[768px] mx-auto px-4">
        
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-[#EFF6FF] rounded-xl text-[#2563EB] mb-3">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1220] tracking-tight">
            Часті запитання
          </h2>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-[#FAFBFD] border border-[#E2E8F0] rounded-xl overflow-hidden open:bg-white open:shadow-sm transition-all duration-200"
            >
              <summary className="flex items-center justify-between p-4.5 font-bold text-[#0B1220] text-[13.5px] cursor-pointer select-none">
                <span>{faq.q}</span>
                <span className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-open:rotate-180 group-open:bg-[#EFF6FF] group-open:text-[#2563EB] transition-all text-[11px]">
                  ▼
                </span>
              </summary>
              <div className="px-4.5 pb-4.5 text-[13px] text-[#475569] leading-relaxed border-t border-slate-50 pt-3">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────
// 6. WAITLIST / TELEGRAM SECTION
// ────────────────────────────────────────────────────────
export function EmailCollectionSection() {
  const [email, setEmail] = useState('')
  const [type, setType] = useState<'seller' | 'buyer'>('seller')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type, source: 'homepage' }),
      })
      const data = await res.json()
      
      if (data.success) {
        setSubmitted(true)
        setEmail('')
      } else {
        alert(data.error || 'Помилка. Спробуйте пізніше.')
      }
    } catch {
      alert('Помилка мережі. Спробуйте пізніше.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="email-collection" className="py-16 bg-gradient-to-br from-[#0B1220] to-[#111827] text-white">
      <div className="max-w-[640px] mx-auto px-4 text-center">
        
        <div className="inline-flex items-center gap-1.5 h-6 px-3 bg-white/5 border border-white/10 rounded-full text-[10.5px] font-bold text-slate-400 uppercase tracking-wide mb-4">
          📬 Свіжі Новини
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
          Будьте в курсі оновлень
        </h2>
        
        <p className="text-slate-400 text-[14px] leading-relaxed mb-8">
          Залиште свій email, щоб першими отримувати новини про запуск нових категорій товарів та важливі технічні оновлення платформи.
        </p>

        {submitted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/25 p-6 rounded-2xl text-center">
            <span className="text-2xl block mb-2">✓</span>
            <h4 className="font-bold text-emerald-400 mb-1">Ви успішно підписались!</h4>
            <p className="text-slate-400 text-xs">Дякуємо за довіру. Ми надішлемо листа лише за важливої нагоди.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-5 rounded-2xl text-left">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setType('seller')}
                className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all ${
                  type === 'seller' 
                    ? 'bg-[#2563EB] text-white shadow-md' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                🏪 Хочу продавати
              </button>
              <button
                type="button"
                onClick={() => setType('buyer')}
                className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all ${
                  type === 'buyer' 
                    ? 'bg-[#2563EB] text-white shadow-md' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                🛒 Хочу купувати
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Введіть ваш email..."
                required
                className="flex-1 h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-[13px] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
              />
              <button
                type="submit"
                disabled={loading || !email.includes('@')}
                className="h-11 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white rounded-xl text-[13px] font-bold transition-all shrink-0"
              >
                {loading ? 'Надсилаємо...' : 'Підписатися'}
              </button>
            </div>
            
            <p className="mt-3 text-[10px] text-slate-500 text-center leading-none">
              Жодного спаму. Ви зможете відписатися у будь-який момент.
            </p>
          </form>
        )}

      </div>
    </section>
  )
}
