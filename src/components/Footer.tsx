"use client";

import React from "react";
import Link from "next/link";
import { Gem, ShieldCheck, Truck, Scale, LifeBuoy } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950/40 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
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
              Первая в Украине премиальная торговая площадка, совмещающая скорость объявлений и азарт открытых аукционов.
            </p>
          </div>

          {/* Безопасность */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Безопасность
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>🛡️ Безопасная сделка KRAM</li>
              <li>💬 Чат-модерация контактов</li>
              <li>⭐ Проверенные продавцы</li>
              <li>🔒 Депонирование средств</li>
            </ul>
          </div>

          {/* Доставка */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-emerald-400" />
              Логистика
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>📦 Новая Почта (Авто-ТТН)</li>
              <li>📬 Укрпочта Экспресс</li>
              <li>⚡ Meest ПОШТА</li>
              <li>📍 Пункты самовывоза</li>
            </ul>
          </div>

          {/* Регламент */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-emerald-400" />
              Правила
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>📜 Пользовательское соглашение</li>
              <li>🔨 Правила проведения торгов</li>
              <li>📊 Тарифы и комиссии площадки</li>
              <li>📞 Служба поддержки (24/7)</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} KRAM.UA. Разработано с использованием передовых технологий. Все права защищены.
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
