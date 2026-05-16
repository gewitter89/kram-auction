'use client'

import { Send } from 'lucide-react'

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
      icon: '📦',
      title: 'Створіть лот',
      desc: 'Додайте фото, опис, стартову ціну та час завершення торгів.',
    },
    {
      icon: '💰',
      title: 'Зробіть ставку',
      desc: 'Покупці бачать поточну ціну й чесно змагаються за товар.',
    },
    {
      icon: '🛡️',
      title: 'Безпечна оплата',
      desc: 'Кошти не передаються продавцю, доки покупець не підтвердить отримання.',
    },
    {
      icon: '🚚',
      title: 'Доставка',
      desc: 'Нова Пошта допомагає швидко й зрозуміло завершити угоду.',
    },
  ]

  return (
    <section className="py-16 bg-[#F8FAFC]">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0B1220] mb-4">
            Як працює KRAM
          </h2>
          <p className="text-[#64748B]">
            Чотири простих кроки від лоту до угоди
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all hover:-translate-y-1 hover:shadow-card">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] rounded-xl flex items-center justify-center text-2xl mb-4">
                {step.icon}
              </div>
              <div className="text-sm font-bold text-[#2563EB] mb-2">
                Крок {i + 1}
              </div>
              <h3 className="text-lg font-bold text-[#0B1220] mb-2">{step.title}</h3>
              <p className="text-sm text-[#64748B]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function LiveAuctionsNow() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1220] mb-2">
              Живі торги зараз
            </h2>
            <p className="text-[#64748B]">
              Активні лоти з реальними ставками
            </p>
          </div>
          <a
            href="/catalog"
            className="hidden md:inline-flex items-center gap-2 h-10 px-5 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors"
          >
            Всі лоти
          </a>
        </div>

        {/* Empty state */}
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
          <a
            href="/sell"
            className="inline-flex items-center gap-2 h-12 px-8 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-[#1d4ed8] transition-all"
          >
            Створити перший лот
          </a>
        </div>
      </div>
    </section>
  )
}

export function TrustSectionUpdated() {
  const features = [
    {
      icon: '🛡️',
      title: 'Безпечна оплата',
      desc: 'Кошти резервуються до підтвердження отримання товару',
    },
    {
      icon: '✓',
      title: 'Перевірені продавці',
      desc: 'Кожен продавець проходить верифікацію перед публікацією лотів',
    },
    {
      icon: '⭐',
      title: 'Рейтинг і відгуки',
      desc: 'Прозора система оцінювання та відгуків після кожної угоди',
    },
    {
      icon: '🤝',
      title: 'Спірні ситуації',
      desc: 'Підтримка у вирішенні конфліктних ситуацій між сторонами',
    },
    {
      icon: '📊',
      title: 'Прозора історія ставок',
      desc: 'Всі ставки публічні та доступні для перегляду в реальному часі',
    },
    {
      icon: '🚚',
      title: 'Доставка Новою Поштою',
      desc: 'Надійна доставка по всій Україні з трекінгом посилок',
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#F8FAFC]">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0B1220] mb-4">
            Безпека угоди
          </h2>
          <p className="text-[#64748B] max-w-2xl mx-auto">
            KRAM будує модель безпечної угоди: прозорі ставки, перевірка продавців,
            рейтинг, повідомлення та контроль статусу покупки.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-[#E2E8F0] hover:shadow-card transition-shadow">
              <div className="w-10 h-10 bg-[#2563EB]/10 rounded-lg flex items-center justify-center text-xl mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-[#0B1220] mb-2">{f.title}</h3>
              <p className="text-sm text-[#64748B]">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-[#94A3B8]">
            Безпечна угода з escrow — у розробці / запускається поетапно
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
      a: 'Продавець відправляє товар через Нову Пошту. Покупець отримує посилку, перевіряє товар та підтверджує отримання — тільки тоді кошти передаються продавцю.',
    },
    {
      q: 'Чи безпечно купувати на аукціоні?',
      a: 'Так. Ми верифікуємо продавців, зберігаємо історію ставок та розробляємо систему безпечної угоди з резервуванням коштів.',
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
