import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, HelpCircle, LifeBuoy, MessageCircle, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Підтримка | KRAM',
  description: 'Куди звертатись щодо угод, доставки, оплат, спорів і безпеки на KRAM.',
}

const topics = [
  {
    icon: ShieldCheck,
    title: 'Безпечна угода',
    text: 'Питання щодо статусів, manual confirmation, LiqPay callback або завершення угоди.',
    href: '/safety',
  },
  {
    icon: MessageCircle,
    title: 'Спір між сторонами',
    text: 'Якщо товар не відповідає опису, доставка затрималась або сторона не відповідає.',
    href: '/safety',
  },
  {
    icon: HelpCircle,
    title: 'Оплата чи доставка',
    text: 'Пояснення payment states, ТТН, Nova Poshta та наступного кроку в кабінеті.',
    href: '/payments',
  },
]

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <section className="mx-auto max-w-[1120px] px-4 py-16 md:py-24">
        <div className="rounded-[2rem] bg-[#0B1220] p-8 text-white shadow-premium md:p-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#93C5FD]">
            <LifeBuoy className="h-7 w-7" />
          </div>
          <h1 className="mt-6 max-w-3xl text-[36px] font-black leading-tight tracking-tight md:text-[56px]">
            Підтримка KRAM
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[#CBD5E1]">
            Якщо у вас питання щодо покупки, продажу, доставки, оплати або спору — пишіть у підтримку й додавайте номер угоди/лота, щоб ми швидше перевірили історію подій.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="mailto:support@kram.auction" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-bold text-[#0B1220] transition hover:-translate-y-0.5 hover:shadow-premium">
              support@kram.auction <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/cabinet" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-[14px] font-bold text-white transition hover:bg-white/10">
              Мій кабінет
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {topics.map((topic) => {
            const Icon = topic.icon
            return (
              <Link key={topic.title} href={topic.href} className="group rounded-[1.75rem] border border-[#E2E8F0] bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-premium">
                <Icon className="h-7 w-7 text-[#2563EB]" />
                <h2 className="mt-4 text-[18px] font-black text-[#0B1220]">{topic.title}</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-[#64748B]">{topic.text}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold text-[#2563EB]">
                  Детальніше <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>

        <aside className="mt-10 rounded-[1.75rem] border border-[#FDE68A] bg-[#FFFBEB] p-7">
          <div className="flex gap-4">
            <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-[#F59E0B]" />
            <div>
              <h2 className="text-[18px] font-black text-[#0B1220]">Безпека понад усе</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#92400E]">
                Не надсилайте оплату за сторонніми посиланнями, не передавайте коди підтвердження та не переносіть угоду в приватні месенджери для оплати. Якщо бачите підозрілу поведінку — відкрийте спір або напишіть у підтримку.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
