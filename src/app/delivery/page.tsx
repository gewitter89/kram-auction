import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MessageSquare, ShieldAlert, ShieldCheck, Truck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Доставка за домовленістю сторін | KRAM',
  description: 'KRAM не є логістичним або фінансовим посередником. Покупець і продавець самостійно домовляються про спосіб доставки та розрахунку.',
}

const steps = [
  {
    icon: ShieldCheck,
    title: 'Узгодьте спосіб доставки',
    text: 'Обговоріть у чаті KRAM зручний спосіб доставки: Нова Пошта, інший перевізник або особиста зустріч.',
  },
  {
    icon: Truck,
    title: 'Обирайте безпечний спосіб розрахунку',
    text: 'Рекомендуємо післяплату з оглядом товару при отриманні. Не надсилайте повну передоплату незнайомим користувачам.',
  },
  {
    icon: ShieldAlert,
    title: 'Перевірте товар перед оплатою',
    text: 'Огляньте товар у відділенні перевізника або під час особистої зустрічі до передачі коштів.',
  },
  {
    icon: MessageSquare,
    title: 'Зберігайте переписку в KRAM',
    text: 'Домовляйтесь у чаті KRAM, щоб мати історію повідомлень у разі скарги або спірної ситуації.',
  },
]

export default function DeliveryPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#0B1220] py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.24),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_34%)]" />
        <div className="relative mx-auto max-w-[1120px] px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#93C5FD]">
            Логістика та розрахунки
          </div>
          <h1 className="mt-5 max-w-3xl text-[36px] font-black leading-tight tracking-tight text-white md:text-[56px]">
            Доставка за домовленістю сторін
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[#CBD5E1]">
            KRAM не є логістичним або фінансовим посередником. Покупець і продавець самостійно домовляються про спосіб доставки та розрахунку.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalog" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-bold text-[#0B1220] transition hover:-translate-y-0.5 hover:shadow-premium">
              Переглянути лоти <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/safety" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-[14px] font-bold text-white transition hover:bg-white/10">
              Поради з безпеки
            </Link>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="mx-auto max-w-[1120px] px-4 py-14 md:py-18">
        <div className="grid gap-5 md:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <article key={step.title} className="rounded-[1.75rem] border border-[#E2E8F0] bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-premium">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-black tracking-[0.18em] text-[#CBD5E1]">{index + 1}</span>
                </div>
                <h2 className="text-[17px] font-bold tracking-tight text-[#0B1220]">{step.title}</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-[#64748B]">{step.text}</p>
              </article>
            )
          })}
        </div>

        {/* Disclaimer Card */}
        <div className="mt-10">
          <aside className="rounded-[1.75rem] border border-[#BAE6FD] bg-[#F0F9FF] p-7">
            <h3 className="text-[18px] font-black text-[#0B1220]">Чесний дисклеймер KRAM</h3>
            <p className="mt-3 text-[14px] leading-relaxed text-[#035985] font-medium">
              KRAM не перевозить товари, не приймає оплату, не зберігає кошти та не проводить виплати. Платформа лише допомагає користувачам знаходити лоти, робити ставки та домовлятися напряму.
            </p>
          </aside>
        </div>
      </section>
    </main>
  )
}
