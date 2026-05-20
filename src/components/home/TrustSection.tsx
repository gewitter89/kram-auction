import { Star, Headphones, ShieldCheck, Truck, Lock, CreditCard, ArrowRight } from 'lucide-react'
import type { SVGProps } from 'react'

const features = [
  {
    icon: Lock,
    title: 'Прозорий статус домовленості',
    desc: 'KRAM фіксує домовленість, повідомлення, ТТН та підтвердження отримання. Оплату сторони погоджують напряму.',
    color: 'text-[#10B981]',
  },
  {
    icon: Truck,
    title: 'Інтеграція Нової Пошти',
    desc: 'Продавець додає ТТН, покупець бачить номер відправлення та підтверджує отримання в кабінеті.',
    color: 'text-[#2563EB]',
  },
  {
    icon: Star,
    title: 'Репутація після угод',
    desc: 'Профілі показують активні лоти, завершені домовленості та відгуки тільки після реальних угод.',
    color: 'text-[#F59E0B]',
  },
  {
    icon: Headphones,
    title: 'Модерація та скарги',
    desc: 'Якщо користувач порушує правила, можна подати скаргу. Модерація перевіряє докази та може обмежити профіль.',
    color: 'text-[#A855F7]',
  },
]

const steps = [
  { icon: CreditCard, label: 'Домовленість' },
  { icon: Clock, label: 'Узгодження' },
  { icon: Truck, label: 'Відправлення' },
  { icon: ShieldCheck, label: 'Огляд' },
  { icon: CheckCircle, label: 'Завершення' },
]

function CheckCircle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function Clock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export function TrustSection() {
  return (
    <section className="relative bg-[#0B1220] overflow-hidden py-24">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5L55 30L30 55L5 30L30 5Z' stroke='%23ffffff' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
      }}></div>

      {/* Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#2563EB] opacity-[0.07] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#10B981] opacity-[0.05] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-[1320px] mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span className="text-[11px] font-bold text-white uppercase tracking-widest">KRAM Transparent Deal Flow</span>
          </div>
          <h2 className="text-[32px] md:text-[48px] font-black text-white tracking-tight mb-6 leading-tight">
            Прозора домовленість без <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#10B981]">зайвих обіцянок</span>
          </h2>
          <p className="text-[16px] text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            KRAM не приймає оплату й не є escrow-сервісом. Наша роль — прозоро зафіксувати ставки, переписку, статуси та допомогти модерацією у разі порушень.
          </p>
        </div>

        {/* Visual Flow */}
        <div className="max-w-4xl mx-auto mb-20 p-8 bg-white/[0.02] border border-white/[0.05] rounded-[32px] backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="flex flex-col items-center gap-4 relative group flex-1">
                  <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-[#2563EB]/10 group-hover:border-[#2563EB]/40">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider">{step.label}</span>
                  {i < steps.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-8 -right-4 w-4 h-4 text-white/20" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="group p-8 bg-white/[0.03] border border-white/[0.06] rounded-[24px] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all">
                <div className="w-12 h-12 bg-white/[0.06] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-[17px] font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-[14px] text-[#94A3B8] leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Bottom stats */}
        <div className="mt-20 pt-12 border-t border-white/[0.08] flex flex-wrap justify-center gap-12 md:gap-24">
          <div className="text-center">
            <p className="text-[40px] font-black text-white">5</p>
            <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest mt-2">Статусів угоди</p>
          </div>
          <div className="text-center">
            <p className="text-[40px] font-black text-white">0₴</p>
            <p className="text-[13px] font-bold text-[#10B981] uppercase tracking-widest mt-2">Комісія на старті</p>
          </div>
          <div className="text-center">
            <p className="text-[40px] font-black text-white">MVP</p>
            <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest mt-2">Ручне підтвердження</p>
          </div>
        </div>
      </div>
    </section>
  )
}
