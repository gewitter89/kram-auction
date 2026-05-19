import Link from 'next/link'
import { ShieldCheck, Clock, ArrowLeft, User } from 'lucide-react'

// Static SSR page - no auth required for initial render
export default function VerifyPage() {
  return (
    <div className="max-w-[1320px] mx-auto px-4 py-12">
      <div className="max-w-[600px] mx-auto">
        {/* Back link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-[14px] text-[#64748B] hover:text-[#0F172A] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> На головну
        </Link>

        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 md:p-10 shadow-sm">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-5">
            <ShieldCheck className="w-7 h-7 text-amber-500" />
          </div>
          
          <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight mb-3">
            Верифікація продавців
          </h1>
          
          <p className="text-[15px] text-[#64748B] leading-relaxed mb-6">
            KRAM наразі використовує ручну/контактну перевірку продавця. Автоматична перевірка через Дія або BankID може бути підключена окремим етапом.
          </p>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-[13px] font-semibold text-amber-800">Верифікація продавців — скоро</span>
            </div>
            <p className="text-[12px] text-amber-700">
              Поки що профіль продавця не підтверджується автоматично. Ми не показуємо позначку &quot;Підтверджено&quot;, якщо реальної перевірки немає.
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#0F172A]">Увійдіть, щоб відкрити налаштування верифікації</p>
              </div>
            </div>
          </div>

          <Link 
            href="/auth/login?callbackUrl=/cabinet/verify" 
            className="inline-flex items-center justify-center w-full h-12 bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] transition-colors"
          >
            Увійти
          </Link>
        </div>
      </div>
    </div>
  )
}
