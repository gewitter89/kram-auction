'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Footer } from '@/components/layout/Footer'
import { Check, Sparkles, Shield, ArrowRight, Lock, HelpCircle, Loader2, CreditCard, ChevronDown, Award } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Plan {
  id: string
  name: string
  price: number
  period: string
  description: string
  badge?: string
  buttonText: string
  theme: 'basic' | 'pro' | 'vip'
  features: string[]
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Базовий',
    price: 0,
    period: 'назавжди',
    description: 'Оптимальний вибір для поодиноких продажів та знайомства з аукціонами.',
    buttonText: 'Обрано за замовчуванням',
    theme: 'basic',
    features: [
      'До 3-х активних лотів одночасно',
      'Максимальна тривалість торгів — 7 днів',
      'До 3-х фотографій у кожному лоті',
      'Стандартна модерація оголошень',
      'Стандартна торгова комісія 5% при успішній угоді'
    ]
  },
  {
    id: 'pro',
    name: 'PRO Продавець',
    price: 199,
    period: 'місяць',
    description: 'Для активних продавців, бізнесів та інтернет-магазинів.',
    badge: 'Найпопулярніший',
    buttonText: 'Активувати PRO',
    theme: 'pro',
    features: [
      'Безлімітна кількість активних лотів',
      'Максимальна тривалість торгів — 14 днів',
      'До 10 високоякісних фотографій у лоті',
      'Пріоритет у списку автокомпліту та пошуку',
      'Знижена комісія угоди: лише 3%',
      'Значок "PRO" у профілі та на картках лотів',
      'Пріоритетна підтримка 24/7'
    ]
  },
  {
    id: 'vip',
    name: 'VIP Platinum',
    price: 499,
    period: 'місяць',
    description: 'Ексклюзивний пакет привілеїв для максимального охоплення та VIP-продажів.',
    badge: 'Колекційний рівень',
    buttonText: 'Активувати Platinum',
    theme: 'vip',
    features: [
      'Всі переваги PRO рівня',
      '3D-підсвічування та анімований золотий градієнт лотів',
      'Повна відсутність торгових комісій (0% за все)',
      'Миттєві SMS та Telegram-повідомлення про ставки',
      'Максимальна тривалість торгів — 30 днів',
      'Миттєва модерація за 5 хвилин',
      'Особистий VIP-консультант KRAM'
    ]
  }
]

const faqs = [
  {
    q: 'Як саме працює 3D-підсвічування лотів у VIP-тарифі?',
    a: 'У загальній сітці каталогу ваші картки товарів отримують унікальну золоту рамку, інтерактивний ефект нахилу та мʼяке анімоване сяйво. Це виділяє ваші лоти серед інших та приваблює до 4.8 разів більше переглядів та реальних ставок покупців.'
  },
  {
    q: 'Чи стягується плата, якщо мій аукціон завершився без ставок?',
    a: 'Ні. Публікація лотів на KRAM є повністю безкоштовною. Якщо лот не продано, ви не платите абсолютно нічого. Для тарифів Basic та PRO комісія стягується лише за умови успішного викупу та підтвердження безпечної угоди.'
  },
  {
    q: 'Як скасувати або змінити тарифний план?',
    a: 'Ви можете керувати підпискою у будь-який час у розділі "Налаштування" вашого Кабінету. Скасувати підписку можна в один клік — всі привілеї залишаться активними до кінця оплаченого періоду.'
  },
  {
    q: 'Які переваги дає Beta-акція 0% комісії?',
    a: 'Наразі на платформі діє Beta-акція для нових користувачів. Перші 50 продавців отримують повністю безкоштовні перші 3 успішні угоди (комісія 0% замість 5%) на базовому тарифі.'
  }
]

