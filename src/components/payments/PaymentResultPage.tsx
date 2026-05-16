import Link from 'next/link'
import { ArrowLeft, Clock, ShieldCheck, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type PaymentResultStatus = 'success' | 'pending' | 'failed'

const content: Record<PaymentResultStatus, {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  accent: string
  bg: string
}> = {
  success: {
    icon: ShieldCheck,
    eyebrow: 'Оплата прийнята',
    title: 'Повертаємось до угоди',
    description: 'Ми оновимо статус після підтвердження платіжного callback. Якщо статус ще не змінився, відкрийте деталі угоди за кілька секунд.',
    accent: 'text-[#10B981]',
    bg: 'from-[#ECFDF5] to-white'
  },
  pending: {
    icon: Clock,
    eyebrow: 'Оплата перевіряється',
    title: 'Статус платежу очікується',
    description: 'KRAM показує проміжний стан, доки LiqPay або ручна перевірка не підтвердить оплату. Не створюйте повторну оплату без потреби.',
    accent: 'text-[#F59E0B]',
    bg: 'from-[#FFFBEB] to-white'
  },
  failed: {
    icon: XCircle,
    eyebrow: 'Оплата не завершена',
    title: 'Спробуйте ще раз або поверніться до угоди',
    description: 'Платіж міг бути скасований або відхилений. У beta-режимі можна повернутися до угоди та обрати доступний спосіб підтвердження.',
    accent: 'text-[#EF4444]',
    bg: 'from-[#FEF2F2] to-white'
  }
}

export function PaymentResultPage({ status }: { status: PaymentResultStatus }) {
  const item = content[status]
  const Icon = item.icon

  return (
    <main className={`min-h-screen bg-gradient-to-br ${item.bg} px-4 py-16`}>
      <div className="mx-auto max-w-[720px] rounded-[1.75rem] border border-[#E2E8F0] bg-white p-8 text-center shadow-premium">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F8FAFC]">
          <Icon className={`h-8 w-8 ${item.accent}`} />
        </div>
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-[#64748B]">{item.eyebrow}</p>
        <h1 className="mb-4 text-[32px] font-black tracking-[-0.03em] text-[#0B1220] sm:text-[40px]">{item.title}</h1>
        <p className="mx-auto mb-8 max-w-[560px] text-[16px] leading-7 text-[#64748B]">{item.description}</p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/cabinet?tab=purchases" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 text-[14px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#1D4ED8]">
            <ArrowLeft className="h-4 w-4" />
            Повернутися до угоди
          </Link>
          <Link href="/payments" className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-6 text-[14px] font-semibold text-[#0B1220] transition hover:border-[#BFDBFE]">
            Як працює оплата
          </Link>
        </div>
      </div>
    </main>
  )
}
