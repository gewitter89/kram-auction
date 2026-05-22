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
import { apiService } from "@/lib/api-service";

interface LeaderEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  totalBids: number;
  totalUAH: number;
  points: number;
  badge: string;
  badgeIcon: string;
  winRate: number;
  streak: number;
  verified: boolean;
}

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

      {/* Points bar */}
      <div className="w-full mt-3 space-y-1">
        <div className="flex justify-between text-[9px] text-slate-600 font-bold uppercase tracking-wider">
          <span>{entry.points.toLocaleString()} Балів</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-primary to-teal-400 transition-all duration-1000"
            style={{ width: `100%` }}
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

        {/* Points Progress bar */}
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-[9px] text-slate-600 font-bold uppercase tracking-wider">
            <span>{entry.points.toLocaleString()} Балів Активності</span>
          </div>
          <div className="w-full bg-slate-900/80 rounded-full h-1 overflow-hidden border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-primary via-teal-400 to-brand-primary bg-[length:200%_100%] transition-all duration-1000 group-hover:animate-pulse"
              style={{ width: `100%` }}
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
// ===================== BADGE DETAILS FOR INTERACTIVE MODALS =====================
const BADGE_DETAILS = [
  {
    icon: "👑",
    title: "Платиновий VIP",
    desc: "Топ-1 глобального рейтингу KRAM",
    requirements: [
      "Посісти 1-ше місце в загальному рейтингу активності KRAM.UA",
      "Сумарний обсяг ставок понад 3 000 000 UAH",
      "Підтверджений рівень профілю 90+"
    ],
    perks: [
      "🔥 Відмітка активного учасника без жодних платежів KRAM",
      "🌟 Унікальна золота анімована аура навколо вашого аватара",
      "💬 Пріоритетне відображення повідомлень у чатах підтримки",
      "👨‍💼 Персональний VIP-менеджер супроводу угод 24/7"
    ],
    color: "border-amber-500/30 bg-amber-500/5 hover:border-amber-400 hover:bg-amber-400/10",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.2)] border-amber-400",
    textColor: "text-amber-400"
  },
  {
    icon: "💎",
    title: "Діамантовий",
    desc: "Топ 2-3 у рейтингу KRAM",
    requirements: [
      "Посісти 2-ге або 3-тє місце в загальному рейтингу",
      "Сумарний обсяг ставок понад 1 500 000 UAH",
      "Рівень профілю 70+"
    ],
    perks: [
      "⚡ Пріоритетна довіра в спільноті та помітніший профіль",
      "💎 Стильна діамантова рамка навколо аватара профілю",
      "🚀 Доступ до ексклюзивних лотів на 1 годину раніше за інших",
      "📞 Пріоритетна лінія підтримки користувачів"
    ],
    color: "border-sky-500/30 bg-sky-500/5 hover:border-sky-400 hover:bg-sky-400/10",
    glow: "shadow-[0_0_30px_rgba(56,189,248,0.2)] border-sky-400",
    textColor: "text-sky-400"
  },
  {
    icon: "🔥",
    title: "Гарячий Бідер",
    desc: "Топ 4-6 у рейтингу KRAM",
    requirements: [
      "Посісти 4-6 місце в загальному рейтингу активності",
      "Зробити понад 100 успішних ставок за останній місяць",
      "Рівень профілю 40+"
    ],
    perks: [
      "🔥 Помітніший профіль у спільноті",
      "🍊 Вогняний шильдик активності біля імені користувача",
      "📈 Доступ до інтелектуальної аналітики цін та попиту"
    ],
    color: "border-orange-500/30 bg-orange-500/5 hover:border-orange-400 hover:bg-orange-400/10",
    glow: "shadow-[0_0_30px_rgba(251,146,60,0.2)] border-orange-400",
    textColor: "text-orange-400"
  },
  {
    icon: "⚡",
    title: "Снайпер",
    desc: "Топ 7-10 у рейтингу або майстер точних ставок",
    requirements: [
      "Посісти 7-10 місце в загальному рейтингу",
      "Виграти щонайменше 5 аукціонів ставкою на останній хвилині",
      "Рівень профілю 15+"
    ],
    perks: [
      "⚡ Унікальний значок блискавки біля імені в чатах та лотах",
      "👁️ Доступ до закритих лотів за 5 хвилин до їх публікації",
      "🛡️ Безкоштовне страхування перших 3 створених лотів"
    ],
    color: "border-violet-500/30 bg-violet-500/5 hover:border-violet-400 hover:bg-violet-400/10",
    glow: "shadow-[0_0_30px_rgba(167,139,250,0.2)] border-violet-400",
    textColor: "text-violet-400"
  }
];