export function FeesPageContent() {
  const { data: session } = useSession()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  // Interactive Payment Form States
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  
  // Payment execution states
  const [paymentStep, setPaymentStep] = useState<'idle' | 'connecting' | 'authorizing' | 'processing' | 'success'>('idle')
  const [paymentProgress, setPaymentProgress] = useState(0)
  const [activeMembership, setActiveMembership] = useState<string | null>(null)

  // Format Card input
  const handleCardNumberChange = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '))
    } else {
      setCardNumber(v)
    }
  }

  const handleExpiryChange = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      setCardExpiry(`${v.slice(0, 2)}/${v.slice(2, 4)}`)
    } else {
      setCardExpiry(v)
    }
  }

  // Auto-fill demo credentials
  const fillDemoCard = () => {
    setCardNumber('4242 4242 4242 4242')
    setCardHolder(session?.user?.name ? session.user.name.toUpperCase() : 'KRAM PREMIUM CLIENT')
    setCardExpiry('12/29')
    setCardCvv('777')
  }

  // Trigger payment flow
  const handlePay = () => {
    if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) return

    setPaymentStep('connecting')
    setPaymentProgress(15)

    const timer1 = setTimeout(() => {
      setPaymentStep('authorizing')
      setPaymentProgress(45)
    }, 1200)

    const timer2 = setTimeout(() => {
      setPaymentStep('processing')
      setPaymentProgress(80)
    }, 2400)

    const timer3 = setTimeout(() => {
      setPaymentStep('success')
      setPaymentProgress(100)
      if (selectedPlan) {
        setActiveMembership(selectedPlan.id)
      }
    }, 3800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }

  const resetPayment = () => {
    setPaymentStep('idle')
    setPaymentProgress(0)
    setCardNumber('')
    setCardHolder('')
    setCardExpiry('')
    setCardCvv('')
    setSelectedPlan(null)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Background radial effects */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[200px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-400/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[1320px] mx-auto px-4 py-16 relative z-10">
        
        {/* Page Hero */}
        <div className="text-center max-w-[800px] mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-blue-50 border border-blue-200/50 rounded-full mb-4 animate-pulse">
            <Award className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[12px] font-bold text-[#2563EB] tracking-wide uppercase">Оновлення привілеїв 2026</span>
          </div>
          <h1 className="text-[36px] sm:text-[44px] font-black text-[#0B1220] tracking-tight mb-4 leading-tight">
            Оберіть свій рівень <span className="bg-gradient-to-r from-[#2563EB] to-purple-600 bg-clip-text text-transparent">успішних торгів</span>
          </h1>
          <p className="text-[15px] sm:text-[16px] text-[#64748B] leading-relaxed">
            Виділяйте свої лоти чарівним анімованим свіченням, продавайте з нульовою комісією платформи та отримуйте VIP-підтримку на кожному кроці.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-stretch">
          {plans.map((plan) => {
            const isVip = plan.theme === 'vip'
            const isPro = plan.theme === 'pro'
            const isActive = activeMembership ? activeMembership === plan.id : plan.id === 'basic'

            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-3xl transition-all duration-300 relative ${
                  isVip
                    ? 'bg-gradient-to-b from-[#111827] to-[#030712] text-white border border-[#F59E0B]/40 shadow-2xl shadow-[#F59E0B]/10 hover:-translate-y-1.5 hover:shadow-3xl hover:shadow-[#F59E0B]/15'
                    : isPro
                    ? 'bg-white border-2 border-[#2563EB] shadow-xl hover:-translate-y-1.5 hover:shadow-2xl'
                    : 'bg-white border border-[#E2E8F0] shadow-sm hover:border-[#CBD5E1] hover:-translate-y-1'
                }`}
              >
                {/* Status indicator badges */}
                {plan.badge && (
                  <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isVip ? 'bg-[#F59E0B] text-black' : 'bg-[#2563EB] text-white'
                  }`}>
                    {plan.badge}
                  </span>
                )}

                {isActive && (
                  <span className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                    Активний
                  </span>
                )}

                {/* Plan Header */}
                <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-white/5">
                  <h3 className={`text-[20px] font-extrabold ${isVip ? 'text-white' : 'text-[#0B1220]'}`}>{plan.name}</h3>
                  <p className={`text-[12px] mt-1.5 line-clamp-2 ${isVip ? 'text-white/60' : 'text-[#64748B]'}`}>{plan.description}</p>
                  
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className={`text-[36px] font-black tracking-tight ${isVip ? 'text-white' : 'text-[#0B1220]'}`}>
                      {plan.price > 0 ? `${plan.price} ₴` : '0 ₴'}
                    </span>
                    <span className={`text-[12px] font-medium ${isVip ? 'text-white/50' : 'text-[#94A3B8]'}`}>/ {plan.period}</span>
                  </div>
                </div>

                {/* Plan Features */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between gap-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isVip ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-blue-50 text-[#2563EB]'
                        }`}>
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </span>
                        <span className={`text-[13px] leading-snug ${isVip ? 'text-white/80' : 'text-[#475569]'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Pricing Action Button */}
                  <button
                    onClick={() => {
                      if (plan.price > 0 && !isActive) {
                        setSelectedPlan(plan)
                      }
                    }}
                    disabled={plan.price === 0 || isActive}
                    className={`w-full h-12 rounded-2xl text-[14px] font-bold transition-all flex items-center justify-center gap-2 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 cursor-default'
                        : plan.price === 0
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : isVip
                        ? 'bg-gradient-to-r from-[#F59E0B] to-amber-500 text-black hover:opacity-95 shadow-md shadow-[#F59E0B]/20 hover:scale-[1.01]'
                        : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md shadow-[#2563EB]/15 hover:scale-[1.01]'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check className="w-4 h-4" strokeWidth={3} />
                        <span>Тариф підключено</span>
                      </>
                    ) : (
                      <>
                        {isVip && <Sparkles className="w-4 h-4 animate-spin text-black" />}
                        <span>{plan.buttonText}</span>
                        <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-[800px] mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-[24px] font-extrabold text-[#0B1220]">Поширені питання</h2>
            <p className="text-[13px] text-[#64748B] mt-1">Ознайомтесь з деталями прощення тарифів та роботи VIP-статусу</p>
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
                      isOpen ? 'max-h-[200px] border-t border-slate-100 p-6' : 'max-h-0'
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

      {/* Payment and Success Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-[500px] w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">Безпечний еквайринг KRAM</span>
                <h3 className="text-[18px] font-extrabold text-[#0B1220] mt-0.5">Оформлення підписки</h3>
              </div>
              {paymentStep === 'idle' && (
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6">
              
              {/* Plan Summary Badge */}
              <div className={`p-4 rounded-2xl flex items-center justify-between mb-6 ${
                selectedPlan.theme === 'vip' ? 'bg-[#111827] text-white' : 'bg-blue-50 text-blue-900'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    selectedPlan.theme === 'vip' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-blue-200 text-[#2563EB]'
                  }`}>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black uppercase tracking-wider">{selectedPlan.name}</h4>
                    <span className="text-[11px] opacity-75">{selectedPlan.description.slice(0, 42)}...</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[16px] font-black">{selectedPlan.price} ₴</p>
                  <p className="text-[9px] opacity-60">/ {selectedPlan.period}</p>
                </div>
              </div>

              {paymentStep === 'idle' ? (
                /* Payment form inputs */
                <div className="space-y-4">
                  
                  {/* Real-time Virtual Credit Card Render */}
                  <div className={`p-5 rounded-2xl text-white relative overflow-hidden shadow-lg mb-6 transition-all duration-500 ${
                    selectedPlan.theme === 'vip'
                      ? 'bg-gradient-to-br from-[#1E1B18] via-[#B8860B] to-[#0A0908] border border-[#F59E0B]/30'
                      : 'bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900'
                  }`}>
                    {/* VIP Watermark decoration */}
                    {selectedPlan.theme === 'vip' && (
                      <div className="absolute right-0 bottom-0 top-0 left-1/3 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />
                    )}

                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 bg-white/20 rounded-full" />
                        <span className="text-[10px] font-black tracking-widest uppercase">KRAM CARD</span>
                      </div>
                      <span className="text-[11px] font-extrabold italic opacity-60">Premium Pay</span>
                    </div>

                    <p className="text-[16px] font-mono tracking-[0.2em] mb-4 text-center">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </p>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[7px] opacity-60 uppercase tracking-wider">Власник картки</p>
                        <p className="text-[11px] font-bold uppercase tracking-wide truncate max-w-[180px]">
                          {cardHolder || 'KRAM CUSTOMER'}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-[7px] opacity-60 uppercase tracking-wider">Діє до</p>
                          <p className="text-[11px] font-mono font-bold">{cardExpiry || 'MM/YY'}</p>
                        </div>
                        <div>
                          <p className="text-[7px] opacity-60 uppercase tracking-wider">CVV</p>
                          <p className="text-[11px] font-mono font-bold">{cardCvv || '•••'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Autofill test credentials badge */}
                  <button
                    onClick={fillDemoCard}
                    className="w-full py-2 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-[11px] text-[#2563EB] font-bold hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center justify-center gap-1.5"
                  >
                    ⚡ Заповнити реквізити демо-картки
                  </button>

                  {/* Form fields */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Номер картки</label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-mono focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Імʼя на картці</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="IVAN PETROV"
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] uppercase focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Термін дії</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-mono text-center focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Код CVV</label>
                      <input
                        type="password"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="•••"
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-mono text-center focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handlePay}
                    disabled={!cardNumber || !cardHolder || !cardExpiry || !cardCvv}
                    className="w-full h-12 mt-6 bg-[#2563EB] text-white rounded-2xl text-[14px] font-black hover:bg-[#1D4ED8] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#2563EB]/15 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Сплатити {selectedPlan.price} ₴ безпечно</span>
                  </button>

                  <p className="text-[10px] text-[#94A3B8] text-center flex items-center justify-center gap-1 mt-3">
                    🛡️ Безпечний платіж сертифіковано PCI-DSS
                  </p>
                </div>
              ) : paymentStep !== 'success' ? (
                /* Processing states animations */
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6 relative">
                    <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
                  </div>
                  
                  <h4 className="text-[16px] font-extrabold text-[#0B1220] mb-2">
                    {paymentStep === 'connecting' && 'Встановлюємо шифроване зʼєднання...'}
                    {paymentStep === 'authorizing' && 'Авторизація платіжного шлюзу...'}
                    {paymentStep === 'processing' && 'Проведення захищеного транзиту коштів...'}
                  </h4>
                  
                  <p className="text-[12px] text-[#64748B] max-w-[280px] mb-6">
                    Будь ласка, не оновлюйте сторінку та не закривайте вікно браузера.
                  </p>

                  {/* Progress bar loader */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-[320px]">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${paymentProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                /* Complete success checkout layout */
                <div className="py-6 flex flex-col items-center justify-center text-center animate-scale-up">
                  {/* Glorious success checkmark badge */}
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 relative shadow-lg shadow-emerald-500/10">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping" />
                    <Check className="w-8 h-8 text-[#10B981]" strokeWidth={3} />
                  </div>

                  <h3 className="text-[20px] font-black text-emerald-950 mb-2">Оплата успішна!</h3>
                  <p className="text-[13px] text-emerald-800/80 max-w-[320px] mb-6">
                    Дякуємо! Статус вашого профілю успішно оновлено. Ваші привілеї вже активовані.
                  </p>

                  {/* Upgraded membership status layout card */}
                  <div className={`p-5 rounded-2xl text-left border w-full max-w-[360px] relative overflow-hidden mb-6 ${
                    selectedPlan.theme === 'vip'
                      ? 'bg-gradient-to-br from-[#111827] to-[#030712] text-white border-[#F59E0B]/30'
                      : 'bg-white border-blue-200 text-slate-800'
                  }`}>
                    {selectedPlan.theme === 'vip' && (
                      <div className="absolute right-0 bottom-0 top-0 left-1/3 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />
                    )}

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${selectedPlan.theme === 'vip' ? 'text-amber-500' : 'text-[#2563EB]'}`}>
                          ПАСПОРТ ПРИВІЛЕЇВ KRAM
                        </p>
                        <h4 className="text-[14px] font-black mt-0.5">{selectedPlan.name}</h4>
                      </div>
                      <span className="text-[18px]">👑</span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100/10">
                      <p className="text-[11px] flex justify-between">
                        <span className="opacity-60">Користувач:</span>
                        <span className="font-bold">{session?.user?.name || 'Клієнт KRAM'}</span>
                      </p>
                      <p className="text-[11px] flex justify-between">
                        <span className="opacity-60">Торгова комісія:</span>
                        <span className="font-bold text-emerald-500">
                          {selectedPlan.theme === 'vip' ? '0% (Повністю відсутня)' : '3%'}
                        </span>
                      </p>
                      <p className="text-[11px] flex justify-between">
                        <span className="opacity-60">Активно до:</span>
                        <span className="font-bold">
                          {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('uk-UA')}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={resetPayment}
                    className="w-full h-11 max-w-[200px] bg-slate-900 text-white rounded-xl text-[13px] font-bold hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Повернутися
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
