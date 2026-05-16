'use client'

import { Send, ShieldCheck, Gavel, Clock, User, ArrowRight, CreditCard, Lock, Package, Truck, Wallet, MapPin, AlertCircle, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { useState, useEffect } from 'react'

export function TelegramSection() {
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL || '#telegram-coming-soon'

  return (
    <section className="py-16 bg-gradient-to-br from-[#0B1220] via-[#1e293b] to-[#0f172a]">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#229ED9]/20 rounded-full mb-4">
              <Send className="w-4 h-4 text-[#229ED9]" />
              <span className="text-sm font-medium text-[#229ED9]">Telegram</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              KRAM у Telegram
            </h2>
            <p className="text-[#94A3B8] max-w-md">
              Не пропустіть нові лоти, перебиті ставки та фінальні хвилини аукціону.
              Отримуйте сповіщення про топ-лоти прямо у вашому месенджері.
            </p>
          </div>

          {/* Right CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={telegramUrl}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-[#229ED9] text-white rounded-xl font-semibold hover:bg-[#1a8ac7] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#229ED9]/30"
            >
              <Send className="w-5 h-5" />
              Підписатися на Telegram
            </a>
            <a
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              Отримувати топ-лоти дня
            </a>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-[#64748B]">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            Нові лоти щодня
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#F59E0B] rounded-full" />
            Сповіщення про перебиті ставки
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#EF4444] rounded-full" />
            Фінальні 5 хвилин аукціону
          </span>
        </div>
      </div>
    </section>
  )
}

export function EarlyAccessBanner() {
  return (
    <section className="py-12 bg-gradient-to-r from-[#ECFDF5] via-[#D1FAE5] to-[#ECFDF5]">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl">
            <div className="w-12 h-12 bg-[#10B981] rounded-lg flex items-center justify-center text-white font-bold text-xl">
              0%
            </div>
            <div>
              <p className="font-semibold text-[#0B1220]">Комісія для перших</p>
              <p className="text-sm text-[#64748B]">Перші продавці без комісії</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl">
            <div className="w-12 h-12 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">UA</span>
            </div>
            <div>
              <p className="font-semibold text-[#0B1220]">Український запуск</p>
              <p className="text-sm text-[#64748B]">Для продавців з України</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl">
            <div className="w-12 h-12 bg-[#F59E0B] rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">⚡</span>
            </div>
            <div>
              <p className="font-semibold text-[#0B1220]">Ранній доступ</p>
              <p className="text-sm text-[#64748B]">До нових категорій</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl">
            <div className="w-12 h-12 bg-[#229ED9] rounded-lg flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#0B1220]">Telegram</p>
              <p className="text-sm text-[#64748B]">Сповіщення про лоти</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function AIAssistantTeaser() {
  return (
    <section className="py-16 bg-[#F8FAFC]">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="bg-gradient-to-br from-[#0B1220] to-[#1e293b] rounded-2xl p-8 md:p-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B5CF6]/20 rounded-full mb-6">
            <span className="text-sm font-medium text-[#A78BFA]">🤖 AI Помічник</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            AI-помічник для продавця
          </h2>

          <p className="text-[#94A3B8] max-w-2xl mx-auto mb-8">
            Скоро KRAM допоможе автоматично підготувати назву, опис, категорію
            та стартову ціну лота за фото товару.
          </p>

          <button className="inline-flex items-center gap-2 h-12 px-8 bg-[#8B5CF6] text-white rounded-xl font-semibold hover:bg-[#7c3aed] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#8B5CF6]/30">
            Хочу спробувати першим
          </button>

          <p className="mt-6 text-sm text-[#64748B]">
            Запуск AI-функцій планується у 2026 році
          </p>
        </div>
      </div>
    </section>
  )
}

export function ForSellersSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* For Sellers */}
          <div>
            <span className="inline-block px-4 py-2 bg-[#10B981]/10 text-[#10B981] rounded-full text-sm font-medium mb-6">
              Для продавців
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1220] mb-4">
              Не продавайте навмання — дозвольте покупцям чесно сформувати ціну
            </h2>
            <p className="text-[#64748B] mb-8">
              Аукціонний формат допомагає отримати справедливу ринкову ціну
              через чесну конкуренцію покупців.
            </p>
            <ul className="space-y-4">
              {[
                'Стартуйте з мінімальної ціни',
                'Отримуйте ставки в реальному часі',
                'Продавайте швидше через аукціонний інтерес',
                'Отримуйте Telegram-сповіщення про нові ставки',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-[#10B981]/10 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-[#10B981] rounded-full" />
                  </span>
                  <span className="text-[#334155]">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="/sell"
              className="inline-flex items-center gap-2 h-12 px-8 bg-[#10B981] text-white rounded-xl font-semibold mt-8 hover:bg-[#059669] transition-all hover:-translate-y-0.5"
            >
              Створити лот
            </a>
          </div>

          {/* For Buyers */}
          <div>
            <span className="inline-block px-4 py-2 bg-[#2563EB]/10 text-[#2563EB] rounded-full text-sm font-medium mb-6">
              Для покупців
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1220] mb-4">
              Не переплачуйте — торгуйтесь за реальну ціну
            </h2>
            <p className="text-[#64748B] mb-8">
              Контролюйте процес покупки та встановлюйте свою максимальну ціну.
              Система автоматично підніматиме ставку до вашого ліміту.
            </p>
            <ul className="space-y-4">
              {[
                'Бачите історію ставок',
                'Контролюєте максимальну ставку',
                'Отримуєте сповіщення, якщо вас перебили',
                'Купуєте через зрозумілий процес',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-[#2563EB]/10 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-[#2563EB] rounded-full" />
                  </span>
                  <span className="text-[#334155]">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="/catalog"
              className="inline-flex items-center gap-2 h-12 px-8 bg-[#2563EB] text-white rounded-xl font-semibold mt-8 hover:bg-[#1d4ed8] transition-all hover:-translate-y-0.5"
            >
              Переглянути лоти
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HowItWorksSimple() {
  const steps = [
    {
      icon: '�',
      title: 'Покупець купує або виграє лот',
      desc: 'Зробіть ставку на аукціоні або купіть за фіксованою ціною.',
      color: 'from-[#2563EB] to-[#1d4ed8]',
    },
    {
      icon: '�',
      title: 'Оплата підтверджується в системі',
      desc: 'Покупець підтверджує оплату — у beta статус може перевірятись вручну.',
      color: 'from-[#10B981] to-[#059669]',
    },
    {
      icon: '�',
      title: 'Продавець додає номер відправлення',
      desc: 'Seller вказує ТТН Нової Пошти — трекінг доступний обом.',
      color: 'from-[#F59E0B] to-[#D97706]',
    },
    {
      icon: '✅',
      title: 'Покупець підтверджує отримання',
      desc: 'Buyer отримує товар і закриває угоду — статус "Завершено".',
      color: 'from-[#8B5CF6] to-[#7c3aed]',
    },
  ]

  return (
    <section className="py-16 bg-[#F8FAFC]">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#10B981]/10 rounded-full mb-4">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span className="text-sm font-semibold text-[#10B981]">Безпечна угода KRAM</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0B1220] mb-4">
            Прозорий процес від покупки до отримання
          </h2>
          <p className="text-[#64748B] max-w-2xl mx-auto">
            Покупець підтверджує оплату, продавець відправляє товар, а статус угоди видно на кожному кроці.
          </p>
        </div>

        {/* Timeline for desktop */}
        <div className="hidden md:block relative">
          {/* Connecting line */}
          <div className="absolute top-[60px] left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-[#2563EB] via-[#10B981] to-[#8B5CF6]" />
          
          <div className="grid grid-cols-4 gap-6 relative">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg relative z-10`}>
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-[#2563EB] mb-2 uppercase tracking-wide">
                  Крок {i + 1}
                </div>
                <h3 className="text-[15px] font-bold text-[#0B1220] mb-2">{step.title}</h3>
                <p className="text-[13px] text-[#64748B] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cards for mobile */}
        <div className="md:hidden grid gap-4">
          {steps.map((step, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] flex items-start gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                {step.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-[#2563EB] mb-1">Крок {i + 1}</div>
                <h3 className="text-[15px] font-bold text-[#0B1220] mb-1">{step.title}</h3>
                <p className="text-[13px] text-[#64748B]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* MVP disclaimer */}
        <div className="mt-10 text-center">
          <p className="text-[12px] text-[#94A3B8] max-w-xl mx-auto">
            MVP: підтвердження оплати вручну через кабінет. Реальні платежі будуть підключені окремо наступним етапом.
          </p>
        </div>
      </div>
    </section>
  )
}

interface Lot {
  id: string
  title: string
  images: string
  currentPrice: number
  buyNowPrice: number | null
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
    fetch('/api/lots?limit=6&status=active')
      .then(r => r.json())
      .then(data => {
        setLots(data.lots || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const hasLots = lots.length > 0

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1220] mb-2">
              {hasLots ? 'Живі торги зараз' : 'Перші лоти очікують продавців'}
            </h2>
            <p className="text-[#64748B]">
              {hasLots 
                ? `${lots.length} активних лотів з реальними ставками` 
                : 'Станьте першим продавцем та отримайте 0% комісії'}
            </p>
          </div>
          <Link
            href="/catalog"
            className="hidden md:inline-flex items-center gap-2 h-10 px-5 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors"
          >
            Всі лоти
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#F8FAFC] rounded-2xl p-4 animate-pulse">
                <div className="aspect-[16/10] bg-[#E2E8F0] rounded-xl mb-4" />
                <div className="h-4 bg-[#E2E8F0] rounded w-3/4 mb-2" />
                <div className="h-6 bg-[#E2E8F0] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : hasLots ? (
          <div className="grid md:grid-cols-3 gap-6">
            {lots.map(lot => {
              let images: string[] = []
              try { images = JSON.parse(lot.images || '[]') } catch {}
              const timeLeft = new Date(lot.endsAt).getTime() - Date.now()
              const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))
              const isUrgent = hoursLeft < 24

              return (
                <Link
                  key={lot.id}
                  href={`/lot/${lot.id}`}
                  className="group bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:border-[#2563EB]/40 hover:shadow-card transition-all"
                >
                  <div className="aspect-[16/10] bg-[#F1F5F9] relative overflow-hidden">
                    {images?.[0] ? (
                      <img 
                        src={images[0]} 
                        alt={lot.title || 'Лот'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] flex items-center justify-center">
                        <Gavel className="w-12 h-12 text-[#CBD5E1]" />
                      </div>
                    )}
                    {/* Live badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-md">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]"></span>
                      </span>
                      <span className="text-[10px] font-bold text-[#EF4444] uppercase tracking-wide">LIVE</span>
                    </div>
                    {/* Time left */}
                    <div className={`absolute bottom-3 right-3 px-2 py-1 rounded-md ${isUrgent ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-white/95 text-[#64748B]'}`}>
                      <div className="flex items-center gap-1 text-[11px] font-semibold">
                        <Clock className="w-3 h-3" />
                        {hoursLeft > 0 ? `${hoursLeft}год` : '< 1 год'}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-[14px] font-semibold text-[#0F172A] mb-2 line-clamp-2 group-hover:text-[#2563EB] transition-colors">
                      {lot.title || 'Без назви'}
                    </h3>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[11px] text-[#94A3B8] mb-0.5">Поточна ставка</p>
                        <p className="text-[18px] font-bold text-[#0B1220]">
                          {formatPrice(lot.currentPrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
                        <Gavel className="w-3 h-3" />
                        {lot._count.bids} ставок
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#F1F5F9] text-[11px] text-[#64748B]">
                      <User className="w-3 h-3" />
                      <span className="truncate">{lot.seller.name}</span>
                      <ShieldCheck className="w-3 h-3 text-[#10B981] ml-1" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-16 bg-[#F8FAFC] rounded-2xl border border-dashed border-[#CBD5E1]">
            <div className="w-16 h-16 bg-[#2563EB]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏷️</span>
            </div>
            <h3 className="text-lg font-semibold text-[#0B1220] mb-2">
              Перші лоти скоро зʼявляться
            </h3>
            <p className="text-[#64748B] mb-6 max-w-md mx-auto">
              Станьте першим продавцем на KRAM та отримайте 0% комісії на перші продажі.
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 h-12 px-8 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-[#1d4ed8] transition-all"
            >
              Створити перший лот
            </Link>
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 h-12 px-8 bg-[#2563EB] text-white rounded-xl font-semibold"
          >
            Переглянути всі лоти
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export function TrustSectionUpdated() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#F8FAFC]">
      <div className="max-w-[1320px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB]/10 rounded-full mb-4">
            <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
            <span className="text-sm font-semibold text-[#2563EB]">Безпечна угода KRAM</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B1220] mb-4">
            Статус угоди видно<br />до фінального підтвердження
          </h2>
          <p className="text-[#64748B] max-w-2xl mx-auto text-lg">
            Покупець оплачує замовлення, продавець відправляє товар, 
            а KRAM показує статус угоди на кожному кроці.
          </p>
        </div>

        {/* Visual Flow Timeline */}
        <div className="relative mb-16">
          <div className="grid md:grid-cols-5 gap-4">
            {[
              {
                icon: CreditCard,
                step: '1',
                title: 'Покупець оплачує',
                desc: 'Оплата фіксується в системі',
                color: 'bg-[#2563EB]',
                lightColor: 'bg-[#2563EB]/10',
              },
              {
                icon: Lock,
                step: '2',
                title: 'KRAM фіксує статус',
                desc: 'Оплата не позначається без підтвердження',
                color: 'bg-[#8B5CF6]',
                lightColor: 'bg-[#8B5CF6]/10',
              },
              {
                icon: Package,
                step: '3',
                title: 'Продавець відправляє',
                desc: 'Додається номер ТТН Нової пошти',
                color: 'bg-[#F59E0B]',
                lightColor: 'bg-[#F59E0B]/10',
              },
              {
                icon: Truck,
                step: '4',
                title: 'Покупець отримує',
                desc: 'Перевіряє товар на відділенні',
                color: 'bg-[#10B981]',
                lightColor: 'bg-[#10B981]/10',
              },
              {
                icon: Wallet,
                step: '5',
                title: 'Фінальне закриття',
                desc: 'Виплата після перевірки й підтвердження',
                color: 'bg-[#059669]',
                lightColor: 'bg-[#059669]/10',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:shadow-card transition-all h-full">
                  <div className={`w-12 h-12 ${item.lightColor} ${item.color.replace('bg-', 'text-')} rounded-xl flex items-center justify-center mb-4`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className={`w-6 h-6 ${item.color} text-white rounded-full flex items-center justify-center text-xs font-bold mb-3`}>
                    {item.step}
                  </div>
                  <h3 className="font-bold text-[#0B1220] mb-2 text-[15px]">{item.title}</h3>
                  <p className="text-[13px] text-[#64748B] leading-relaxed">{item.desc}</p>
                </div>
                {i < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-5 h-5 text-[#CBD5E1]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trust Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              icon: ShieldCheck,
              title: 'Статус перед виплатою прозорий',
              desc: 'Виплата доступна після підтвердження отримання або завершення без спору.',
              color: 'text-[#2563EB]',
              bgColor: 'bg-[#2563EB]/10',
            },
            {
              icon: MapPin,
              title: 'Доставка з трекінгом',
              desc: 'Номер відправлення та статус доставки видно в угоді.',
              color: 'text-[#F59E0B]',
              bgColor: 'bg-[#F59E0B]/10',
            },
            {
              icon: AlertCircle,
              title: 'Спір до завершення',
              desc: 'Якщо товар не прийшов або не відповідає опису — відкрийте спір.',
              color: 'text-[#EF4444]',
              bgColor: 'bg-[#EF4444]/10',
            },
            {
              icon: UserCheck,
              title: 'Перевірка продавців',
              desc: 'Профіль, історія угод і верифікація допомагають обирати надійних.',
              color: 'text-[#10B981]',
              bgColor: 'bg-[#10B981]/10',
            },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:border-[#2563EB]/20 hover:shadow-card transition-all">
              <div className={`w-11 h-11 ${card.bgColor} ${card.color} rounded-xl flex items-center justify-center mb-4`}>
                <card.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#0B1220] mb-2 text-[15px]">{card.title}</h3>
              <p className="text-[13px] text-[#64748B] leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Beta Note */}
        <div className="text-center">
          <p className="text-[13px] text-[#94A3B8] max-w-2xl mx-auto">
            Платіжна модель запускається поетапно: спочатку beta-підтвердження, 
            далі — автоматизовані платежі через провайдера.{' '}
            <Link href="/safety" className="text-[#2563EB] hover:underline">
              Детальніше про безпечні угоди →
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export function MobileAppsTeaser() {
  return (
    <section className="py-16 bg-[#0B1220]">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              KRAM у вашому смартфоні
            </h2>
            <p className="text-[#94A3B8] mb-8">
              Мобільний додаток для iOS та Android дозволить відстежувати лоти,
              робити ставки та отримувати сповіщення будь-де.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="h-12 px-6 bg-white/10 rounded-xl flex items-center gap-3 text-white opacity-60">
                <span className="text-2xl">🍎</span>
                <span className="font-medium">App Store</span>
                <span className="text-xs text-white/50">скоро</span>
              </div>
              <div className="h-12 px-6 bg-white/10 rounded-xl flex items-center gap-3 text-white opacity-60">
                <span className="text-2xl">🤖</span>
                <span className="font-medium">Google Play</span>
                <span className="text-xs text-white/50">скоро</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-[#2563EB]/20 to-[#1d4ed8]/20 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📱</span>
                </div>
                <p className="text-white/60 text-sm">Мобільний додаток</p>
                <p className="text-white font-semibold">У розробці</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FAQSection() {
  const faqs = [
    {
      q: 'Як створити перший лот?',
      a: 'Зареєструйтесь, натисніть «Продати», завантажте фото товару, вкажіть опис та стартову ціну, оберіть тривалість аукціону та опублікуйте лот.',
    },
    {
      q: 'Яка комісія платформи?',
      a: 'Для перших продавців комісія 0%. В подальшому комісія становитиме невеликий відсоток від успішної угоди — точні цифри будуть оголошені перед запуском.',
    },
    {
      q: 'Як працює доставка?',
      a: 'Продавець відправляє товар через Нову Пошту. Покупець отримує посилку, перевіряє товар та підтверджує отримання — після цього угода переходить до завершення.',
    },
    {
      q: 'Чи безпечно купувати на аукціоні?',
      a: 'Так. Ми верифікуємо продавців, зберігаємо історію ставок і показуємо прозорий статус угоди. До production-активації LiqPay не обіцяємо реальний escrow/hold.',
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0B1220] mb-4">
            Часті питання
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] open:bg-white open:shadow-card transition-all"
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer">
                <span className="font-semibold text-[#0B1220]">{faq.q}</span>
                <span className="w-8 h-8 bg-[#2563EB]/10 rounded-full flex items-center justify-center text-[#2563EB] group-open:rotate-180 transition-transform">
                  ↓
                </span>
              </summary>
              <div className="px-6 pb-6 text-[#64748B]">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#2563EB] via-[#1d4ed8] to-[#1e40af]">
      <div className="max-w-[1320px] mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Готові почати?
        </h2>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Приєднуйтесь до першої хвилі продавців та покупців на KRAM.
          Станьте частиною українського маркетплейсу чесних торгів.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/catalog"
            className="h-14 px-10 bg-white text-[#2563EB] rounded-xl font-bold hover:bg-white/90 transition-all hover:-translate-y-0.5"
          >
            Переглянути лоти
          </a>
          <a
            href="/sell"
            className="h-14 px-10 bg-transparent text-white border-2 border-white rounded-xl font-bold hover:bg-white/10 transition-all"
          >
            Створити лот
          </a>
        </div>
        <p className="mt-8 text-white/60 text-sm">
          Реєстрація безкоштовна • 0% комісії для перших продавців
        </p>
      </div>
    </section>
  )
}

// Beta banner at the top of the page
export function BetaBanner() {
  return (
    <div className="bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#F59E0B] text-white">
      <div className="max-w-[1320px] mx-auto px-4 py-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚧</span>
            <span className="font-bold text-[14px]">Beta-версія</span>
          </div>
          <p className="text-[13px] text-white/90">
            KRAM працює в beta-режимі: ми тестуємо безпечні угоди, сповіщення та доставку. Реальні платежі LiqPay будуть активовані після фінального sandbox тестування.
          </p>
          <a 
            href="#email-collection" 
            className="text-[13px] font-semibold underline hover:no-underline"
          >
            Повідомити про запуск →
          </a>
        </div>
      </div>
    </div>
  )
}

// Email collection section
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
    } catch (err) {
      alert('Помилка мережі. Спробуйте пізніше.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="email-collection" className="py-16 bg-gradient-to-br from-[#0B1220] to-[#1e293b]">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB]/20 rounded-full mb-6">
            <span className="text-xl">📬</span>
            <span className="text-sm font-medium text-[#60A5FA]">Список очікування</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Станьте першим на KRAM
          </h2>
          <p className="text-[#94A3B8] mb-8">
            Залиште email, і ми повідомимо, коли запустимо реальні платежі та відкриємо платформу для всіх.
          </p>

          {submitted ? (
            <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl p-6">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-[#10B981] mb-2">Готово!</h3>
              <p className="text-[#94A3B8]">
                Ви в списку очікування. Ми напишемо, коли KRAM буде готовий до продажів.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setType('seller')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    type === 'seller' 
                      ? 'bg-[#2563EB] text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <span className="text-xl mr-2">🏪</span>
                  Хочу продавати
                </button>
                <button
                  type="button"
                  onClick={() => setType('buyer')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    type === 'buyer' 
                      ? 'bg-[#2563EB] text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <span className="text-xl mr-2">🛒</span>
                  Хочу купувати
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#2563EB]"
                />
                <button
                  type="submit"
                  disabled={loading || !email.includes('@')}
                  className="h-12 px-8 bg-[#2563EB] text-white rounded-xl font-bold hover:bg-[#1d4ed8] transition-all disabled:opacity-50"
                >
                  {loading ? 'Збереження...' : 'Повідомити мене'}
                </button>
              </div>

              <p className="mt-4 text-[12px] text-white/50">
                Без спаму. Тільки запуск платформи та важливі оновлення.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
