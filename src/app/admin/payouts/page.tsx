import Link from 'next/link'
import { Archive, ArrowLeft } from 'lucide-react'

export default function PayoutsPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/admin" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#64748B] hover:text-[#0B1220] mb-6">
        <ArrowLeft className="w-4 h-4" /> Назад в адмінку
      </Link>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center mx-auto mb-4">
          <Archive className="w-7 h-7" />
        </div>
        <h1 className="text-[22px] font-bold text-[#0F172A] mb-2">Виплати вимкнені</h1>
        <p className="text-[14px] text-[#64748B] leading-relaxed max-w-xl mx-auto">
          KRAM працює у режимі прямих домовленостей: платформа не приймає оплату, не утримує кошти покупців і не проводить виплати продавцям. Цей розділ залишено лише як заглушку для майбутньої платіжної моделі.
        </p>
      </div>
    </div>
  )
}
