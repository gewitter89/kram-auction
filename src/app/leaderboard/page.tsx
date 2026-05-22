"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { soundService } from "@/lib/sound-service";
import {
  Trophy,
  TrendingUp,
  Zap,
  Target,
  ArrowRight,
  Medal,
} from "lucide-react";

// ===================== MOCK DATA =====================
interface LeaderEntry {
  rank: number;
  username: string;
  avatar: string;
  totalBids: number;
  totalUAH: number;
  xp: number;
  xpToNext: number;
  badge: string;
  badgeIcon: string;
  level: number;
  winRate: number;
  streak: number;
  verified: boolean;
}

const LEADERBOARD: LeaderEntry[] = [
  {
    rank: 1,
    username: "@platinum_king",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=platinum_king",
    totalBids: 1842,
    totalUAH: 4_280_000,
    xp: 98200,
    xpToNext: 100000,
    badge: "Платиновий VIP",
    badgeIcon: "👑",
    level: 98,
    winRate: 71,
    streak: 24,
    verified: true,
  },
  {
    rank: 2,
    username: "@diamond_wolf",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=diamond_wolf",
    totalBids: 1456,
    totalUAH: 2_940_000,
    xp: 87500,
    xpToNext: 100000,
    badge: "Діамантовий",
    badgeIcon: "💎",
    level: 87,
    winRate: 64,
    streak: 18,
    verified: true,
  },
  {
    rank: 3,
    username: "@crypto_falcon",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto_falcon",
    totalBids: 1203,
    totalUAH: 2_150_000,
    xp: 72000,
    xpToNext: 100000,
    badge: "Діамантовий",
    badgeIcon: "💎",
    level: 72,
    winRate: 59,
    streak: 12,
    verified: true,
  },
  {
    rank: 4,
    username: "@fire_bidder_ua",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fire_bidder_ua",
    totalBids: 987,
    totalUAH: 1_450_000,
    xp: 58000,
    xpToNext: 70000,
    badge: "Гарячий Бідер",
    badgeIcon: "🔥",
    level: 58,
    winRate: 52,
    streak: 9,
    verified: true,
  },
  {
    rank: 5,
    username: "@kyiv_collector",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kyiv_collector",
    totalBids: 834,
    totalUAH: 1_120_000,
    xp: 49500,
    xpToNext: 70000,
    badge: "Гарячий Бідер",
    badgeIcon: "🔥",
    level: 49,
    winRate: 48,
    streak: 7,
    verified: false,
  },
  {
    rank: 6,
    username: "@art_hunter",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=art_hunter",
    totalBids: 712,
    totalUAH: 895_000,
    xp: 42000,
    xpToNext: 70000,
    badge: "Гарячий Бідер",
    badgeIcon: "🔥",
    level: 42,
    winRate: 43,
    streak: 5,
    verified: true,
  },
  {
    rank: 7,
    username: "@sniper_max",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sniper_max",
    totalBids: 621,
    totalUAH: 740_000,
    xp: 35000,
    xpToNext: 50000,
    badge: "Снайпер",
    badgeIcon: "⚡",
    level: 35,
    winRate: 61,
    streak: 3,
    verified: false,
  },
  {
    rank: 8,
    username: "@last_second_ua",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=last_second_ua",
    totalBids: 542,
    totalUAH: 620_000,
    xp: 29500,
    xpToNext: 50000,
    badge: "Снайпер",
    badgeIcon: "⚡",
    level: 29,
    winRate: 57,
    streak: 4,
    verified: false,
  },
  {
    rank: 9,
    username: "@watch_king",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=watch_king",
    totalBids: 478,
    totalUAH: 530_000,
    xp: 24000,
    xpToNext: 50000,
    badge: "Снайпер",
    badgeIcon: "⚡",
    level: 24,
    winRate: 53,
    streak: 2,
    verified: true,
  },
  {
    rank: 10,
    username: "@tech_phoenix",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tech_phoenix",
    totalBids: 401,
    totalUAH: 460_000,
    xp: 19800,
    xpToNext: 50000,
    badge: "Снайпер",
    badgeIcon: "⚡",
    level: 19,
    winRate: 49,
    streak: 1,
    verified: false,
  },
];

