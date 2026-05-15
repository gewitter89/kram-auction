import { Star, Headphones, Lock, BadgeCheck } from 'lucide-react'

const features = [
  {
    icon: Lock,
    title: 'Ескроу-захист',
    desc: 'Гроші покупця заморожуються на нашому рахунку до підтвердження отримання товару.',
    color: 'text-[#10B981]',
  },
  {
    icon: BadgeCheck,
    title: 'Верифікація продавців',
    desc: 'Кожен продавець проходить перевірку документів та контактних даних.',
    color: 'text-[#2563EB]',
  },
  {
    icon: Star,
    title: 'Чесні відгуки',
    desc: 'Тільки реальні покупці можуть залишати відгуки. Без накруток.',
    color: 'text-[#F59E0B]',
  },
  {
    icon: Headphones,
    title: 'Підтримка 24/7',
    desc: 'Команда саппорту відповість протягом години у будь-який день.',
    color: 'text-[#A855F7]',
  },
]

export function TrustSection() {
  return (
    <section className="relative bg-[#0B1220] overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5L55 30L30 55L5 30L30 5Z' stroke='%23ffffff' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
      }}></div>

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#2563EB] opacity-10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-[1320px] mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <span className="inline-block text-[12px] font-bold text-[#10B981] uppercase tracking-[0.2em] mb-2">Безпека угод</span>
          <h2 className="text-[28px] md:text-[36px] font-bold text-white tracking-tight mb-3">Чому KRAM — це безпечно</h2>
          <p className="text-[15px] text-[#94A3B8] max-w-lg mx-auto">
            Ми побудували систему захисту, щоб кожна угода завершувалася успішно
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="p-6 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl hover:bg-white/[0.06] transition-colors">
                <div className="w-11 h-11 bg-white/[0.06] rounded-xl flex items-center justify-center mb-4">
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-[15px] font-bold text-white mb-2">{f.title}</h3>
                <p className="text-[13px] text-[#94A3B8] leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Bottom stats */}
        <div className="mt-12 pt-10 border-t border-white/[0.08] grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="text-center">
            <p className="text-[28px] md:text-[32px] font-bold text-white">99.7%</p>
            <p className="text-[12px] text-[#94A3B8] mt-1">успішних угод</p>
          </div>
          <div className="text-center border-x border-white/[0.08]">
            <p className="text-[28px] md:text-[32px] font-bold text-white">24/7</p>
            <p className="text-[12px] text-[#94A3B8] mt-1">підтримка</p>
          </div>
          <div className="text-center">
            <p className="text-[28px] md:text-[32px] font-bold text-white">4.8★</p>
            <p className="text-[12px] text-[#94A3B8] mt-1">оцінка користувачів</p>
          </div>
        </div>
      </div>
    </section>
  )
}
