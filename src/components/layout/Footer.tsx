import Link from 'next/link'
import { KramLogo } from '@/components/brand/KramLogo'

export function Footer() {
  return (
    <footer className="bg-[#0B1220] border-t border-white/10 text-white">
      <div className="max-w-[1320px] mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <KramLogo variant="dark" size={32} />
            </div>
            <p className="text-[12.5px] text-slate-400 leading-relaxed mb-3">
              Українська платформа прозорих онлайн-торгів та оголошень.
            </p>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              KRAM · ПРОЗОРІ ОНЛАЙН-ТОРГИ
            </p>
          </div>

          {/* Column 1 */}
          <div>
            <h4 className="text-[10.5px] font-bold tracking-wider uppercase text-slate-400 mb-4">Покупцям</h4>
            <ul className="space-y-2.5">
              <li><Link href="/catalog" className="text-[13px] text-slate-300 hover:text-[#2563EB] transition-colors">Каталог товарів</Link></li>
              <li><Link href="/safety" className="text-[13px] text-slate-300 hover:text-[#2563EB] transition-colors">Поради з безпеки</Link></li>
              <li><Link href="/rules" className="text-[13px] text-slate-300 hover:text-[#2563EB] transition-colors">Заборонені лоти</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-[10.5px] font-bold tracking-wider uppercase text-slate-400 mb-4">Продавцям</h4>
            <ul className="space-y-2.5">
              <li><Link href="/sellers" className="text-[13px] text-slate-300 hover:text-[#10B981] transition-colors">Для продавців</Link></li>
              <li><Link href="/sell" className="text-[13px] text-slate-300 hover:text-[#10B981] transition-colors">Створити лот</Link></li>
              <li><Link href="/cabinet/verify" className="text-[13px] text-slate-300 hover:text-[#10B981] transition-colors">Верифікація продавців</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-[10.5px] font-bold tracking-wider uppercase text-slate-400 mb-4">Умови</h4>
            <ul className="space-y-2.5">
              <li><Link href="/terms" className="text-[13px] text-slate-300 hover:text-[#2563EB] transition-colors">Угода користувача</Link></li>
              <li><Link href="/privacy" className="text-[13px] text-slate-300 hover:text-[#2563EB] transition-colors">Конфіденційність</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="text-[10.5px] font-bold tracking-wider uppercase text-slate-400 mb-4">Допомога</h4>
            <ul className="space-y-2.5">
              <li><Link href="/disputes" className="text-[13px] text-slate-300 hover:text-[#EF4444] transition-colors">Вирішення спорів</Link></li>
              <li><Link href="/safety" className="text-[13px] text-slate-300 hover:text-[#2563EB] transition-colors">Центр безпеки</Link></li>
            </ul>
          </div>


          {/* Column 5 */}
          <div>
            <h4 className="text-[10.5px] font-bold tracking-wider uppercase text-slate-400 mb-4">Категорії</h4>
            <ul className="space-y-2.5">
              <li><Link href="/category/phones" className="text-[13px] text-slate-300 hover:text-[#2563EB] transition-colors">Телефони</Link></li>
              <li><Link href="/category/laptops" className="text-[13px] text-slate-300 hover:text-[#2563EB] transition-colors">Ноутбуки</Link></li>
              <li><Link href="/category/games" className="text-[13px] text-slate-300 hover:text-[#2563EB] transition-colors">Ігри та консолі</Link></li>
              <li><Link href="/category/tools" className="text-[13px] text-slate-300 hover:text-[#2563EB] transition-colors">Інструменти</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <p className="text-[11.5px] text-slate-500">&copy; 2026 KRAM. Усі права застережено.</p>
            <div className="hidden sm:block w-1 h-1 bg-white/10 rounded-full" />
            
            {/* Direct agreement state badge */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#F59E0B]">
              <span className="relative flex h-1.5 w-1.5 animate-pulse">
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#F59E0B]"></span>
              </span>
              Прямі домовленості: KRAM не приймає оплату
            </div>
          </div>

          {/* Simple non-misleading courier details */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold select-none">
            <span>📫 Доставка Новою Поштою за домовленістю сторін</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