// ===================== HELPERS =====================
function getRankDisplay(rank: number) {
  if (rank === 1) return { icon: "👑", color: "text-amber-400", glow: "shadow-[0_0_20px_rgba(251,191,36,0.4)]", border: "border-amber-400/40", bg: "bg-amber-400/10" };
  if (rank === 2) return { icon: "🥈", color: "text-slate-300", glow: "shadow-[0_0_15px_rgba(148,163,184,0.3)]", border: "border-slate-400/30", bg: "bg-slate-400/5" };
  if (rank === 3) return { icon: "🥉", color: "text-orange-400", glow: "shadow-[0_0_15px_rgba(251,146,60,0.3)]", border: "border-orange-400/30", bg: "bg-orange-400/5" };
  return { icon: `${rank}`, color: "text-slate-500", glow: "", border: "border-white/5", bg: "bg-white/[0.02]" };
}

function formatUAH(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}М`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}К`;
  return n.toLocaleString();
}

// ===================== COMPONENTS =====================

function TopThreeCard({ entry }: { entry: LeaderEntry }) {
  const rd = getRankDisplay(entry.rank);
  const xpPct = Math.min(100, Math.round((entry.xp / entry.xpToNext) * 100));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), entry.rank * 120);
    return () => clearTimeout(t);
  }, [entry.rank]);

  return (
    <div
      className={`relative flex flex-col items-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${entry.rank * 80}ms` }}
      onMouseEnter={() => soundService.playHover()}
    >
      {/* Crown for #1 */}
      {entry.rank === 1 && (
        <div className="text-3xl mb-1 animate-bounce">👑</div>
      )}

      {/* Avatar with rank ring */}
      <div
        className={`relative rounded-2xl p-[3px] ${rd.glow} ${
          entry.rank === 1
            ? "bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600"
            : entry.rank === 2
            ? "bg-gradient-to-br from-slate-300 to-slate-500"
            : "bg-gradient-to-br from-orange-400 to-amber-600"
        }`}
      >
        <img
          src={entry.avatar}
          alt={entry.username}
          className="w-20 h-20 rounded-xl object-cover bg-slate-900"
        />
        <span className="absolute -bottom-2 -right-2 text-lg">{entry.badgeIcon}</span>
      </div>

      {/* Rank number pill */}
      <div
        className={`mt-4 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${rd.bg} border ${rd.border} ${rd.color}`}
      >
        {entry.rank}
      </div>

      <p className="text-sm font-bold text-white mt-2 text-center">{entry.username}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{entry.badge}</p>

      {/* XP bar */}
      <div className="w-full mt-3 space-y-1">
        <div className="flex justify-between text-[9px] text-slate-600">
          <span>XP {entry.xp.toLocaleString()}</span>
          <span>Рівень {entry.level}</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-primary to-teal-400 transition-all duration-1000"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mt-4 w-full">
        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-2 text-center">
          <p className="text-xs font-extrabold text-brand-primary">{formatUAH(entry.totalUAH)}</p>
          <p className="text-[9px] text-slate-600 uppercase tracking-wider mt-0.5">UAH</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-2 text-center">
          <p className="text-xs font-extrabold text-violet-400">{entry.totalBids}</p>
          <p className="text-[9px] text-slate-600 uppercase tracking-wider mt-0.5">Ставок</p>
        </div>
      </div>
    </div>
  );
}

