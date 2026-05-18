import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, HelpCircle, LifeBuoy, MessageCircle, ShieldCheck, Send, Mail, CheckCircle } from 'lucide-react'
import { SupportForm } from '@/components/support/SupportForm'

export const metadata: Metadata = {
  title: 'Підтримка | KRAM',
  description: 'Куди звертатись щодо угод, доставки, оплат, спорів і безпеки на KRAM.',
}

const topics = [
  {
    icon: ShieldCheck,
    title: 'Безпечна угода',
    text: 'Питання щодо статусів, безпечної взаємодії або завершення прямих домовленостей.',
    href: '/safety',
  },
  {
    icon: MessageCircle,
    title: 'Спір між сторонами',
    text: 'Якщо товар не відповідає опису, виникли труднощі з доставкою або сторона не виходить на зв\'язок.',
    href: '/safety',
  },
  {
    icon: HelpCircle,
    title: 'Оформлення та доставка',
    text: 'Пояснення статусів домовленості, вказання ТТН, вибору служби доставки (Нова Пошта).',
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
            <a 
              href="https://t.me/kram_support" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-6 py-3 text-[14px] font-bold text-white transition hover:-translate-y-0.5 hover:shadow-premium hover:bg-[#1a8ac7]"
            >
              <Send className="h-4 w-4" /> Написати в Telegram (@kram_support)
            </a>
            <a href="mailto:support@kram.auction" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-[#0B1220] transition hover:-translate-y-0.5 hover:shadow-premium">
              <Mail className="h-4 w-4 text-[#64748B]" /> support@kram.auction
            </a>
          </div>
        </div>

        {/* Contact/Ticket Form and Topics Grid */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#E2E8F0] bg-white p-8 shadow-card">
              <h2 className="text-[22px] font-black text-[#0B1220] mb-2">Надіслати запит до підтримки</h2>
              <p className="text-[14px] text-[#64748B] mb-6">Заповніть форму, і наші менеджери зв'яжуться з вами протягом 15 хвилин.</p>
              
              <SupportForm />
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-[14px] font-bold text-[#94A3B8] uppercase tracking-wider">Популярні теми</h3>
            <div className="grid gap-4">
              {topics.map((topic) => {
                const Icon = topic.icon
                return (
                  <Link key={topic.title} href={topic.href} className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-sm">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-[#2563EB]" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-[#0B1220] group-hover:text-[#2563EB] transition-colors">{topic.title}</h4>
                        <p className="mt-1 text-[13px] leading-relaxed text-[#64748B]">{topic.text}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
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
