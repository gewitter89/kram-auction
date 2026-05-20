import { Footer } from '@/components/layout/Footer'
import { AlertTriangle, Award, Users, Heart } from 'lucide-react'

export const metadata = {
  title: 'Про проект | KRAM',
  description: 'Прозорі онлайн-аукціони товарів та електроніки в Україні від творців KRAM.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[800px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FEF3C7] border border-[#F59E0B]/20 rounded-full mb-4">
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
            <span className="text-[12px] font-medium text-[#D97706]">Платформа прямих торгів</span>
          </div>
          <h1 className="text-[32px] font-bold text-[#0B1220] mb-4">Про маркетплейс KRAM</h1>
          <p className="text-[#64748B]">
            Нова культура чесних та безпечних онлайн-аукціонів в Україні.
          </p>
        </div>

        <div className="space-y-10">
          <section className="text-[#475569] leading-relaxed space-y-4">
            <p>
              <strong>KRAM</strong> — це сучасний український онлайн-аукціон та маркетплейс, створений для забезпечення максимального рівня прозорості та довіри між покупцями та продавцями. 
            </p>
            <p>
              Ми втомилися від фішингу, прихованих комісій та фальшивих ставок, які заважають розвитку електронної комерції в Україні. KRAM пропонує зовсім інший підхід: кристально чисті торги, живі оновлення ставок, миттєве Telegram-інформування та прозору фіксацію домовленостей у кабінеті.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
            <div className="p-5 bg-white border border-[#E2E8F0] rounded-2xl text-center">
              <Award className="w-8 h-8 text-[#2563EB] mx-auto mb-3" />
              <h4 className="font-bold text-[#0F172A] text-[15px] mb-1">Чесні торги</h4>
              <p className="text-[#64748B] text-[12px]">Кожна ставка є остаточною та підтверджується системою.</p>
            </div>
            <div className="p-5 bg-white border border-[#E2E8F0] rounded-2xl text-center">
              <Users className="w-8 h-8 text-[#2563EB] mx-auto mb-3" />
              <h4 className="font-bold text-[#0F172A] text-[15px] mb-1">Спільнота KRAM</h4>
              <p className="text-[#64748B] text-[12px]">Продавці проходять верифікацію через Дія або BankID.</p>
            </div>
            <div className="p-5 bg-white border border-[#E2E8F0] rounded-2xl text-center">
              <Heart className="w-8 h-8 text-[#2563EB] mx-auto mb-3" />
              <h4 className="font-bold text-[#0F172A] text-[15px] mb-1">Турбота про безпеку</h4>
              <p className="text-[#64748B] text-[12px]">Статуси посилок та угод координуються у вашому кабінеті.</p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">Наш підхід до запуску</h2>
            <p className="text-[#475569] leading-relaxed">
              Ми запускаємо KRAM як платформу прямих домовленостей: продавці створюють лоти, покупці роблять ставки, а оплату й доставку сторони погоджують напряму. KRAM не приймає оплату та не утримує кошти; наша роль — прозоро фіксувати лоти, ставки, повідомлення, ТТН, статуси домовленості та скарги.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
