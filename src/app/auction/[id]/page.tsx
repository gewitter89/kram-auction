"use client";

import React, { useState, useEffect, useRef, use, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { soundService } from "@/lib/sound-service";
import NftCertificate from "@/components/NftCertificate";

// ─── Mock lot data ──────────────────────────────────────────────────────────

interface MockAuctionLot {
  id: string;
  title: string;
  description: string;
  category: string;
  startPrice: number;
  imageGradient: string;
  seller: string;
}

const MOCK_LOTS: Record<string, MockAuctionLot> = {
  default: {
    id: "default",
    title: "Колекційний годинник Longines Conquest V.H.P. 1968 р.",
    description:
      "Вінтажний годинник швейцарського виробника Longines з оригінальним механізмом.",
    category: "Годинники та Ювелірні вироби",
    startPrice: 45000,
    imageGradient: "from-amber-900/40 via-slate-900 to-amber-800/20",
    seller: "SwissLux_Kyiv",
  },
  "lot-1": {
    id: "lot-1",
    title: "Картина Олексія Новаківського «Гуцульський пейзаж» 1924 р.",
    description:
      "Олія на полотні, підписана автором. Надається сертифікат автентичності.",
    category: "Мистецтво та Антикваріат",
    startPrice: 120000,
    imageGradient: "from-violet-900/40 via-slate-900 to-indigo-800/20",
    seller: "Lviv_ArtHouse",
  },
  "lot-2": {
    id: "lot-2",
    title: "Рідкісний банкнот НБУ зразка 1991 р. — «Карбованець» серія АА",
    description:
      "Купон в ідеальному стані (UNC), без слідів обігу. Оригінальна упаковка.",
    category: "Нумізматика та Філателія",
    startPrice: 8500,
    imageGradient: "from-emerald-900/40 via-slate-900 to-teal-800/20",
    seller: "Numismat_UA",
  },
  "lot-3": {
    id: "lot-3",
    title: "Lamborghini Huracán Evo 2021 (Пробіг 12 000 км) — Auto Auction",
    description:
      "Суперкар в ідеальному технічному стані, повна комплектація, сервісна книжка.",
    category: "Автомобілі та Транспорт",
    startPrice: 3200000,
    imageGradient: "from-orange-900/40 via-slate-900 to-red-800/20",
    seller: "Elite_AutoKyiv",
  },
};

function getLot(id: string): MockAuctionLot {
  return MOCK_LOTS[id] || { ...MOCK_LOTS.default, id };
}

// ─── Fake bidder names ───────────────────────────────────────────────────────

const BIDDER_NAMES = [
  "Odesa_Collector",
  "Lviv_Dandy",
  "Kyiv_Capitalist",
  "VIP_Dealer_UA",
  "Kharkiv_Retro",
  "Antikvar_Kyiv",
  "Dnipro_Elite_Trader",
  "Zaporizhzhia_Gold",
  "Poltava_Vintage",
  "Mykolaiv_Bids",
  "Uzhhorod_Treasures",
  "Chernivtsi_Baron",
];

// ─── Bid feed item type ──────────────────────────────────────────────────────

interface FeedBid {
  id: string;
  bidder: string;
  amount: number;
  time: Date;
  isMe: boolean;
}

// ─── Countdown Timer Hook ────────────────────────────────────────────────────

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [active, setActive] = useState(true);
  const [antiSnipeTriggered, setAntiSnipeTriggered] = useState(false);
  const [antiSnipeBanner, setAntiSnipeBanner] = useState(false);

  const addTime = useCallback((s: number) => {
    setSeconds((prev) => prev + s);
  }, []);

  const stop = useCallback(() => setActive(false), []);

  return {
    seconds,
    setSeconds,
    active,
    antiSnipeTriggered,
    setAntiSnipeTriggered,
    antiSnipeBanner,
    setAntiSnipeBanner,
    addTime,
    stop,
  };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AuctionRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const lot = getLot(id);

  // Countdown state
  const initialSeconds = 5 * 60; // 5:00
  const {
    seconds,
    setSeconds,
    active,
    antiSnipeTriggered,
    setAntiSnipeTriggered,
    antiSnipeBanner,
    setAntiSnipeBanner,
    stop,
  } = useCountdown(initialSeconds);

  // Price / bids
  const [currentPrice, setCurrentPrice] = useState(lot.startPrice);
  const [bidFeed, setBidFeed] = useState<FeedBid[]>([]);
  const [customBid, setCustomBid] = useState("");
  const [priceFlash, setPriceFlash] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [bidderCount, setBidderCount] = useState(3);
  const feedRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);
  const antiSnipeRef = useRef(false);
  const activeRef = useRef(active);
  const secondsRef = useRef(seconds);
  const currentPriceRef = useRef(currentPrice);
  const uniqueBiddersRef = useRef(new Set<string>());

  useEffect(() => {
    activeRef.current = active;
    secondsRef.current = seconds;
    currentPriceRef.current = currentPrice;
  }, [active, seconds, currentPrice]);

  // ── Add bid to feed ────────────────────────────────────────────────────────
  const addBidToFeed = useCallback(
    (bidder: string, amount: number, isMe: boolean) => {
      const newBid: FeedBid = {
        id: `${Date.now()}-${Math.random()}`,
        bidder,
        amount,
        time: new Date(),
        isMe,
      };
      setBidFeed((prev) => [newBid, ...prev].slice(0, 50));
      setCurrentPrice(amount);
      currentPriceRef.current = amount;
      setPriceFlash(true);
      setTimeout(() => setPriceFlash(false), 1000);
      uniqueBiddersRef.current.add(bidder);
      setBidderCount(uniqueBiddersRef.current.size);

      // Scroll feed
      setTimeout(() => {
        if (feedRef.current) {
          feedRef.current.scrollTop = 0;
        }
      }, 50);
    },
    []
  );

  // ── Countdown ticker ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeRef.current) return;

    countdownRef.current = setInterval(() => {
      setSeconds((prev) => {
        const next = prev - 1;

        // Heartbeat when < 30s
        if (next > 0 && next < 30) {
          soundService.playHeartbeat();
        }

        // Anti-snipe when < 10s (only once)
        if (next > 0 && next <= 10 && !antiSnipeRef.current) {
          antiSnipeRef.current = true;
          setAntiSnipeTriggered(true);
          setAntiSnipeBanner(true);
          setSeconds((s) => s + 30);
          setTimeout(() => setAntiSnipeBanner(false), 4000);
          return next + 30;
        }

        // Auction ends
        if (next <= 0) {
          clearInterval(countdownRef.current!);
          stop();
          setAuctionEnded(true);
          setTimeout(() => setShowCertificate(true), 1500);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Bot bidding simulator ──────────────────────────────────────────────────
  useEffect(() => {
    const scheduleBotBid = () => {
      const delay = Math.floor(Math.random() * 3000) + 2000;
      botTimerRef.current = setTimeout(() => {
        if (!activeRef.current) return;
        const bidder =
          BIDDER_NAMES[Math.floor(Math.random() * BIDDER_NAMES.length)];
        const increment =
          Math.floor(Math.random() * 4) * 1000 +
          Math.ceil(currentPriceRef.current * 0.01);
        const newAmount = currentPriceRef.current + increment;
        soundService.playGavel();
        addBidToFeed(bidder, newAmount, false);
        scheduleBotBid();
      }, delay);
    };
    scheduleBotBid();

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // ── Format countdown ───────────────────────────────────────────────────────
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const isHot = seconds < 30;
  const isCritical = seconds < 10;

  // ── Quick bid handler ──────────────────────────────────────────────────────
  const handleQuickBid = (increment: number) => {
    soundService.playGavel();
    const newAmount = currentPrice + increment;
    addBidToFeed("Я (Ви)", newAmount, true);
  };

  // ── Custom bid handler ─────────────────────────────────────────────────────
  const handleCustomBid = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customBid);
    if (isNaN(amount) || amount <= currentPrice) {
      soundService.playWarning();
      return;
    }
    soundService.playGavel();
    addBidToFeed("Я (Ви)", amount, true);
    setCustomBid("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020408] relative">
      {/* ── Global styles injected ── */}
      <style>{`
        @keyframes slideInFromTop {
          0% { transform: translateY(-30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes pricePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes bidderPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes antiSnipeSlide {
          0% { transform: translateY(-100%); opacity: 0; }
          15% { transform: translateY(0); opacity: 1; }
          85% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-100%); opacity: 0; }
        }
        @keyframes liveBlip {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .feed-item-enter {
          animation: slideInFromTop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .price-flash {
          animation: pricePulse 0.5s ease;
        }
        .bidder-count-pulse {
          animation: bidderPulse 1.5s ease-in-out infinite;
        }
        .anti-snipe-banner {
          animation: antiSnipeSlide 4s ease forwards;
        }
        .live-dot {
          animation: liveBlip 1.2s ease-in-out infinite;
        }
      `}</style>

      <Navbar />

      {/* ── Anti-Snipe Banner ── */}
      {antiSnipeBanner && (
        <div
          className="anti-snipe-banner fixed top-16 left-0 right-0 z-50 flex justify-center pointer-events-none"
        >
          <div className="bg-amber-400 text-slate-900 px-8 py-3 rounded-full text-sm font-black shadow-2xl flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            Анти-снайп! Час продовжено на +30с
            <span className="text-2xl">⚡</span>
          </div>
        </div>
      )}

      {/* ── NFT Certificate ── */}
      {showCertificate && (
        <NftCertificate
          lotName={lot.title}
          winningBid={currentPrice}
          winnerUsername="Я (Ви)"
          auctionDate={new Date().toLocaleDateString("uk-UA")}
          onClose={() => setShowCertificate(false)}
        />
      )}

      <main className="flex-grow w-full relative z-10">
        {/* ═══════════════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════════════ */}
        <div className={`relative w-full bg-gradient-to-br ${lot.imageGradient} overflow-hidden`}>
          {/* Background effects */}
          <div className="absolute inset-0 bg-[#020408]/60" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/[0.06] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600/[0.06] rounded-full blur-[100px] pointer-events-none" />

          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
              <Link href="/" className="hover:text-slate-300 transition-colors" onClick={() => soundService.playClick()}>
                Головна
              </Link>
              <span>/</span>
              <Link href="/catalog" className="hover:text-slate-300 transition-colors" onClick={() => soundService.playClick()}>
                Каталог
              </Link>
              <span>/</span>
              <span className="text-slate-400">Live Аукціон</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Lot Image Placeholder */}
              <div
                className="aspect-video rounded-3xl overflow-hidden relative border border-white/10"
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.05))`,
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="text-6xl opacity-60">🔨</div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    {lot.category}
                  </p>
                </div>
                {/* LIVE badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-red-400/30">
                  <span className="live-dot w-2 h-2 rounded-full bg-white" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    Live
                  </span>
                </div>
                {/* Lot ID */}
                <div className="absolute bottom-4 right-4 text-[9px] text-slate-500 font-mono bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                  ID: {id.substring(0, 8).toUpperCase()}
                </div>
              </div>

              {/* Lot Info & Price */}
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-brand-primary font-bold">
                    🔴 Live Аукціон
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 leading-tight font-display">
                    {lot.title}
                  </h1>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {lot.description}
                  </p>
                </div>

                {/* Current Price */}
                <div
                  className="glass-panel p-5 rounded-2xl border border-white/10"
                  style={{ backdropFilter: "blur(20px)" }}
                >
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                    Поточна ставка
                  </p>
                  <p
                    className={`text-4xl sm:text-5xl font-black transition-all duration-300 ${
                      priceFlash ? "price-flash text-brand-primary" : "text-white"
                    }`}
                    style={
                      priceFlash
                        ? { textShadow: "0 0 30px var(--primary-glow)" }
                        : {}
                    }
                  >
                    {currentPrice.toLocaleString()}
                    <span className="text-xl ml-2 text-slate-400 font-semibold">
                      UAH
                    </span>
                  </p>

                  {/* Bidder count */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-2xl font-black bidder-count-pulse ${
                          bidderCount > 5 ? "text-red-400" : "text-brand-primary"
                        }`}
                      >
                        {bidderCount}
                      </span>
                      <span className="text-xs text-slate-400">
                        учасників торгів
                      </span>
                    </div>
                    {bidderCount > 5 && (
                      <span className="rounded-full bg-red-500/15 text-red-400 text-[10px] font-black px-2.5 py-1 border border-red-500/25 animate-pulse">
                        🔥 Гарячий аукціон!
                      </span>
                    )}
                  </div>
                </div>

                {/* Seller */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-base">
                    👤
                  </span>
                  <span>
                    Продавець:{" "}
                    <span className="text-slate-200 font-semibold">
                      @{lot.seller}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            MAIN ARENA
        ═══════════════════════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── LEFT COLUMN: Countdown + Bid Buttons + Custom Bid ── */}
            <div className="lg:col-span-4 space-y-5">
              {/* COUNTDOWN TIMER */}
              <div
                className="rounded-3xl p-6 text-center border relative overflow-hidden"
                style={{
                  background: isHot
                    ? "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.03))"
                    : "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                  borderColor: isHot
                    ? "rgba(239,68,68,0.4)"
                    : "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Glow for critical */}
                {isCritical && (
                  <div className="absolute inset-0 bg-red-500/5 animate-pulse rounded-3xl pointer-events-none" />
                )}

                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mb-3">
                  {auctionEnded ? "Аукціон Завершено" : antiSnipeTriggered ? "⚡ Анти-снайп Активовано" : "До кінця торгів"}
                </p>

                <div
                  className={`text-6xl sm:text-7xl font-black font-mono tracking-tight transition-all duration-300 ${
                    auctionEnded
                      ? "text-emerald-400"
                      : isHot
                      ? "text-red-400"
                      : "text-white"
                  }`}
                  style={
                    isHot && !auctionEnded
                      ? { textShadow: "0 0 40px rgba(239,68,68,0.6)" }
                      : auctionEnded
                      ? { textShadow: "0 0 40px rgba(16,185,129,0.5)" }
                      : {}
                  }
                >
                  {auctionEnded ? "🏆" : formatTime(seconds)}
                </div>

                {auctionEnded && (
                  <p className="text-emerald-400 font-black text-sm mt-2">
                    Переможець визначено!
                  </p>
                )}

                {antiSnipeTriggered && !auctionEnded && (
                  <div className="mt-3 text-[10px] text-amber-400 font-bold bg-amber-500/10 rounded-xl px-3 py-1.5 border border-amber-500/20">
                    ⚡ Система анти-снайп: час продовжено
                  </div>
                )}

                {/* Progress bar */}
                {!auctionEnded && (
                  <div className="mt-4 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.max(0, (seconds / initialSeconds) * 100)}%`,
                        background: isHot
                          ? "linear-gradient(90deg, #ef4444, #f97316)"
                          : "var(--primary-color)",
                        boxShadow: isHot
                          ? "0 0 10px rgba(239,68,68,0.5)"
                          : "0 0 10px var(--primary-glow)",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* QUICK BID BUTTONS */}
              {!auctionEnded && (
                <div
                  className="rounded-3xl p-5 space-y-4 border border-white/8"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    Миттєві ставки
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {[1000, 5000, 10000, 25000].map((inc) => (
                      <button
                        key={inc}
                        onClick={() => {
                          soundService.playClick();
                          handleQuickBid(inc);
                        }}
                        onMouseEnter={() => soundService.playHover()}
                        className="relative rounded-2xl py-3.5 px-3 text-sm font-black text-white transition-all active:scale-95 group overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(var(--primary-color-rgb),0.15), rgba(var(--primary-color-rgb),0.05))",
                          border: "1px solid rgba(var(--primary-color-rgb),0.3)",
                          boxShadow: "0 0 0px var(--primary-glow)",
                        }}
                        onMouseDown={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.boxShadow =
                            "0 0 20px var(--primary-glow)";
                        }}
                        onMouseUp={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.boxShadow =
                            "0 0 0px var(--primary-glow)";
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent group-hover:from-white/[0.07] transition-all" />
                        <span className="relative text-brand-primary font-black">
                          +{inc >= 1000 ? `${inc / 1000}К` : inc}
                        </span>
                        <span className="relative text-slate-400 text-[10px] block font-semibold">
                          UAH
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Custom bid input */}
                  <form onSubmit={handleCustomBid} className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 relative rounded-2xl border border-white/10 bg-slate-950/80 flex items-center px-3 py-2.5 gap-2">
                        <span className="text-[10px] text-slate-500 font-bold shrink-0">
                          UAH:
                        </span>
                        <input
                          type="number"
                          placeholder={String(currentPrice + 1000)}
                          value={customBid}
                          onChange={(e) => setCustomBid(e.target.value)}
                          className="bg-transparent text-sm font-bold text-white w-full focus:outline-none"
                          min={currentPrice + 1}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      onMouseEnter={() => soundService.playHover()}
                      className="w-full rounded-2xl py-3.5 text-sm font-black text-white transition-all active:scale-95"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--primary-color), #065f46)",
                        boxShadow: "0 0 20px var(--primary-glow-alpha)",
                      }}
                    >
                      🔨 Зробити ставку
                    </button>
                  </form>
                </div>
              )}

              {/* Auction ended CTA */}
              {auctionEnded && (
                <button
                  onClick={() => setShowCertificate(true)}
                  className="w-full rounded-3xl py-5 text-base font-black text-slate-900 transition-all active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                    boxShadow: "0 0 40px rgba(245,158,11,0.4)",
                  }}
                >
                  🏆 Переглянути Сертифікат Переможця
                </button>
              )}
            </div>

            {/* ── CENTER: Live Bid Feed ── */}
            <div className="lg:col-span-5 space-y-4">
              {/* Bid Battle Indicator */}
              <div
                className="rounded-3xl p-4 border border-white/8 flex items-center justify-between"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="live-dot w-3 h-3 rounded-full bg-red-500 block" />
                    <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">
                      LIVE Торги Ведуться
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Нові ставки в реальному часі
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-2xl font-black bidder-count-pulse ${
                      bidderCount > 5 ? "text-red-400" : "text-brand-primary"
                    }`}
                  >
                    {bidderCount}
                  </p>
                  <p className="text-[10px] text-slate-500">учасників</p>
                </div>
              </div>

              {/* Live Feed */}
              <div
                className="rounded-3xl border border-white/8 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="text-brand-primary">📡</span>
                    Потік ставок у реальному часі
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                    {bidFeed.length} ставок
                  </span>
                </div>

                <div
                  ref={feedRef}
                  className="h-[400px] overflow-y-auto p-4 space-y-2 scroll-smooth"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255,255,255,0.1) transparent",
                  }}
                >
                  {bidFeed.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                      <span className="text-3xl">🔨</span>
                      <p className="text-xs font-semibold">
                        Очікуємо першу ставку...
                      </p>
                    </div>
                  )}

                  {bidFeed.map((bid, idx) => (
                    <div
                      key={bid.id}
                      className={`feed-item-enter rounded-2xl p-3 flex items-center justify-between border transition-all ${
                        bid.isMe
                          ? "bg-brand-primary/[0.08] border-brand-primary/30"
                          : idx === 0
                          ? "bg-violet-500/[0.06] border-violet-500/25"
                          : "bg-slate-950/60 border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                            bid.isMe
                              ? "bg-brand-primary/20 text-brand-primary"
                              : "bg-white/5 text-slate-400"
                          }`}
                        >
                          {bid.bidder[0].toUpperCase()}
                        </div>
                        <div>
                          <p
                            className={`text-xs font-bold ${
                              bid.isMe ? "text-brand-primary" : "text-slate-200"
                            }`}
                          >
                            {bid.bidder}
                            {bid.isMe && (
                              <span className="ml-1.5 text-[9px] bg-brand-primary/15 text-brand-primary border border-brand-primary/25 rounded px-1 py-0.5">
                                ВИ
                              </span>
                            )}
                            {idx === 0 && !bid.isMe && (
                              <span className="ml-1.5 text-[9px] bg-violet-500/15 text-violet-400 border border-violet-500/25 rounded px-1 py-0.5">
                                ЛІДЕР
                              </span>
                            )}
                          </p>
                          <p className="text-[9px] text-slate-500">
                            {bid.time.toLocaleTimeString("uk-UA", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-black font-mono ${
                          bid.isMe
                            ? "text-brand-primary"
                            : idx === 0
                            ? "text-violet-400"
                            : "text-slate-300"
                        }`}
                        style={
                          idx === 0
                            ? {
                                textShadow:
                                  "0 0 15px rgba(139,92,246,0.5)",
                              }
                            : {}
                        }
                      >
                        {bid.amount.toLocaleString()} UAH
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Order Book ── */}
            <div className="lg:col-span-3">
              <div
                className="rounded-3xl border border-white/8 overflow-hidden sticky top-24"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="px-4 py-4 border-b border-white/5">
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span className="text-amber-400">📋</span>
                    Книга Ставок
                  </h3>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    Останні 10 транзакцій
                  </p>
                </div>

                <div className="p-3 space-y-1.5 max-h-[500px] overflow-y-auto">
                  {bidFeed.slice(0, 10).map((bid, idx) => (
                    <div
                      key={`ob-${bid.id}`}
                      className={`rounded-xl p-2.5 flex items-center justify-between text-[10px] border ${
                        bid.isMe
                          ? "bg-brand-primary/[0.06] border-brand-primary/20 text-brand-primary"
                          : "bg-white/[0.02] border-white/5 text-slate-400"
                      }`}
                    >
                      <div>
                        <p className="font-bold truncate max-w-[80px]">
                          {bid.bidder}
                        </p>
                        <p className="text-[8px] opacity-60">
                          {bid.time.toLocaleTimeString("uk-UA", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={`font-black font-mono ${
                          bid.isMe
                            ? "text-brand-primary"
                            : idx === 0
                            ? "text-violet-400"
                            : "text-slate-300"
                        }`}
                      >
                        {(bid.amount / 1000).toFixed(1)}К
                      </span>
                    </div>
                  ))}

                  {bidFeed.length === 0 && (
                    <p className="text-center py-6 text-[10px] text-slate-600">
                      Ставок ще немає
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="px-4 py-3 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Стартова ціна:</span>
                    <span className="text-slate-300 font-bold font-mono">
                      {lot.startPrice.toLocaleString()} UAH
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Поточна ціна:</span>
                    <span className="text-brand-primary font-bold font-mono">
                      {currentPrice.toLocaleString()} UAH
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Приріст:</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      +
                      {(
                        ((currentPrice - lot.startPrice) /
                          lot.startPrice) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