function LeaderRow({ entry, index }: { entry: LeaderEntry; index: number }) {
  const rd = getRankDisplay(entry.rank);
  const xpPct = Math.min(100, Math.round((entry.xp / entry.xpToNext) * 100));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80 + 300);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className={`glass-panel rounded-2xl border ${rd.border} p-4 flex items-center gap-4 transition-all duration-500 hover:border-brand-primary/30 hover:shadow-[0_0_20px_var(--primary-glow-alpha)] group ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
      }`}
      onMouseEnter={() => soundService.playHover()}
    >
      {/* Rank */}
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-base ${rd.bg} border ${rd.border} ${rd.color} ${rd.glow}`}>
        {entry.rank <= 3 ? entry.badgeIcon : entry.rank}
      </div>

      {/* Avatar */}
      <img
        src={entry.avatar}
        alt={entry.username}
        className="shrink-0 w-10 h-10 rounded-xl object-cover bg-slate-900 ring-1 ring-white/10 group-hover:ring-brand-primary/30 transition-all"
      />

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-bold text-white truncate">{entry.username}</span>
          {entry.verified && (
            <span className="text-[10px] text-brand-primary">✓</span>
          )}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400">
            {entry.badgeIcon} {entry.badge}
          </span>
          {entry.streak > 3 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400">
              🔥 ×{entry.streak}
            </span>
          )}
        </div>

        {/* XP Progress bar */}
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-[9px] text-slate-600">
            <span>Рівень {entry.level} · {entry.xp.toLocaleString()} XP</span>
            <span>{xpPct}%</span>
          </div>
          <div className="w-full bg-slate-900/80 rounded-full h-1 overflow-hidden border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-primary via-teal-400 to-brand-primary bg-[length:200%_100%] transition-all duration-1000 group-hover:animate-pulse"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats columns */}
      <div className="hidden sm:flex items-center gap-4 shrink-0 text-right">
        <div>
          <p className="text-sm font-extrabold text-brand-primary font-mono">{formatUAH(entry.totalUAH)}</p>
          <p className="text-[9px] uppercase text-slate-600 tracking-wider">UAH загалом</p>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-extrabold text-violet-400 font-mono">{entry.totalBids}</p>
          <p className="text-[9px] uppercase text-slate-600 tracking-wider">Ставок</p>
        </div>
        <div className="hidden lg:block">
          <p className="text-sm font-extrabold text-amber-400 font-mono">{entry.winRate}%</p>
          <p className="text-[9px] uppercase text-slate-600 tracking-wider">Перемог</p>
        </div>
      </div>
    </div>
  );
}

// ===================== MAIN PAGE =====================
export default function LeaderboardPage() {
  const [tab, setTab] = useState<"all-time" | "weekly" | "monthly">("all-time");
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const top3 = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);

  return (
    <div className="flex flex-col min-h-screen bg-[#020408]">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5">
          {/* Background glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-primary/[0.04] rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[300px] bg-violet-600/[0.04] rounded-full blur-[100px] pointer-events-none" />

          {/* Grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

          <div
            className={`mx-auto max-w-4xl text-center relative z-10 transition-all duration-700 ${
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 border border-brand-primary/25 px-4 py-1.5 text-xs font-semibold text-brand-primary mb-6">
              <Trophy className="h-3.5 w-3.5" />
              Рейтинг учасників
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 font-display">
              Зал{" "}
              <span className="bg-gradient-to-r from-brand-primary via-teal-400 to-brand-primary bg-clip-text text-transparent text-glow-emerald">
                Слави
              </span>{" "}
              KRAM
            </h1>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Найактивніші та найуспішніші учасники аукціонної платформи. Беріть участь — піднімайтесь у рейтингу, здобувайте бейджі та ексклюзивні привілеї.
            </p>

            {/* Period tabs */}
            <div className="mt-8 inline-flex items-center rounded-2xl bg-white/[0.03] border border-white/10 p-1 gap-1">
              {(["all-time", "weekly", "monthly"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { soundService.playClick(); setTab(t); }}
                  onMouseEnter={() => soundService.playHover()}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    tab === t
                      ? "bg-brand-primary text-white shadow-[0_0_15px_var(--primary-glow)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t === "all-time" ? "Всі часи" : t === "weekly" ? "Тиждень" : "Місяць"}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-b border-white/5 bg-slate-950/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Активних учасників", value: "12,842", icon: Trophy, color: "text-brand-primary" },
              { label: "Ставок сьогодні", value: "34,921", icon: Zap, color: "text-violet-400" },
              { label: "UAH в ставках", value: "85М+", icon: TrendingUp, color: "text-amber-400" },
              { label: "Успішних угод", value: "98.6%", icon: Target, color: "text-teal-400" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 rounded-2xl bg-white/[0.02] border border-white/5 px-4 py-3">
                <stat.icon className={`h-5 w-5 ${stat.color} shrink-0`} />
                <div>
                  <p className={`text-lg font-black font-mono ${stat.color}`}>{stat.value}</p>
                  <p className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top 3 Podium */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-white font-display">🏆 Топ-3 Чемпіони</h2>
              <p className="text-xs text-slate-500 mt-1">Найкращі учасники платформи за всі часи</p>
            </div>
          </div>

          {/* Podium — reordered: 2, 1, 3 for visual podium effect */}
          <div className="grid grid-cols-3 gap-6 md:gap-10 max-w-2xl mx-auto">
            {/* Silver — 2nd */}
            <div className="pt-8">
              <TopThreeCard entry={top3[1]} />
            </div>
            {/* Gold — 1st (taller) */}
            <div>
              <TopThreeCard entry={top3[0]} />
            </div>
            {/* Bronze — 3rd */}
            <div className="pt-14">
              <TopThreeCard entry={top3[2]} />
            </div>
          </div>
        </section>

        {/* Full leaderboard rows 4-10 */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <Medal className="h-5 w-5 text-brand-primary" />
              Рейтинг 4–10
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Оновлено сьогодні</span>
          </div>

          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[2rem_2.5rem_1fr_auto_auto_auto] gap-4 px-4 mb-3 text-[9px] uppercase tracking-widest text-slate-600 font-bold">
            <span>#</span>
            <span></span>
            <span>Учасник</span>
            <span className="text-right">UAH</span>
            <span className="text-right hidden md:block">Ставки</span>
            <span className="text-right hidden lg:block">%Перемог</span>
          </div>

          <div className="space-y-3">
            {rest.map((entry, i) => (
              <LeaderRow key={entry.rank} entry={entry} index={i} />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 rounded-3xl bg-gradient-to-br from-brand-primary/10 via-violet-500/5 to-transparent border border-brand-primary/20 p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2 font-display">
              Хочете потрапити до топу?
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
              Беріть участь в аукціонах, перемагайте та накопичуйте XP. Кожна ставка — це крок до вершини!
            </p>
            <Link
              href="/catalog"
              onClick={() => soundService.playClick()}
              onMouseEnter={() => soundService.playHover()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-[0_0_20px_var(--primary-glow)] hover:brightness-110 active:scale-95 transition-all"
            >
              Перейти до каталогу
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Badge legend */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl border-t border-white/5">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Система бейджів</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: "👑", title: "Платиновий VIP", desc: "Топ-1 платформи", color: "border-amber-400/30 bg-amber-400/5" },
              { icon: "💎", title: "Діамантовий", desc: "Топ 2–3", color: "border-sky-400/30 bg-sky-400/5" },
              { icon: "🔥", title: "Гарячий Бідер", desc: "Топ 4–6", color: "border-orange-400/30 bg-orange-400/5" },
              { icon: "⚡", title: "Снайпер", desc: "Топ 7–10", color: "border-violet-400/30 bg-violet-400/5" },
            ].map((b) => (
              <div
                key={b.title}
                className={`rounded-2xl border ${b.color} p-4 text-center`}
                onMouseEnter={() => soundService.playHover()}
              >
                <div className="text-2xl mb-2">{b.icon}</div>
                <p className="text-xs font-bold text-white">{b.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
