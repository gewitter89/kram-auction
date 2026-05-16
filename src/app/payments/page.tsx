import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, CreditCard, RefreshCcw, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Оплати | KRAM',
  description: 'Як працюють manual/MVP payment states і майбутнє production-підключення LiqPay на KRAM.',
}

const statuses = [
  ['Очікує підтвердження оплати', 'Угода створена, покупець має перейти до оплати або підтвердження.'],
  ['Оплату підтверджено — очікує відправлення', 'Продавець бачить угоду тільки після підтвердженого payment status.'],
  ['Відправлено — очікує підтвердження покупця', 'Покупець перевіряє доставку та завершує угоду.'],
  ['Угоду завершено', 'Після підтвердження отримання угода закривається.'],
]

export default function PaymentsPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <section className="mx-auto max-w-[1120px] px-4 py-16 md:py-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#DBEAFE] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1D4ED8]">
              LiqPay readiness
            </div>
            <h1 className="mt-5 max-w-3xl text-[36px] font-black leading-tight tracking-tight text-[#0B1220] md:text-[56px]">
              Оплати без фейкових production-обіцянок
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[#64748B]">
              KRAM готовий до LiqPay-flow: створення платежу, callback signature verification, idempotent processing і статуси в кабінеті. До production-активації сервіс чесно показує manual/MVP режим.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/safety" className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-5 py-3 text-[14px] font-bold text-white transition hover:-translate-y-0.5 hover:shadow-premium">
                Безпечна угода <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/support" className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1] bg-white px-5 py-3 text-[14px] font-bold text-[#0B1220] transition hover:border-[#93C5FD]">
                Звернутись у підтримку
              </Link>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-[#E2E8F0] bg-white p-6 shadow-premium">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#10B981]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-[18px] font-black text-[#0B1220]">Payment status first</h2>
                <p className="text-[13px] text-[#64748B]">Продавець не бачить “оплачено” до підтвердженого статусу.</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {statuses.map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <p className="text-[14px] font-bold text-[#0B1220]">{title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#64748B]">{text}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <article className="rounded-[1.75rem] border border-[#E2E8F0] bg-white p-6 shadow-card">
            <CreditCard className="h-7 w-7 text-[#2563EB]" />
            <h2 className="mt-4 text-[18px] font-black text-[#0B1220]">Manual/MVP зараз</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#64748B]">Покупець може підтвердити оплату вручну; інтерфейс маркує цей режим як beta, а не як реальний escrow/hold.</p>
          </article>
          <article className="rounded-[1.75rem] border border-[#E2E8F0] bg-white p-6 shadow-card">
            <BadgeCheck className="h-7 w-7 text-[#10B981]" />
            <h2 className="mt-4 text-[18px] font-black text-[#0B1220]">LiqPay callback</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#64748B]">Callback перевіряє signature, зберігає payment status і не дублює активні payment attempts.</p>
          </article>
          <article className="rounded-[1.75rem] border border-[#E2E8F0] bg-white p-6 shadow-card">
            <RefreshCcw className="h-7 w-7 text-[#F59E0B]" />
            <h2 className="mt-4 text-[18px] font-black text-[#0B1220]">Повернення та спори</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#64748B]">До реальних payouts спір або повернення обробляються через support/admin flow з історією подій угоди.</p>
          </article>
        </div>
      </section>
    </main>
  )
}
