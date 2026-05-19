import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, ShieldAlert, Truck, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Угоди та безпека | KRAM',
  description: 'Правила безпечних прямих угод, розрахунків та безпеки на інформаційній платформі KRAM.',
}

const statuses = [
  ['Очікує узгодження умов', 'Покупець створює запит. Сторони списуються в чаті KRAM для вибору способу доставки та оплати.'],
  ['Узгоджено — очікує відправлення', 'Продавець готує товар до відправки згідно з домовленістю.'],
  ['Відправлено — очікує отримання', 'Продавець надсилає ТТН перевізника покупцю для зручного відстеження.'],
  ['Угоду завершено', 'Покупець отримує та оглядає посилку, після чого позначає домовленість як виконану.'],
]

export default function PaymentsPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <section className="mx-auto max-w-[1120px] px-4 py-16 md:py-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#2563EB]">
              Classified mode
            </div>
            <h1 className="mt-5 max-w-3xl text-[36px] font-black leading-tight tracking-tight text-[#0B1220] md:text-[52px]">
              Прямі угоди та безпека торгів
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[#64748B]">
              KRAM працює як інформаційний майданчик. Платформа не є фінансовим чи логістичним посередником: ми не приймаємо оплату, не утримуємо кошти покупців та не робимо виплат продавцям.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/safety" className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-5 py-3 text-[14px] font-bold text-white transition hover:-translate-y-0.5 hover:shadow-premium">
                Поради покупцям <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/support" className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1] bg-white px-5 py-3 text-[14px] font-bold text-[#0B1220] transition hover:border-[#93C5FD]">
                Зв’язатися з модератором
              </Link>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-[#E2E8F0] bg-white p-6 shadow-premium">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-[18px] font-black text-[#0B1220]">Етапи прямих торгів</h2>
                <p className="text-[13px] text-[#64748B]">Як фіксуються домовленості в нашому кабінеті</p>
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
          <article className="rounded-[1.75rem] border border-[#E2E8F0] bg-white p-6 shadow-card hover:shadow-premium transition-all">
            <Truck className="h-7 w-7 text-[#2563EB]" />
            <h2 className="mt-4 text-[18px] font-black text-[#0B1220]">Тільки післяплата</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#64748B]">Ми настійно радимо використовувати накладений платіж при отриманні у відділенні Нової Пошти, щоб перевірити лот перед оплатою.</p>
          </article>
          <article className="rounded-[1.75rem] border border-[#E2E8F0] bg-white p-6 shadow-card hover:shadow-premium transition-all">
            <BadgeCheck className="h-7 w-7 text-[#10B981]" />
            <h2 className="mt-4 text-[18px] font-black text-[#0B1220]">Прозорість та рейтинг</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#64748B]">Вся історія ставок на аукціоні публічна та прозора. Це мотивує учасників додержуватись своїх зобов’язань.</p>
          </article>
          <article className="rounded-[1.75rem] border border-[#E2E8F0] bg-white p-6 shadow-card hover:shadow-premium transition-all">
            <ShieldAlert className="h-7 w-7 text-[#EF4444]" />
            <h2 className="mt-4 text-[18px] font-black text-[#0B1220]">Безпека та скарги</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#64748B]">Якщо користувач порушує правила, пропонує сумнівні схеми чи відмовляється надсилати лот — негайно тисніть кнопку скарги.</p>
          </article>
        </div>
      </section>
    </main>
  )
}
