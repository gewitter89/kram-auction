import Link from 'next/link'
import { KramLogo } from '@/components/brand/KramLogo'

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0]">
      <div className="max-w-[1320px] mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3"><KramLogo variant="full" /></div>
            <p className="text-[13px] text-[#64748B] leading-relaxed">
              Український маркетплейс чесних торгів
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-1 italic">
              KRAM — чесна ціна твого лота
            </p>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold text-[#0F172A] mb-3">Покупцям</h4>
            <ul className="space-y-2">
              <li><Link href="/catalog" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Каталог</Link></li>
              <li><Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Як купувати</Link></li>
              <li><Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Безпечна угода</Link></li>
              <li><Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Доставка</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold text-[#0F172A] mb-3">Продавцям</h4>
            <ul className="space-y-2">
              <li><Link href="/sell" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Створити лот</Link></li>
              <li><Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Як продавати</Link></li>
              <li><Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Тарифи</Link></li>
              <li><Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Верифікація</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold text-[#0F172A] mb-3">Компанія</h4>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Про нас</Link></li>
              <li><Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Контакти</Link></li>
              <li><Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Правила</Link></li>
              <li><Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Конфіденційність</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold text-[#0F172A] mb-3">Допомога</h4>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">FAQ</Link></li>
              <li><Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Підтримка</Link></li>
              <li><Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Спори</Link></li>
              <li><Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Безпека</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[#94A3B8]">&copy; 2026 KRAM. Всі права захищені.</p>
          <div className="flex items-center gap-4 text-[12px] text-[#94A3B8]">
            <span>Україна</span>
            <span>UA / RU / EN</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
