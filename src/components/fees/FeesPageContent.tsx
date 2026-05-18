'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Footer } from '@/components/layout/Footer'
import { Check, Sparkles, Shield, ArrowRight, HelpCircle, ChevronDown, Award, Sparkle } from 'lucide-react'

interface Feature {
  title: string
  description: string
}

const freeFeatures: Feature[] = [
  {
    title: 'Необмежені лоти',
    description: 'Створюйте будь-яку кількість аукціонів та оголошень без жодних лімітів на кількість фото чи опис.',
  },
  {
    title: '0% комісії для всіх',
    description: 'Жодних прихованих відсотків або зборів. Уся сума угоди залишається у вас — розрахунки здійснюються напряму.',
  },
  {
    title: 'Безкоштовні ставки',
    description: 'Беріть участь у торгах та робіть пропозиції на будь-які лоти без купівлі додаткових пакетів чи токенів.',
  },
  {
    title: 'Зручний кабінет угоди',
    description: 'Фіксуйте етапи домовленостей (узгодження, відправка, отримання, завершення) у прозорому та зручному інтерфейсі.',
  },
  {
    title: 'Безпечний чат',
    description: 'Обговорюйте деталі оплати та доставки Новою Поштою безпосередньо на платформі для вашої безпеки.',
  },
  {
    title: 'Активна модерація',
    description: 'Наша команда цілодобово перевіряє скарги та блокує порушників для захисту чесних користувачів.',
  },
]

const faqs = [
  {
    q: 'Чому всі функції KRAM є безкоштовними?',
    a: 'Наразі KRAM працює в режимі beta-тестування для перевірки попиту на онлайн-торги в Україні. Ми не приймаємо платежі та не стягуємо комісій, щоб кожен міг спробувати платформу абсолютно безпечно та безкоштовно.',
  },
  {
    q: 'Чи потрібно вводити дані банківської картки при реєстрації?',
    a: 'Ні! KRAM не збирає платіжні дані, не вимагає прив\'язки карток та не проводить онлайн-еквайринг. Усі розрахунки відбуваються безпосередньо між покупцем і продавцем (ми рекомендуємо післяплату при отриманні на пошті).',
  },
  {
    q: 'Чи планується введення платних підписок у майбутньому?',
    a: 'Під час beta-періоду платформа є повністю безкоштовною. Якщо в майбутньому з\'являться додаткові преміум-сервіси (наприклад, пріоритетне просування або VIP-оформлення), вони підключатимуться виключно за вашим бажанням. Основні функції торгів завжди залишаться доступними.',
  },
  {
    q: 'Як захистити свої кошти під час угоди?',
    a: 'Оскільки KRAM не є фінансовим escrow-посередником, ми наполегливо радимо погоджувати відправку лотів Новою Поштою з післяплатою (накладеним платежем). Оглядайте товар у відділенні перед передачею грошей.',
  },
]

export function FeesPageContent() {
  const { data: session } = useSession()
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-[#2563EB]/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[180px] left-1/2 -translate-x-1/2 w-[550px] h-[250px] bg-[#2563EB]/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-[1320px] mx-auto px-4 py-16 relative z-10">
        
        {/* Page Hero */}
        <div className="text-center max-w-[800px] mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full mb-4">
            <Award className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[11px] font-bold text-[#2563EB] tracking-wider uppercase">Beta-запуск платформи</span>
          </div>
          <h1 className="text-[36px] sm:text-[44px] font-black text-[#0B1220] tracking-tight mb-4 leading-tight">
            Прозорі умови без <span className="bg-gradient-to-r from-[#2563EB] to-emerald-600 bg-clip-text text-transparent">жодних комісій</span>
          </h1>
          <p className="text-[15px] sm:text-[16px] text-[#64748B] leading-relaxed">
            Під час тестування beta-версії KRAM усі функції, лоти та ставки є повністю безкоштовними. Ми не приймаємо платежі та не стягуємо відсотків з угод.
          </p>
        </div>

        {/* Big Premium Free Card */}
        <div className="max-w-[900px] mx-auto bg-gradient-to-b from-[#0F172A] to-[#020617] text-white rounded-[2.5rem] p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden mb-20">
          <div className="absolute right-0 bottom-0 top-0 left-1/3 bg-[radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.18),_transparent_60%)] pointer-events-none" />
          
          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkle className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[12px] font-extrabold uppercase tracking-widest">Тариф "Beta-Старт"</span>
              </div>
              <h2 className="text-[28px] sm:text-[34px] font-black tracking-tight leading-none mb-3">
                Повний доступ за 0 ₴
              </h2>
              <p className="text-[14px] text-slate-300 leading-relaxed mb-6">
                Кожен зареєстрований користувач отримує максимальні можливості для торгівлі та купівлі товарів без передплат, тарифних планів та прихованих зборів.
              </p>

              <div className="flex flex-wrap gap-4">
                <a 
                  href="/sell" 
                  className="h-12 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-[14px] font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2563EB]/25"
                >
                  <span>Створити лот</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a 
                  href="/catalog" 
                  className="h-12 px-6 border border-white/20 hover:bg-white/10 text-white rounded-xl text-[14px] font-bold transition-all flex items-center justify-center"
                >
                  Переглянути торги
                </a>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <h3 className="text-[16px] font-black mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#2563EB]" />
                Чесний Beta-режим
              </h3>
              <ul className="space-y-3.5">
                <li className="flex items-start gap-2.5 text-[13px] text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={3} />
                  <span>Комісія з продажу — <b>0%</b></span>
                </li>
                <li className="flex items-start gap-2.5 text-[13px] text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={3} />
                  <span>Участь в аукціонах — <b>0 ₴</b></span>
                </li>
                <li className="flex items-start gap-2.5 text-[13px] text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={3} />
                  <span>Без лімітів на оголошення</span>
                </li>
                <li className="flex items-start gap-2.5 text-[13px] text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={3} />
                  <span>Прямі розрахунки на пошті</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Free Features Grid */}
        <div className="mb-24">
          <div className="text-center max-w-[600px] mx-auto mb-12">
            <h2 className="text-[26px] font-extrabold text-[#0B1220] tracking-tight">Що включено у безкоштовний пакет</h2>
            <p className="text-[13px] text-[#64748B] mt-1.5">Всі інструменти KRAM доступні кожному учаснику з першої секунди</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {freeFeatures.map((feat, idx) => (
              <div key={idx} className="bg-white border border-[#E2E8F0] hover:border-[#BFDBFE] rounded-3xl p-6 shadow-sm hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/30 flex items-center justify-center mb-4 text-[#2563EB]">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
                <h3 className="text-[15px] font-bold text-[#0B1220] mb-2">{feat.title}</h3>
                <p className="text-[13px] text-[#64748B] leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-[800px] mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-[24px] font-extrabold text-[#0B1220] tracking-tight">Поширені запитання</h2>
            <p className="text-[13px] text-[#64748B] mt-1">Відповіді на важливі фінансові та організаційні питання про KRAM</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-[#0F172A] hover:bg-slate-50 transition-colors text-[14px] sm:text-[15px]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#94A3B8] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#2563EB]' : ''}`} />
                  </button>
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      isOpen ? 'max-h-[220px] border-t border-slate-100 p-6' : 'max-h-0'
                    }`}
                  >
                    <p className="text-[13px] text-[#64748B] leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}