// ===================== MAIN PAGE =====================
export default function LeaderboardPage() {
  const [tab, setTab] = useState<"all-time" | "weekly" | "monthly">("all-time");
  const [headerVisible, setHeaderVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<typeof BADGE_DETAILS[0] | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      const data = await apiService.getLeaderboard();
      setLeaderboard(data);
      setIsLoading(false);
    };
    fetchLeaderboard();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const handleBadgeClick = (badge: typeof BADGE_DETAILS[0]) => {
    soundService.playConsoleOpen();
    setSelectedBadge(badge);
  };

  const handleCloseModal = () => {
    soundService.playClick();
    setSelectedBadge(null);
  };

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
              Найактивніші та найуспішніші учасники аукціонної платформи. Беріть участь — піднімайтесь у рейтингу, здобувайте бейджі та отримуйте ексклюзивні привілеї.
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
          {isLoading ? (
            <div className="py-20 text-center text-brand-primary animate-pulse font-display">
              Оновлення рейтингу...
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6 md:gap-10 max-w-2xl mx-auto">
              {/* Silver — 2nd */}
              <div className="pt-8">
                {top3[1] && <TopThreeCard entry={top3[1]} />}
              </div>
              {/* Gold — 1st (taller) */}
              <div>
                {top3[0] && <TopThreeCard entry={top3[0]} />}
              </div>
              {/* Bronze — 3rd */}
              <div className="pt-14">
                {top3[2] && <TopThreeCard entry={top3[2]} />}
              </div>
            </div>
          )}
        </section>

        {/* Full leaderboard rows 4-10 */}
        {!isLoading && rest.length > 0 && (
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
              <LeaderRow key={entry.id} entry={entry} index={i} />
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
        )}

        {/* Badge legend */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl border-t border-white/5">
          <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Система бейджів</h3>
          <p className="text-xs text-slate-500 mb-6">Натисніть на будь-який бейдж, щоб дізнатися вимоги для його отримання та привілеї.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BADGE_DETAILS.map((b) => (
              <button
                type="button"
                key={b.title}
                onClick={() => handleBadgeClick(b)}
                className={`rounded-2xl border ${b.color} p-4 text-center transition-all active:scale-95 text-left focus:outline-none`}
                onMouseEnter={() => soundService.playHover()}
              >
                <div className="text-2xl mb-2">{b.icon}</div>
                <p className="text-xs font-bold text-white">{b.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{b.desc}</p>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Interactive Badge Modal */}
      {selectedBadge && (
        <div 
          onClick={handleCloseModal}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`glass-panel max-w-md w-full border ${selectedBadge.glow} rounded-3xl p-6 space-y-5 shadow-2xl relative animate-scaleUp`}
          >
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              &times;
            </button>

            <div className="text-center space-y-1">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-white/10 text-3xl">
                {selectedBadge.icon}
              </span>
              <h3 className={`text-base font-bold uppercase tracking-wider font-display ${selectedBadge.textColor}`}>
                Бейдж: {selectedBadge.title}
              </h3>
              <p className="text-[11px] text-slate-400 leading-normal">{selectedBadge.desc}</p>
            </div>

            <div className="space-y-4">
              {/* Requirements */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  📋 Вимоги для отримання:
                </h4>
                <ul className="space-y-1">
                  {selectedBadge.requirements.map((req, index) => (
                    <li key={index} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-emerald-400 shrink-0">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Perks */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  💎 Ексклюзивні привілеї:
                </h4>
                <ul className="space-y-1">
                  {selectedBadge.perks.map((perk, index) => (
                    <li key={index} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              className={`w-full rounded-xl py-3 text-xs font-bold transition-all ${selectedBadge.textColor} border border-white/10 bg-slate-900 hover:bg-slate-800`}
            >
              Зрозуміло
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
