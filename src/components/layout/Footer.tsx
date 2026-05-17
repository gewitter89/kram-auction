import Link from 'next/link'
import { KramLogo } from '@/components/brand/KramLogo'

export function Footer() {
  return (
    <footer className="bg-[#0B1220] border-t border-white/10 text-white">
      <div className="max-w-[1320px] mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <KramLogo variant="dark" size={34} />
            </div>
            <p className="text-[13px] text-white/50 leading-relaxed mb-1.5">
              Український маркетплейс чесних торгів та безпечних онлайн-аукціонів.
            </p>
            <p className="text-[11px] text-[#2563EB] font-semibold tracking-wider uppercase">
              KRAM · ЧЕСНА ЦІНА
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-bold tracking-wider uppercase text-white/90 mb-4">Покупцям</h4>
            <ul className="space-y-2.5">
              <li><Link href="/catalog" className="text-[13px] text-white/60 hover:text-[#2563EB] hover:translate-x-0.5 transition-all duration-200 inline-block">Каталог товарів</Link></li>
              <li><Link href="/payments" className="text-[13px] text-white/60 hover:text-[#2563EB] hover:translate-x-0.5 transition-all duration-200 inline-block">Як купувати</Link></li>
              <li><Link href="/safety" className="text-[13px] text-white/60 hover:text-[#2563EB] hover:translate-x-0.5 transition-all duration-200 inline-block">Безпечна угода</Link></li>
              <li><Link href="/delivery" className="text-[13px] text-white/60 hover:text-[#2563EB] hover:translate-x-0.5 transition-all duration-200 inline-block">Умови доставки</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold tracking-wider uppercase text-white/90 mb-4">Продавцям</h4>
            <ul className="space-y-2.5">
              <li><Link href="/sell" className="text-[13px] text-white/60 hover:text-[#10B981] hover:translate-x-0.5 transition-all duration-200 inline-block">Створити лот</Link></li>
              <li><Link href="/delivery" className="text-[13px] text-white/60 hover:text-[#10B981] hover:translate-x-0.5 transition-all duration-200 inline-block">Як продавати</Link></li>
              <li><Link href="/payments" className="text-[13px] text-white/60 hover:text-[#10B981] hover:translate-x-0.5 transition-all duration-200 inline-block">Тарифи платформи</Link></li>
              <li><Link href="/safety" className="text-[13px] text-white/60 hover:text-[#10B981] hover:translate-x-0.5 transition-all duration-200 inline-block">Верифікація акаунту</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold tracking-wider uppercase text-white/90 mb-4">Правила</h4>
            <ul className="space-y-2.5">
              <li><Link href="/terms" className="text-[13px] text-white/60 hover:text-[#3B82F6] hover:translate-x-0.5 transition-all duration-200 inline-block">Про нас</Link></li>
              <li><Link href="/support" className="text-[13px] text-white/60 hover:text-[#3B82F6] hover:translate-x-0.5 transition-all duration-200 inline-block">Контакти підтримки</Link></li>
              <li><Link href="/terms" className="text-[13px] text-white/60 hover:text-[#3B82F6] hover:translate-x-0.5 transition-all duration-200 inline-block">Угода користувача</Link></li>
              <li><Link href="/privacy" className="text-[13px] text-white/60 hover:text-[#3B82F6] hover:translate-x-0.5 transition-all duration-200 inline-block">Конфіденційність</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold tracking-wider uppercase text-white/90 mb-4">Підтримка</h4>
            <ul className="space-y-2.5">
              <li><Link href="/support" className="text-[13px] text-white/60 hover:text-[#3B82F6] hover:translate-x-0.5 transition-all duration-200 inline-block">FAQ</Link></li>
              <li><Link href="/support" className="text-[13px] text-white/60 hover:text-[#3B82F6] hover:translate-x-0.5 transition-all duration-200 inline-block">Подати запит</Link></li>
              <li><Link href="/safety" className="text-[13px] text-white/60 hover:text-[#3B82F6] hover:translate-x-0.5 transition-all duration-200 inline-block">Вирішення спорів</Link></li>
              <li><Link href="/safety" className="text-[13px] text-white/60 hover:text-[#3B82F6] hover:translate-x-0.5 transition-all duration-200 inline-block">Поради з безпеки</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <p className="text-[12px] text-white/30">&copy; 2026 KRAM. Всі права захищені.</p>
            <div className="hidden sm:block w-1.5 h-1.5 bg-white/10 rounded-full" />
            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]"></span>
              </span>
              Усі системи працюють стабільно (Beta)
            </div>
          </div>

          {/* Grayscale Fintech Secure Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 opacity-30 select-none">
            <span className="text-[10px] font-bold tracking-widest uppercase border border-white px-2 py-0.5 rounded">Visa</span>
            <span className="text-[10px] font-bold tracking-widest uppercase border border-white px-2 py-0.5 rounded">Mastercard</span>
            <span className="text-[10px] font-bold tracking-widest uppercase border border-white px-2 py-0.5 rounded">Nova Poshta</span>
            <span className="text-[9px] font-extrabold tracking-widest uppercase border border-white px-2 py-0.5 rounded flex items-center gap-1">🔒 SSL Secured</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
