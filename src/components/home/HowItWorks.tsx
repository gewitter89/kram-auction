import { Search, Gavel, ShieldCheck, Truck } from 'lucide-react'

const steps = [
  {
    icon: Search,
    step: '1',
    title: 'Знайдіть лот',
    desc: 'Перші лоти від продавців по всій Україні на чесних торгах',
    color: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    icon: Gavel,
    step: '2',
    title: 'Зробіть ставку',
    desc: 'Беріть участь у живих аукціонах. Ставку приймуть миттєво.',
    color: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600'
  },
  {
    icon: ShieldCheck,
    step: '3',
    title: 'Контрольована оплата',
    desc: 'Статус оплати видно в угоді; у beta можливе ручне підтвердження',
    color: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  {
    icon: Truck,
    step: '4',
    title: 'Отримайте товар',
    desc: 'Доставка Новою Поштою по всій Україні. Підтвердіть отримання.',
    color: 'from-purple-500 to-pink-600',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
]

export function HowItWorks() {
  return (
    <section className="bg-white border-y border-[#E2E8F0]">
      <div className="max-w-[1320px] mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <span className="inline-block text-[12px] font-bold text-[#2563EB] uppercase tracking-[0.2em] mb-2">Простий процес</span>
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#0B1220] tracking-tight">Як це працює</h2>
          <p className="text-[15px] text-[#64748B] mt-2 max-w-md mx-auto">Чотири кроки до вигідної угоди</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-100 via-amber-100 to-purple-100" />

          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="relative text-center group">
                <div className={`w-16 h-16 mx-auto mb-5 ${s.iconBg} rounded-2xl flex items-center justify-center relative z-10 shadow-card group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${s.iconColor}`} />
                </div>
                <span className="text-[11px] font-extrabold text-[#94A3B8] uppercase tracking-wider">Крок {s.step}</span>
                <h3 className="text-[17px] font-bold text-[#0B1220] mt-2 mb-2 tracking-tight">{s.title}</h3>
                <p className="text-[14px] text-[#64748B] leading-relaxed max-w-[240px] mx-auto">{s.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
