"use client";

import React from "react";
import Link from "next/link";
import { Gem, ShieldCheck, Truck, Scale } from "lucide-react";

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
              <li>🛡️ Безпечна угода KRAM</li>
              <li>💬 Чат-модерація контактів</li>
              <li>⭐ Перевірені продавці</li>
              <li>🔒 Депонування коштів</li>
            </ul>
          </div>

          {/* Доставка */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-emerald-400" />
              Логістика
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>📦 Нова Пошта (Авто-ТТН)</li>
              <li>📬 Укрпошта Експрес</li>
              <li>⚡ Meest ПОШТА</li>
              <li>📍 Пункти самовивозу</li>
            </ul>
          </div>

          {/* Регламент */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-emerald-400" />
              Правила
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>📜 Угода користувача</li>
              <li>🔨 Правила проведення торгів</li>
              <li>📊 Тарифи та комісії майданчика</li>
              <li>📞 Служба підтримки (24/7)</li>
            </ul>
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
