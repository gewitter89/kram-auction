"use client";

import React from "react";
import Link from "next/link";
import { Gem, ShieldCheck, Truck, Scale } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950/40 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Бренд */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <Gem className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white font-display">
                KRAM<span className="text-emerald-500">.UA</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Перший в Україні преміальний торговий майданчик, що поєднує швидкість оголошень та азарт відкритих аукціонів.
            </p>
          </div>

          {/* Безпека */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Безпека
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/info/security" className="hover:text-emerald-400 transition-colors flex items-center gap-2">🛡️ Правила безпечної домовленості</Link></li>
              <li><Link href="/info/moderation" className="hover:text-emerald-400 transition-colors flex items-center gap-2">💬 Чат-модерація контактів</Link></li>
              <li><Link href="/info/verified-sellers" className="hover:text-emerald-400 transition-colors flex items-center gap-2">⭐ Перевірені продавці</Link></li>
              <li><Link href="/info/direct" className="hover:text-emerald-400 transition-colors flex items-center gap-2">🔒 Без платежів через KRAM</Link></li>
            </ul>
          </div>

          {/* Доставка */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-emerald-400" />
              Логістика
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/info/nova-poshta" className="hover:text-emerald-400 transition-colors flex items-center gap-2">📦 Нова Пошта (Авто-ТТН)</Link></li>
              <li><Link href="/info/ukrposhta" className="hover:text-emerald-400 transition-colors flex items-center gap-2">📬 Укрпошта Експрес</Link></li>
              <li><Link href="/info/meest" className="hover:text-emerald-400 transition-colors flex items-center gap-2">⚡ Meest ПОШТА</Link></li>
              <li><Link href="/info/pickup" className="hover:text-emerald-400 transition-colors flex items-center gap-2">📍 Пункти самовивозу</Link></li>
            </ul>
          </div>

          {/* Регламент */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-emerald-400" />
              Правила
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/info/terms" className="hover:text-emerald-400 transition-colors flex items-center gap-2">📜 Угода користувача</Link></li>
              <li><Link href="/info/bidding" className="hover:text-emerald-400 transition-colors flex items-center gap-2">🔨 Правила проведення торгів</Link></li>
              <li><Link href="/info/fees" className="hover:text-emerald-400 transition-colors flex items-center gap-2">📊 Безкоштовна beta</Link></li>
              <li><Link href="/info/support" className="hover:text-emerald-400 transition-colors flex items-center gap-2">📞 Служба підтримки (24/7)</Link></li>
            </ul>
          </div>

          {/* Мобільний додаток та Бот */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              📱 Мобільні сервіси
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Отримуйте миттєві пуш-повідомлення про нові ставки за допомогою нашого бота та додатків.
            </p>
            
            <div className="flex flex-col gap-2">
              {/* Telegram Bot */}
              <a
                href="https://t.me/kram_auction_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[#229ED9]/10 border border-[#229ED9]/30 hover:border-[#229ED9] hover:bg-[#229ED9]/20 px-3.5 py-2 text-[10px] font-bold text-[#229ED9] transition-all w-full justify-center"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 8.24l-1.85 8.7c-.14.63-.51.79-1.04.49l-2.82-2.08-1.36 1.31c-.15.15-.28.28-.57.28l.2-2.85 5.19-4.69c.23-.2-.05-.31-.35-.11l-6.42 4.04-2.76-.86c-.6-.19-.61-.6.13-.89l10.78-4.16c.5-.18.94.12.78.92z"/>
                </svg>
                <span>Telegram Бот @kram_auction_bot</span>
              </a>

              {/* App Store */}
              <button
                type="button"
                onClick={() => alert("📲 Мобільний додаток KRAM.UA для iOS незабаром з’явиться у TestFlight та App Store!")}
                className="flex items-center gap-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 px-3 py-1.5 text-left transition-all w-full cursor-pointer focus:outline-none"
              >
                <svg className="h-5 w-5 text-white fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z"/>
                </svg>
                <div className="text-[9px] leading-tight text-slate-400">
                  Завантажити з
                  <span className="block text-xs font-bold text-white font-display">App Store</span>
                </div>
              </button>

              {/* Google Play */}
              <button
                type="button"
                onClick={() => alert("🤖 Мобільний додаток KRAM.UA для Android незабаром з’явиться у Google Play! APK-файл також буде доступний для прямого завантаження.")}
                className="flex items-center gap-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 px-3 py-1.5 text-left transition-all w-full cursor-pointer focus:outline-none"
              >
                <svg className="h-5 w-5 text-white fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M5 3.14l11.45 11.44L3 17.75V3.91c0-.49.33-.87.82-1.01C4.16 2.8 4.6 2.92 5 3.14zm12.87.67c.36.16.66.45.83.82.04.1.09.2.11.31v14.12c-.02.11-.07.21-.11.31-.17.37-.47.66-.83.82-.41.18-.89.11-1.24-.19L11.75 14.9 16.63 4c.35-.3.83-.37 1.24-.19zm-3.32 12.02l-9.83 6.84c-.4.27-.9.27-1.3 0L14.55 15.83z"/>
                </svg>
                <div className="text-[9px] leading-tight text-slate-400">
                  Доступно в
                  <span className="block text-xs font-bold text-white font-display">Google Play</span>
                </div>
              </button>
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} KRAM.UA. Розроблено з використанням передових технологій. Всі права захищені.
          </p>
          <div className="flex gap-4 text-[11px] text-slate-500">
            <span className="hover:text-slate-300 cursor-pointer">UA</span>
            <span className="hover:text-slate-300 cursor-pointer">EN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
