"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { apiService } from "@/lib/api-service";
import { 
  Clock, 
  ShieldCheck, 
  MapPin, 
  ArrowLeft, 
  Send, 
  Gavel, 
  ShoppingBag,
  CheckCircle,
  Truck,
  MessageSquare,
  AlertTriangle,
  Play,
  Pause,
  Printer,
  Sparkles,
  Award,
  TrendingUp
} from "lucide-react";
import confetti from "canvas-confetti";
import { soundService } from "@/lib/sound-service";
import { Listing, Bid, Transaction } from "@prisma/client";


// Генератор OTP для захисту чистоти рендеру React 19
function generateOtpCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// SVG Штрихкод для ТТН
function SvgBarcode({ value }: { value: string }) {
  const bars = [];
  let currentX = 5;

  for (let i = 0; i < value.length * 3.5; i++) {
    const width = (i % 3 === 0) ? 3.5 : (i % 2 === 0) ? 2 : 1;
    const isBlack = (i % 8 !== 3); // створюємо прогалини
    if (isBlack) {
      bars.push(<rect key={i} x={currentX} y="5" width={width} height="40" fill="#000" />);
    }
    currentX += width + 1.5;
  }

  return (
    <svg viewBox={`0 0 ${currentX + 5} 50`} className="w-full max-w-[280px] h-12 bg-white">
      {bars}
    </svg>
  );
}

// SVG QR-код для ТТН (21x21 матриця)
function SvgQRCode() {
  const size = 21;
  const rects = [];
  const anchors = [
    { x: 0, y: 0 },
    { x: 14, y: 0 },
    { x: 0, y: 14 }
  ];

  const isAnchor = (x: number, y: number) => {
    for (const a of anchors) {
      if (x >= a.x && x < a.x + 7 && y >= a.y && y < a.y + 7) {
        const dx = x - a.x;
        const dy = y - a.y;
        if (dx === 0 || dx === 6 || dy === 0 || dy === 6) return true;
        if (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) return true;
        return false;
      }
    }
    return null;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const anchorVal = isAnchor(x, y);
      if (anchorVal !== null) {
        if (anchorVal) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#000" />);
      } else {
        if (((x * y) % 2 === 0 || (x + y) % 3 === 0) && !(x === 20 && y === 20)) {
          rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#000" />);
        }
      }
    }
  }

  return (
    <svg viewBox="0 0 21 21" className="w-16 h-16 bg-white border border-slate-200 p-1 rounded">
      {rects}
    </svg>
  );
}

// Біржовий графік швидкості ставок (Bid Velocity Graph)
function BidVelocityChart({ bids }: { bids: [] }) {
  if (bids.length === 0) {
    return (
      <div className="h-44 rounded-2xl bg-slate-950/40 border border-white/5 flex flex-col items-center justify-center text-xs text-slate-500 font-semibold p-4">
        <TrendingUp className="h-5 w-5 text-slate-600 mb-2" />
        Немає даних для аналітики швидкості ставок
      </div>
    );
  }

  const width = 340;
  const height = 150;
  const padding = 20;

  const sortedBids = [...bids].reverse(); // Спочатку найстаріші
  const minAmount = Math.min(...sortedBids.map(b => b.amount));
  const maxAmount = Math.max(...sortedBids.map(b => b.amount));
  const priceRange = maxAmount - minAmount || 1;

  const points = sortedBids.map((b, idx) => {
    const x = padding + (idx / (sortedBids.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - ((b.amount - minAmount) / priceRange) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  return (
    <div className="rounded-2xl bg-slate-950/40 border border-white/5 p-4 space-y-3 relative overflow-hidden">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400 font-bold flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          Динаміка швидкості ставок
        </span>
        <span className="text-[10px] text-emerald-400 font-extrabold font-mono">
          +{Math.round(((maxAmount - minAmount) / (minAmount || 1)) * 100)}% приріст
        </span>
      </div>

      <div className="relative h-[130px] w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Гістограмна сітка */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

          {/* Заливка площі під графіком */}
          {points.length > 1 && (
            <path
              d={`${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
              fill="url(#chartVelocityGradient)"
            />
          )}

          {/* Лінія тренду */}
          {points.length > 1 ? (
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
            />
          ) : (
            <circle cx={width/2} cy={height/2} r="4" fill="#10b981" />
          )}

          {/* Вузли точок ставок */}
          {sortedBids.map((b, idx) => {
            const [cx, cy] = points[idx].split(",");
            return (
              <g key={b.id}>
                <circle cx={cx} cy={cy} r="3.5" className="fill-[#020408] stroke-[#10b981] stroke-[2px]" />
                {idx === sortedBids.length - 1 && (
                  <circle cx={cx} cy={cy} r="7" className="fill-none stroke-emerald-400 stroke-1 radar-pulse-dot" />
                )}
              </g>
            );
          })}

          <defs>
            <linearGradient id="chartVelocityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// ── SVG Графік цінової активності (Task 2) ────────────────────────────────
function PriceHistoryChart({ basePrice }: { basePrice: number }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // 14 mock data points — gradually increasing with volatility
  const rawData = [
    0, 2, -1, 4, 1, 6, 3, 8, 5, 10, 7, 12, 9, 15
  ];
  const prices = rawData.map((delta) => Math.round(basePrice * (1 + delta * 0.008)));
  const times = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30"
  ];

  const W = 500, H = 160;
  const padL = 60, padR = 20, padT = 16, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const priceRange = maxP - minP || 1;

  const pts = prices.map((p, i) => ({
    x: padL + (i / (prices.length - 1)) * innerW,
    y: padT + innerH - ((p - minP) / priceRange) * innerH,
    price: p,
    time: times[i],
  }));

  const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${lineD} L${pts[pts.length - 1].x},${padT + innerH} L${padL},${padT + innerH} Z`;

  // estimate stroke length for dasharray animation
  const totalLen = pts.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const prev = pts[i - 1];
    return acc + Math.hypot(p.x - prev.x, p.y - prev.y);
  }, 0);

  const gridPrices = [minP, Math.round((minP + maxP) / 2), maxP];

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3 shadow-xl relative overflow-hidden">
      <style>{`
        @keyframes drawLine {
          from { stroke-dashoffset: ${Math.ceil(totalLen + 20)}; }
          to { stroke-dashoffset: 0; }
        }
        .price-line-draw {
          stroke-dasharray: ${Math.ceil(totalLen + 20)};
          animation: drawLine 2s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        @keyframes fadeArea {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .area-fade { animation: fadeArea 1.5s 0.5s ease forwards; opacity: 0; }
      `}</style>

      <div className="absolute top-0 right-0 w-40 h-40 bg-brand-primary/[0.04] rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-primary" />
          Графік цінової активності
        </h3>
        <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-1 rounded-lg">
          +{(((prices[prices.length - 1] - prices[0]) / prices[0]) * 100).toFixed(1)}% за сесію
        </span>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: "280px" }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="priceAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0" />
            </linearGradient>
            <filter id="lineGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {gridPrices.map((_, gi) => {
            const gy = padT + innerH - (gi / 2) * innerH;
            return (
              <line
                key={gi}
                x1={padL} y1={gy} x2={W - padR} y2={gy}
                stroke="rgba(255,255,255,0.05)" strokeWidth="1"
              />
            );
          })}
          {/* Vertical grid lines */}
          {[0, 3, 6, 9, 13].map((idx) => (
            <line
              key={idx}
              x1={pts[idx].x} y1={padT} x2={pts[idx].x} y2={padT + innerH}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {gridPrices.map((gp, gi) => {
            const gy = padT + innerH - (gi / 2) * innerH;
            return (
              <text
                key={gi}
                x={padL - 6} y={gy + 4}
                textAnchor="end"
                fontSize="9"
                fill="rgba(148,163,184,0.7)"
                fontFamily="monospace"
              >
                {(gp / 1000).toFixed(0)}K
              </text>
            );
          })}

          {/* X-axis labels */}
          {[0, 3, 6, 9, 13].map((idx) => (
            <text
              key={idx}
              x={pts[idx].x} y={H - 6}
              textAnchor="middle"
              fontSize="9"
              fill="rgba(148,163,184,0.5)"
            >
              {times[idx]}
            </text>
          ))}

          {/* Area fill */}
          <path d={areaD} fill="url(#priceAreaGrad)" className="area-fade" />

          {/* Price line */}
          <path
            d={lineD}
            fill="none"
            stroke="var(--primary-color)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#lineGlow)"
            className="price-line-draw"
          />

          {/* Data points + hover zones */}
          {pts.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x} cy={p.y}
                r={hoveredIdx === i ? 6 : 3.5}
                fill={hoveredIdx === i ? "var(--primary-color)" : "#020408"}
                stroke="var(--primary-color)"
                strokeWidth={hoveredIdx === i ? 2.5 : 2}
                style={{ transition: "r 0.15s, fill 0.15s" }}
              />
              {/* invisible larger hit area */}
              <circle
                cx={p.x} cy={p.y} r="12"
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(i)}
              />
              {/* Tooltip */}
              {hoveredIdx === i && (
                <foreignObject
                  x={Math.min(p.x - 44, W - padR - 90)}
                  y={Math.max(p.y - 46, padT)}
                  width="90"
                  height="38"
                >
                  <div
                    style={{
                      background: "rgba(9,14,26,0.95)",
                      border: "1px solid rgba(var(--primary-color-rgb),0.4)",
                      borderRadius: "8px",
                      padding: "4px 8px",
                      fontSize: "10px",
                      color: "#f8fafc",
                      fontFamily: "monospace",
                      pointerEvents: "none",
                    }}
                  >
                    <div style={{ color: "var(--primary-color)", fontWeight: 800 }}>
                      {p.price.toLocaleString()} UAH
                    </div>
                    <div style={{ color: "rgba(148,163,184,0.7)", fontSize: "9px" }}>{p.time}</div>
                  </div>
                </foreignObject>
              )}
            </g>
          ))}

          {/* Latest price pulse */}
          <circle
            cx={pts[pts.length - 1].x}
            cy={pts[pts.length - 1].y}
            r="8"
            fill="none"
            stroke="var(--primary-color)"
            strokeWidth="1"
            className="radar-pulse-dot"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5 pt-3">
        <span>Старт: <span className="text-slate-300 font-mono font-bold">{prices[0].toLocaleString()} UAH</span></span>
        <span>Зараз: <span className="text-brand-primary font-mono font-bold">{prices[prices.length - 1].toLocaleString()} UAH</span></span>
      </div>
    </div>
  );
}

// ── AI Price Predictor (Task 4) ────────────────────────────────────────────
function AiPredictor({ currentPrice, category }: { currentPrice: number; category: string }) {
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [prediction, setPrediction] = useState({
    minPrice: 0,
    maxPrice: 0,
    confidence: 0,
  });

  const generatePrediction = () => {
    const spread = 0.08 + Math.random() * 0.12;
    const midMult = 1.1 + Math.random() * 0.25;
    const mid = Math.round(currentPrice * midMult);
    const min = Math.round(mid * (1 - spread));
    const max = Math.round(mid * (1 + spread));
    const confidence = Math.round(72 + Math.random() * 22);
    return { minPrice: min, maxPrice: max, confidence };
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPrediction(generatePrediction());
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setThinking(true);
      setTimeout(() => {
        setPrediction(generatePrediction());
        setThinking(false);
      }, 1200);
    }, 15000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, currentPrice]);

  const factors = [
    { label: "Швидкість ставок", value: "Висока", positive: true },
    { label: "Час до закінчення", value: "12г 45хв", positive: true },
    { label: `Попит (${category || "Категорія"})`, value: "Дуже активний", positive: true },
    { label: "Іст. дані схожих лотів", value: "+18% сезонний пік", positive: true },
  ];

  return (
    <div className="glass-panel p-6 rounded-3xl border border-brand-primary/20 space-y-5 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/[0.03] rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
          <span className="text-lg">🤖</span>
          AI Прогноз ціни
          <span className="text-[10px] text-brand-primary font-bold bg-brand-primary/10 border border-brand-primary/20 px-2 py-0.5 rounded-lg">KRAM Intelligence</span>
        </h3>
        {!loading && (
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                thinking ? "bg-amber-400 animate-pulse" : "bg-brand-primary"
              }`}
            />
            <span className="text-[9px] text-slate-500 font-semibold">
              {thinking ? "Аналіз..." : "Оновлено"}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4 py-2">
          {/* Shimmer loading */}
          <div className="shimmer-skeleton h-10 rounded-2xl w-full" />
          <div className="shimmer-skeleton h-6 rounded-xl w-3/4" />
          <div className="shimmer-skeleton h-6 rounded-xl w-1/2" />
          <div className="shimmer-skeleton h-24 rounded-2xl w-full" />
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <span className="w-3 h-3 rounded-full border-2 border-brand-primary border-t-transparent animate-spin block" />
            Завантаження нейромережі KRAM AI...
          </div>
        </div>
      ) : (
        <div className={`space-y-4 transition-opacity duration-500 ${thinking ? "opacity-50" : "opacity-100"}`}>
          {/* Price Range */}
          <div
            className="rounded-2xl p-4 space-y-1"
            style={{
              background: "linear-gradient(135deg, rgba(var(--primary-color-rgb),0.08), rgba(var(--primary-color-rgb),0.03))",
              border: "1px solid rgba(var(--primary-color-rgb),0.2)",
            }}
          >
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Прогнозований діапазон</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-white font-mono">
                {prediction.minPrice.toLocaleString()}
              </span>
              <span className="text-slate-500 text-xs">—</span>
              <span className="text-2xl font-black text-brand-primary font-mono">
                {prediction.maxPrice.toLocaleString()}
              </span>
              <span className="text-sm text-slate-400 font-semibold">UAH</span>
            </div>
          </div>

          {/* Confidence */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 font-semibold">Достовірність прогнозу:</span>
              <span className="text-brand-primary font-black">{prediction.confidence}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${prediction.confidence}%`,
                  background: `linear-gradient(90deg, var(--primary-color), var(--primary-color-hover))`,
                  boxShadow: "0 0 8px var(--primary-glow)",
                }}
              />
            </div>
          </div>

          {/* Factors */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Аналітичні фактори:</p>
            {factors.map((f, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{f.label}</span>
                <span className={`font-bold ${
                  f.positive ? "text-brand-primary" : "text-red-400"
                }`}>{f.value}</span>
              </div>
            ))}
          </div>

          <p className="text-[9px] text-slate-600 leading-relaxed border-t border-white/5 pt-3">
            ⚠️ Прогноз формується алгоритмами KRAM Intelligence на основі ринкових даних. Не є фінансовою порадою.
          </p>
        </div>
      )}
    </div>
  );
}

// Калькулятор прогнозу вигоди та страхування лоту
function ProfitCalculator({ currentPrice }: { currentPrice: number }) {
  const [targetSellPrice, setTargetSellPrice] = useState(Math.round(currentPrice * 1.3));
  const [premiumOption, setPremiumOption] = useState(true);

  const profit = targetSellPrice - currentPrice;
  const insuranceFee = Math.round(currentPrice * (premiumOption ? 0.015 : 0.005));
  const netProfit = profit - insuranceFee;
  const safetyRate = premiumOption ? 99.9 : 87.2;

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-5 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div>
        <h4 className="text-sm font-bold text-white font-display">Калькулятор вигоди та страхування</h4>
        <p className="text-[10px] text-slate-500">Прогноз окупності лоту та розрахунок гарантійного фонду</p>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-semibold text-slate-300">
          <span>Цільова ціна перепродажу</span>
          <span className="font-extrabold text-emerald-400 font-mono">{targetSellPrice.toLocaleString()} UAH</span>
        </div>
        <input
          type="range"
          min={currentPrice}
          max={currentPrice * 2}
          step={Math.max(1000, Math.round(currentPrice * 0.05))}
          value={targetSellPrice}
          onChange={(e) => {
            soundService.playHover();
            setTargetSellPrice(Number(e.target.value));
          }}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[9px] text-slate-600 font-mono">
          <span>{currentPrice.toLocaleString()} UAH</span>
          <span>{(currentPrice * 2).toLocaleString()} UAH</span>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-slate-200">Посилена Escrow-гарантія</span>
          <p className="text-[9px] text-slate-500">100% покриття від будь-яких логістичних форс-мажорів</p>
        </div>
        <button
          type="button"
          onClick={() => {
            soundService.playClick();
            setPremiumOption(!premiumOption);
          }}
          className={`h-5 w-10 rounded-full relative transition-colors shrink-0 ${premiumOption ? 'bg-emerald-500' : 'bg-slate-800'}`}
        >
          <div className={`h-4.5 w-4.5 rounded-full bg-white absolute top-0.5 transition-all ${premiumOption ? 'left-5' : 'left-0.5'}`} />
        </button>
      </div>

      <div className="h-[1px] bg-white/5 my-2" />

      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Прогнозований чистий прибуток:</span>
          <span className="font-extrabold text-emerald-400 font-mono text-glow-emerald">
            +{netProfit.toLocaleString()} UAH
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Вартість страхування фонду:</span>
          <span className="font-bold text-slate-200 font-mono">{insuranceFee.toLocaleString()} UAH</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Покриття безпеки капіталу:</span>
          <span className="font-extrabold text-violet-400 font-mono">{safetyRate}%</span>
        </div>
      </div>
    </div>
  );
}

const NOVA_POSHTA_DATA: Record<string, string[]> = {
  "Київ": [
    "Відділення №1 (вул. Пирогова, 2)",
    "Відділення №15 (вул. Хрещатик, 21)",
    "Відділення №42 (просп. Перемоги, 89)",
    "Поштомат №4432 (вул. Богдана Хмельницького, 4)",
    "Відділення №90 (вул. Григорія Сковороди, 1)",
    "Поштомат №1205 (вул. Велика Васильківська, 32)"
  ],
  "Харків": [
    "Відділення №1 (вул. Польова, 67)",
    "Відділення №12 (вул. Сумська, 128)",
    "Поштомат №8731 (просп. Науки, 12)",
    "Відділення №45 (вул. Полтавський Шлях, 144)"
  ],
  "Одеса": [
    "Відділення №1 (вул. Дальницька, 23/4)",
    "Відділення №8 (вул. Дерибасівська, 10)",
    "Поштомат №5512 (вул. Генуезька, 24)",
    "Відділення №29 (вул. Академіка Корольова, 33)"
  ],
  "Дніпро": [
    "Відділення №1 (вул. Маршала Малиновського, 114)",
    "Відділення №14 (просп. Дмитра Яворницького, 65)",
    "Поштомат №6618 (вул. Робоча, 152)",
    "Відділення №33 (вул. Слобожанська, 40)"
  ],
  "Львів": [
    "Відділення №1 (вул. Городоцька, 359)",
    "Відділення №5 (вул. Данила Апостола, 16)",
    "Відділення №22 (вул. Шевченка, 317)",
    "Поштомат №9911 (просп. Свободи, 28)",
    "Відділення №50 (вул. Зелена, 149)"
  ],
  "Запоріжжя": [
    "Відділення №1 (вул. Авіаційна, 56)",
    "Відділення №10 (просп. Соборний, 147)",
    "Поштомат №7702 (вул. Перемоги, 61)"
  ],
  "Івано-Франківськ": [
    "Відділення №1 (вул. Мазепи, 175)",
    "Відділення №7 (вул. Галицька, 34)",
    "Поштомат №4401 (вул. Незалежності, 12)"
  ]
};

export default function LotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, updateBalance } = useAuth();
  
  const [listing, setListing] = useState<| null>(null);
  const [bids, setBids] = useState<any[]>([]);
  
  const [bidAmount, setBidAmount] = useState<string>("");
  const [priceFlashed, setPriceFlashed] = useState(false);
  
  const [chatMessage, setChatMessage] = useState("");
  const [chatWarning, setChatWarning] = useState<string | null>(null);

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [deliveryProvider, setDeliveryProvider] = useState("NOVA_POSHTA");
  const [novaPoshtaCity, setNovaPoshtaCity] = useState("Київ");
  const [novaPoshtaBranch, setNovaPoshtaBranch] = useState("Відділення №1 (вул. Пирогова, 2)");
  const [paymentMethod, setPaymentMethod] = useState<"BALANCE" | "CARD">("CARD");
  const [showCardPaymentModal, setShowCardPaymentModal] = useState(false);
  const [cardPaymentStep, setCardPaymentStep] = useState(0); // 0: Form, 1: Loading, 2: OTP, 3: Success
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [citySearchQuery, setCitySearchQuery] = useState("Київ");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [paymentLoadingText, setPaymentLoadingText] = useState("Встановлення захищеного з’єднання...");
  
  const [transaction, setTransaction] = useState<| null>(null);

  const [botsActive, setBotsActive] = useState(true);
  const [botNotification, setBotNotification] = useState<{ text: string; amount: number; bidder: string } | null>(null);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const loadListingData = useCallback(async () => {
    const item = await apiService.getListingById(id);
    if (item) {
      setListing(item);
      const bidsData = await apiService.getBids(id);
      setBids(bidsData);
      
      if (user) {
        const txs = await apiService.getTransactions(user.id);
        const existingTx = txs.find(t => t.listingId === id);
        if (existingTx) setTransaction(existingTx);
      }
    }
  }, [id, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadListingData();
  }, [loadListingData]);

  useEffect(() => {
    // Handle Stripe redirect
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("checkout_success") === "true") {
        const sid = urlParams.get("session_id");
        const bId = urlParams.get("buyerId");
        const dp = urlParams.get("delivery");
        
        if (bId && dp && listing && !transaction) {
          // Stripe checkout successful, create the actual transaction in KRAM DB
          apiService.buyNow(listing.id, bId, dp).then((res) => {
            if (res.success) {
              soundService.playSuccess();
              confetti({ particleCount: 180, spread: 100, origin: { y: 0.5 } });
              if (res.transaction) setTransaction(res.transaction);
              // Clean up URL
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          });
        }
      } else if (urlParams.get("checkout_canceled") === "true") {
        soundService.playWarning();
        alert("Оплату скасовано.");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [listing, transaction]);

  // Real-time Server-Sent Events (SSE) Listener for bids and checkout events
  useEffect(() => {
    const eventSource = new EventSource("/api/events");
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.listingId === id) {
          if (data.type === "BID") {
            setListing(prev => prev ? { ...prev, currentPrice: data.currentPrice } : null);
            soundService.playGavel();
            setPriceFlashed(true);
            setTimeout(() => setPriceFlashed(false), 1200);

            if (data.bid && (!user || data.bid.bidderId !== user.id)) {
              setBotNotification({
                text: `Нова ставка від учасника ${data.bid.bidderName}!`,
                amount: data.currentPrice,
                bidder: data.bid.bidderName
              });
              setTimeout(() => setBotNotification(null), 5000);
            }
            loadListingData();
          } else if (data.type === "BUY_NOW") {
            loadListingData();
          }
        }
      } catch (e) {
        console.error("SSE parsing error:", e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [id, user, loadListingData]);

  // Симулятор ставок ботів (імітація тиску покупців)
  useEffect(() => {
    if (!listing || listing.status !== "ACTIVE" || listing.type === "BUY_NOW" || !botsActive) return;

    const botNames = [
      "Odesa_Collector",
      "Lviv_Dandy",
      "Kyiv_Capitalist",
      "VIP_Dealer_UA",
      "Kharkiv_Retro",
      "Antikvar_Kyiv",
      "Dnipro_Elite_Trader"
    ];

    const triggerBotBid = async () => {
      if (user && user.id === listing.sellerId) return;

      const randomBot = botNames[Math.floor(Math.random() * botNames.length)];
      const increment = listing.bidStep + (Math.floor(Math.random() * 2) * (listing.bidStep / 2));
      const newPrice = listing.currentPrice + increment;

      await apiService.placeBid(listing.id, `bot-${randomBot}`, randomBot, newPrice);
    };

    const randomInterval = Math.floor(Math.random() * 14000) + 12000;
    const botTimer = setInterval(triggerBotBid, randomInterval);

    return () => clearInterval(botTimer);
  }, [listing, botsActive, user]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      soundService.playWarning();
      alert("Будь ласка, увійдіть в систему, щоб зробити ставку!");
      return;
    }
    if (user.id === listing?.sellerId) {
      soundService.playWarning();
      alert("Ви не можете робити ставки на свій власний лот!");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minRecommendedBid) {
      soundService.playWarning();
      alert(`Мінімальна ставка повинна бути не менше ${minRecommendedBid} UAH!`);
      return;
    }

    if (user.balance < amount) {
      soundService.playWarning();
      alert("Недостатньо коштів на балансі для здійснення цієї ставки!");
      return;
    }

    const res = await apiService.placeBid(listing!.id, user.id, user.name, amount);
    if (res.success) {
      soundService.playSuccess();
      confetti({
        particleCount: 110,
        spread: 60,
        colors: ["#10b981", "#34d399", "#60a5fa"]
      });
      setBidAmount("");
    } else {
      soundService.playWarning();
      alert(res.error || "Помилка при розміщенні ставки");
    }
  };

  const triggerManualBotBid = async () => {
    if (!listing) return;
    const botNames = ["VIP_Dealer_UA", "Odesa_Collector", "Kyiv_Capitalist"];
    const randomBot = botNames[Math.floor(Math.random() * botNames.length)];
    const newPrice = listing.currentPrice + listing.bidStep;

    await apiService.placeBid(listing.id, `bot-${randomBot}`, randomBot, newPrice);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length > 0 ? parts.join(" ") : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const fillDemoCard = (type: "MONO" | "LIQPAY") => {
    soundService.playImportSuccess();
    if (type === "MONO") {
      setCardNumber("4441 1111 2222 3333");
      setCardExpiry("12/28");
      setCardCvv("777");
    } else {
      setCardNumber("5168 1111 2222 3333");
      setCardExpiry("10/29");
      setCardCvv("888");
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing) return;
    if (user.id === listing.sellerId) {
      soundService.playWarning();
      alert("Ви не можете викупити власний лот!");
      return;
    }

    if (paymentMethod === "BALANCE") {
      if (!listing.buyNowPrice) return;
      if (user.balance < listing.buyNowPrice) {
        soundService.playWarning();
        alert("Недостатньо коштів на вашому балансі!");
        return;
      }
      handleBuyNowSubmit(e);
    } else {
      soundService.playClick();
      const otp = generateOtpCode();
      setGeneratedOtp(otp);
      setOtpCode("");
      setOtpError(null);
      setCardPaymentStep(0);
      setShowCardPaymentModal(true);
      setShowBuyModal(false);
    }
  };

  const handleCardPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick();
    setCardPaymentStep(1);
    setPaymentLoadingText("Перенаправлення на безпечний платіжний шлюз Stripe...");
    
    if (!listing || !user) return;

    const amount = listing.buyNowPrice || listing.currentPrice;
    const res = await apiService.createCheckoutSession(listing.id, user.id, deliveryProvider, amount);
    
    if (res.url) {
      window.location.href = res.url;
    } else {
      soundService.playWarning();
      alert("Помилка ініціалізації Stripe: " + res.error);
      setCardPaymentStep(0);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== generatedOtp) {
      soundService.playWarning();
      setOtpError("Невірний код безпеки! Спробуйте ще раз.");
      return;
    }

    setOtpError(null);
    setCardPaymentStep(1);
    setPaymentLoadingText("Завершення транзакції банку та випуск ТТН...");

    const res = await apiService.buyNow(listing!.id, user!.id, deliveryProvider);
    if (res.success) {
      soundService.playSuccess();
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.5 }
      });

      if (res.transaction) setTransaction(res.transaction);
      setCardPaymentStep(3);
      
      setTimeout(() => {
        setShowCardPaymentModal(false);
      }, 2500);
    } else {
      soundService.playWarning();
      alert(res.error || "Помилка проведення транзакції");
      setCardPaymentStep(0);
    }
  };

  const handleBuyNowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing) return;
    if (user.id === listing.sellerId) {
      soundService.playWarning();
      alert("Ви не можете викупити власний лот!");
      return;
    }
    if (!listing.buyNowPrice) return;
    if (user.balance < listing.buyNowPrice) {
      soundService.playWarning();
      alert("Недостатньо коштів на вашому балансі!");
      return;
    }

    const res = await apiService.buyNow(listing.id, user.id, deliveryProvider);
    if (res.success) {
      soundService.playSuccess();
      await updateBalance(-listing.buyNowPrice);
      
      confetti({
        particleCount: 180,
        spread: 90,
        origin: { y: 0.5 }
      });

      setShowBuyModal(false);
      if (res.transaction) setTransaction(res.transaction);
    } else {
      soundService.playWarning();
      alert(res.error || "Помилка при купівлі лота");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || chatMessage.trim() === "" || !listing) return;

    const res = await apiService.sendMessage(listing.id, user.id, listing.sellerId, chatMessage);
    
    if (res.warning) {
      soundService.playWarning();
      setChatWarning(res.warning);
    } else {
      soundService.playClick();
      setChatWarning(null);
      setChatMessage("");
      alert("✉️ Ваше запитання успішно надіслано продавцю! Ви можете переглянути його в чатах.");
    }
  };

  const getTimeRemaining = (endTimeStr: string) => {
    const total = Date.parse(endTimeStr) - Date.parse(new Date().toISOString());
    if (total <= 0) return "Торги завершено";
    
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}д ${hours}г ${minutes}хв`;
    return `${hours}г ${minutes}хв ${seconds}с`;
  };

  // 3D Parallax Tilt Effect для галереї зображень
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    card.style.transform = `perspective(1200px) rotateX(${-y / 25}deg) rotateY(${x / 25}deg) scale3d(1.01, 1.01, 1.01)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  const mapCities = {
    Lviv: { name: "Львів", x: 80, y: 130 },
    Kyiv: { name: "Київ", x: 230, y: 90 },
    Odesa: { name: "Одеса", x: 210, y: 220 },
    Dnipro: { name: "Дніпро", x: 330, y: 140 },
    Kharkiv: { name: "Харків", x: 370, y: 100 }
  };

  const sellerCity = (id && typeof id === "string" && id.length > 0)
    ? (id.charCodeAt(0) % 2 === 0 ? mapCities.Lviv : mapCities.Odesa)
    : mapCities.Lviv;
  const buyerCity = mapCities.Kyiv;
  const minRecommendedBid = listing ? listing.currentPrice + listing.bidStep : 0;

  if (!listing) {
    return (
      <div className="flex flex-col min-h-screen bg-[#020408] items-center justify-center">
        <p className="text-slate-400 text-xs animate-pulse">Завантаження лоту...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#020408] bg-grid-pattern relative">
      <Navbar />

      {/* Фонові світлові ефекти */}
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] bg-violet-600/[0.04] rounded-full blur-[120px] pointer-events-none animate-ambient-slow" />
      <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-emerald-500/[0.04] rounded-full blur-[140px] pointer-events-none animate-ambient-slow" />

      {/* Спливаюче вікно нової ставки */}
      {botNotification && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-violet-500/30 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl animate-slide-up flex items-center gap-3 max-w-sm">
          <div className="h-10 w-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center pulse-neon-violet shrink-0">
            <Gavel className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{botNotification.text}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Учасник: <span className="text-violet-400 font-semibold">{botNotification.bidder}</span></p>
            <p className="text-sm font-extrabold text-violet-400 mt-1">{botNotification.amount.toLocaleString()} UAH</p>
          </div>
        </div>
      )}

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        
        {/* Кнопка повернення */}
        <Link 
          href="/" 
          onClick={() => soundService.playClick()}
          onMouseEnter={() => soundService.playHover()}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Назад до каталогу лотів
        </Link>

        {/* Основна секція деталей лоту */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Галерея зображень лоту з 3D нахилом */}
          <div className="lg:col-span-7 space-y-4">
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="glass-panel aspect-video rounded-3xl overflow-hidden bg-slate-950/80 border border-white/5 relative group transition-all duration-300"
            >
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="h-full w-full object-cover transition-transform duration-75"
              />
              
              {/* Статус завершеного аукціону */}
              {listing.status === "COMPLETED" && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="rounded-2xl border border-emerald-500 bg-slate-900/95 p-6 text-center shadow-2xl max-w-xs border-draw-container border-draw-container-active">
                    <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                    <span className="text-sm font-bold text-white block uppercase tracking-wider">Угода Завершена</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Лот успішно викуплено покупцем</span>
                  </div>
                </div>
              )}
            </div>
            
            {listing.images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {listing.images.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => soundService.playClick()}
                    onMouseEnter={() => soundService.playHover()}
                    className="glass-panel aspect-video rounded-2xl overflow-hidden border border-white/5 cursor-pointer hover:border-emerald-500/30 transition-all"
                  >
                    <img src={img} alt="Дрібне зображення лоту" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Інформація про ставки та ціни */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase border border-white/10">
                  ID лоту: {listing.id.substring(0, 8)}
                </span>
                
                {listing.type === "AUCTION" && (
                  <span className="rounded-lg bg-violet-600/10 text-violet-400 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border border-violet-500/20">
                    🔨 Аукціон
                  </span>
                )}
                {listing.type === "BUY_NOW" && (
                  <span className="rounded-lg bg-emerald-600/10 text-emerald-400 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border border-emerald-500/20">
                    ⚡ Купити зараз
                  </span>
                )}
                {listing.type === "HYBRID" && (
                  <span className="rounded-lg bg-gradient-to-r from-emerald-500/10 to-violet-500/10 text-emerald-400 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border border-emerald-500/20">
                    💎 Гібридний формат
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight leading-snug">
                {listing.title}
              </h1>
            </div>

            {/* Блок цін лоту */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="grid grid-cols-2 gap-4">
                {listing.type !== "BUY_NOW" && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Поточна ставка</span>
                    <p className={`text-3xl font-black mt-1 transition-all duration-300 ${
                      priceFlashed ? "text-violet-400 text-glow-violet scale-105" : "text-slate-100"
                    }`}>
                      {listing.currentPrice.toLocaleString()} UAH
                    </p>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Мінімум: {minRecommendedBid.toLocaleString()} UAH</span>
                  </div>
                )}
                
                {listing.type !== "AUCTION" && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                      {listing.type === "HYBRID" ? "Бліц-ціна" : "Ціна викупу"}
                    </span>
                    <p className="text-3xl font-black text-emerald-400 text-glow-emerald mt-1">
                      {listing.buyNowPrice?.toLocaleString()} UAH
                    </p>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Отримання в 1 клік</span>
                  </div>
                )}
              </div>

              {/* Таймер завершення */}
              {listing.type !== "BUY_NOW" && listing.status === "ACTIVE" && (
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-violet-400" />
                    <span className="text-xs text-slate-400">До закінчення торгів:</span>
                  </div>
                  <span className="text-xs font-black text-white bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/10 tracking-widest">
                    {getTimeRemaining(listing.endDate)}
                  </span>
                </div>
              )}
            </div>

            {/* Дії учасника */}
            {listing.status === "ACTIVE" && (
              <div className="space-y-4">

                {/* LIVE Auction Button */}
                {listing.type !== "BUY_NOW" && (
                  <Link
                    href={`/auction/${id}`}
                    onClick={() => soundService.playClick()}
                    onMouseEnter={() => soundService.playHover()}
                    className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-3.5 text-sm font-black text-white transition-all shadow-[0_0_25px_rgba(239,68,68,0.25)] border border-red-500/30 relative overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
                    }}
                  >
                    <div className="absolute inset-0 bg-red-500/[0.04] group-hover:bg-red-500/[0.08] transition-all" />
                    <span className="relative flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping absolute" />
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400 relative" />
                      <span className="text-red-400 font-black tracking-wide">🔴 LIVE Торги</span>
                    </span>
                    <span className="relative text-red-300 text-xs font-semibold">— Увійти до кімнати</span>
                  </Link>
                )}

                {listing.type !== "BUY_NOW" && (
                  <form onSubmit={handlePlaceBid} className="flex gap-2">
                    <div className="flex-grow relative rounded-2xl border border-white/10 bg-slate-950/80 p-3.5 flex items-center">
                      <span className="text-xs text-slate-500 mr-2 font-semibold">UAH:</span>
                      <input
                        type="number"
                        className="bg-transparent border-0 text-sm font-extrabold text-white focus:ring-0 focus:outline-none w-full"
                        placeholder={minRecommendedBid.toString()}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={minRecommendedBid}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      onMouseEnter={() => soundService.playHover()}
                      className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 px-6 font-bold text-xs text-white transition-all shrink-0 flex items-center gap-1.5 shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-violet-500/20"
                    >
                      <Gavel className="h-4 w-4" />
                      Поставити
                    </button>
                  </form>
                )}

                {listing.type !== "BUY_NOW" && (
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span>Швидкий крок ставкою:</span>
                      {[
                        minRecommendedBid,
                        minRecommendedBid + listing.bidStep,
                        minRecommendedBid + listing.bidStep * 3
                      ].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            soundService.playClick();
                            setBidAmount(val.toString());
                          }}
                          className="rounded bg-white/5 border border-white/10 hover:border-violet-500/30 hover:text-violet-400 px-2 py-1 transition-colors font-semibold font-mono"
                        >
                          +{val.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {listing.type !== "AUCTION" && (
                  <button
                    onClick={() => {
                      soundService.playClick();
                      setShowBuyModal(true);
                    }}
                    onMouseEnter={() => soundService.playHover()}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 py-4 text-xs font-black text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] border border-emerald-400/20 uppercase tracking-wider"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Купити за Безпечною Угодою ({listing.buyNowPrice?.toLocaleString()} UAH)
                  </button>
                )}

                {/* Симулятор ботів контролер */}
                {listing.type !== "BUY_NOW" && (
                  <div className="glass-panel p-3 rounded-2xl border border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${botsActive ? "bg-emerald-500 pulse-neon-emerald" : "bg-slate-500"}`} />
                      <span className="text-slate-400">Симулятор ставок</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={triggerManualBotBid}
                        className="rounded-lg bg-slate-850 hover:bg-slate-850/80 text-slate-300 px-2.5 py-1 text-[10px] font-semibold border border-white/5 transition-colors"
                      >
                        Спровокувати ставку бота
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundService.playClick();
                          setBotsActive(!botsActive);
                        }}
                        className={`rounded-lg px-2 py-1 text-[10px] font-bold border transition-colors ${
                          botsActive ? "border-amber-500/20 bg-amber-500/10 text-amber-400" : "border-white/5 bg-slate-800 text-slate-400"
                        }`}
                      >
                        {botsActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Безпекова угода */}
            <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4 text-[11px] text-slate-400 flex items-start gap-2.5 leading-relaxed">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Безпечна угода KRAM:</strong> Кошти за лот депонуються на транзитному рахунку KRAM Escrow. Продавець отримає гроші тільки після того, як ви оглянете та заберете посилку у відділенні пошти.
              </span>
            </div>

          </div>

        </div>

        {/* Секція оформленої логістики & Мапа Нової Пошти */}
        {transaction && (
          <section className="glass-panel p-8 rounded-3xl border border-emerald-500/25 bg-slate-950/60 mb-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2 font-display">
                  <Truck className="h-5 w-5 text-emerald-400" />
                  Панель логістики та ТТН (Нова Пошта)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Цифрова інтеграція логістики з відстеженням відправлення</p>
              </div>
              <button
                onClick={() => {
                  soundService.playClick();
                  setShowInvoiceModal(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/15 border border-emerald-400/20 transition-all shrink-0"
              >
                <Printer className="h-4 w-4" />
                Друкувати ТТН
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-4 space-y-4">
                <div className="rounded-2xl bg-slate-950 p-4 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Пункт відправлення:</span>
                    <span className="text-white font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-violet-400" />
                      {sellerCity.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Пункт призначення:</span>
                    <span className="text-white font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-emerald-400" />
                      {buyerCity.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
                    <span className="text-slate-500">Номер накладної (ТТН):</span>
                    <span className="text-emerald-400 font-extrabold select-all">{transaction.ttn}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Служба доставки:</span>
                    <span className="text-slate-300 font-semibold">Нова Пошта</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 text-[11px] text-slate-400 leading-normal flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Накладна автоматично синхронізована з серверами Нової Пошти. Натисніть «Друкувати ТТН» для перегляду бланку.
                  </span>
                </div>
              </div>

              {/* Карта маршруту */}
              <div className="lg:col-span-8 glass-panel bg-slate-950/90 rounded-2xl border border-white/5 p-4 flex items-center justify-center min-h-[220px]">
                <div className="relative w-full max-w-[480px] aspect-[4/3] bg-grid-pattern border border-white/5 rounded-xl overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 480 300">
                    <path
                      d="M 50,120 Q 80,100 130,80 T 230,70 T 330,80 T 430,90 T 460,130 T 430,200 T 380,240 T 280,250 T 200,230 T 150,250 T 70,220 Z"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.03)"
                      strokeWidth="2"
                    />

                    {/* Маршрут */}
                    <path
                      d={`M ${sellerCity.x},${sellerCity.y} L ${buyerCity.x},${buyerCity.y}`}
                      fill="none"
                      stroke="url(#routeGrad)"
                      strokeWidth="2.5"
                      className="animated-dash-line"
                    />

                    <defs>
                      <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>

                    {/* Точки міст */}
                    <circle cx={sellerCity.x} cy={sellerCity.y} r="7" className="fill-violet-500/20 stroke-violet-500 stroke-2 radar-pulse-dot" />
                    <circle cx={sellerCity.x} cy={sellerCity.y} r="2.5" className="fill-violet-400" />
                    <text x={sellerCity.x - 20} y={sellerCity.y - 12} className="fill-slate-400 font-display font-semibold text-[10px]">{sellerCity.name}</text>

                    <circle cx={buyerCity.x} cy={buyerCity.y} r="7" className="fill-emerald-500/20 stroke-emerald-500 stroke-2 radar-pulse-dot" />
                    <circle cx={buyerCity.x} cy={buyerCity.y} r="2.5" className="fill-emerald-400" />
                    <text x={buyerCity.x + 10} y={buyerCity.y + 4} className="fill-slate-400 font-display font-semibold text-[10px]">{buyerCity.name}</text>

                    {/* Рухома іконка посилки */}
                    <g transform={`translate(${(sellerCity.x + buyerCity.x) / 2}, ${(sellerCity.y + buyerCity.y) / 2})`}>
                      <circle cx="0" cy="0" r="9" className="fill-emerald-400 stroke-white/20 stroke-1 pulse-neon-emerald" />
                      <path d="M -4 -2 L 2 -2 L 4 0 L 4 3 L -4 3 Z" className="fill-slate-900" />
                      <circle cx="-1.5" cy="4" r="1" className="fill-white" />
                      <circle cx="2.5" cy="4" r="1" className="fill-white" />
                    </g>
                  </svg>
                  
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[9px] text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" /> Відправник
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ml-1" /> Отримувач
                  </div>
                </div>
              </div>

            </div>

            {/* Етапи трекінгу */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-t border-white/5 pt-6">
              <div className="flex flex-col items-center text-center p-3 border-r border-white/5 last:border-0">
                <CheckCircle className="h-6 w-6 text-emerald-400 mb-2" />
                <span className="text-xs font-semibold text-white">Угода оформлена</span>
                <span className="text-[10px] text-slate-500 mt-1">Платіж заблоковано в Escrow</span>
              </div>
              
              <div className="flex flex-col items-center text-center p-3 border-r border-white/5 last:border-0">
                <CheckCircle className="h-6 w-6 text-emerald-400 mb-2" />
                <span className="text-xs font-semibold text-white">ТТН Згенеровано</span>
                <span className="text-[10px] text-emerald-400 font-bold mt-1 select-all">{transaction.ttn}</span>
              </div>

              <div className="flex flex-col items-center text-center p-3 border-r border-white/5 last:border-0">
                <Clock className="h-6 w-6 text-amber-400 mb-2 animate-pulse" />
                <span className="text-xs font-semibold text-slate-200">Передано пошті</span>
                <span className="text-[10px] text-slate-500 mt-1">Транспорт у дорозі</span>
              </div>

              <div className="flex flex-col items-center text-center p-3">
                <Clock className="h-6 w-6 text-slate-600 mb-2" />
                <span className="text-xs font-semibold text-slate-500">Доставлено</span>
                <span className="text-[10px] text-slate-600 mt-1">Очікує огляду клієнтом</span>
              </div>
            </div>
          </section>
        )}

        {/* Додаткові вкладки: Біржовий стакан, опис, чат */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Опис лоту */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-400" />
                  Опис та експертна інформація
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Властивості, технічний стан та гарантії лоту</p>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                {listing.description}
              </p>
              
              <div className="border-t border-white/5 pt-6 space-y-3">
                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block">Доступні способи логістики:</span>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(JSON.stringify(listing.deliveryOptions)).map((opt: string) => (
                    <span key={opt} className="rounded-xl bg-white/5 px-3 py-1.5 text-[10px] text-slate-300 border border-white/10 flex items-center gap-1.5">
                      {opt === "NOVA_POSHTA" && "📦 Нова Почта"}
                      {opt === "UKR_POSHTA" && "📬 Укрпошта Експрес"}
                      {opt === "MEEST" && "⚡ Meest Пошта"}
                      {opt === "COURIER" && "📍 Кур’єр / Самовивіз Київ"}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Прогноз вигоди */}
            <ProfitCalculator currentPrice={listing.currentPrice} />

            {/* AI Прогноз ціни (Task 4) */}
            <AiPredictor currentPrice={listing.currentPrice} category={listing.categoryId} />
          </div>

          {/* Права панель: Ставки (стакан) та чат */}
          <div className="space-y-6">
            
            {/* Графік швидкості та Біржовий Стакан ставок */}
            {listing.type !== "BUY_NOW" && (
              <div className="space-y-6">

                {/* SVG Графік цінової активності (Task 2) */}
                <PriceHistoryChart basePrice={listing.startPrice} />

                {/* Графік швидкості ставок */}
                <BidVelocityChart bids={bids} />

                {/* Біржовий стакан ставок (Order Book) */}
                <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 shadow-xl">
                  <h3 className="text-base font-bold text-white font-display flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Gavel className="h-4 w-4 text-violet-400" />
                      Біржовий стакан ставок
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                      Ставок: {bids.length}
                    </span>
                  </h3>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {bids.length === 0 ? (
                      <p className="text-center py-8 text-xs text-slate-500 font-medium">Ставок поки що немає. Зробіть першу ставку!</p>
                    ) : (
                      bids.map((b, idx) => {
                        const isBot = b.bidderId.startsWith("bot-");
                        return (
                          <div 
                            key={b.id} 
                            className={`flex justify-between items-center rounded-2xl p-3 text-xs border transition-all ${
                              idx === 0 
                                ? "bg-violet-500/[0.04] border-violet-500/30 font-bold" 
                                : "bg-slate-950/60 border-white/5 hover:border-violet-500/20"
                            }`}
                          >
                            <div>
                              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                                {b.bidderName}
                                {isBot && <span className="text-[8px] bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded px-1">БОТ</span>}
                                {idx === 0 && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1">ЛІДЕР</span>}
                              </span>
                              <span className="text-[9px] text-slate-500">
                                {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>
                            <span className={`font-black ${idx === 0 ? "text-emerald-400 text-glow-emerald" : "text-violet-400"}`}>
                              {b.amount.toLocaleString()} UAH
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Експрес чат */}
            {user && user.id !== listing.sellerId && (
              <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 shadow-xl">
                <h3 className="text-base font-bold text-white font-display flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  Експрес-чат з дилером лоту
                </h3>
                
                {chatWarning && (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-3 text-[10px] text-amber-300 leading-normal flex items-start gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{chatWarning}</span>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Поставте запитання про походження лоту, сертифікати чи гарантії..."
                    className="w-full glass-input rounded-2xl text-xs p-3 leading-relaxed focus:ring-1 focus:ring-emerald-500/30"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    required
                  />
                  
                  <div className="text-[9px] text-slate-500 leading-normal">
                    ⚠️ Автоматичний фільтр безпеки сканує чат на предмет шахрайства, спроб передачі прямих контактів або фішингу.
                  </div>

                  <button
                    type="submit"
                    onMouseEnter={() => soundService.playHover()}
                    className="w-full flex items-center justify-center gap-1.5 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-white/10 hover:text-white py-3 text-xs font-bold text-slate-300 transition-all active:scale-98"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Надіслати запит продавцю
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* МОДАЛЬНЕ ВІКНО КУПІВЛІ (БЕЗПЕЧНА УГОДА) */}
      {showBuyModal && listing.buyNowPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl animate-slide-up relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            
            <h3 className="text-xl font-black text-white mb-2 font-display">Оформлення Безпечної Угоди</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Ви купуєте лот <strong className="text-emerald-400">{listing.title}</strong>. Кошти депонуються на рахунку KRAM Escrow до перевірки товару.
            </p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              
              {/* Вибір поштової служби */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Поштова служба доставки</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundService.playClick();
                      setDeliveryProvider("NOVA_POSHTA");
                    }}
                    className={`text-xs p-3 rounded-xl border text-center transition-colors ${
                      deliveryProvider === "NOVA_POSHTA"
                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-400 font-bold"
                        : "border-white/5 bg-slate-950 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    📦 Нова Пошта
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundService.playClick();
                      setDeliveryProvider("UKR_POSHTA");
                    }}
                    className={`text-xs p-3 rounded-xl border text-center transition-colors ${
                      deliveryProvider === "UKR_POSHTA"
                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-400 font-bold"
                        : "border-white/5 bg-slate-950 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    📬 Укрпошта
                  </button>
                </div>
              </div>

              {/* Місто доставки (Нова Пошта Autocomplete Sandbox) */}
              <div className="space-y-2 relative">
                <label className="text-xs font-semibold text-slate-400">Місто доставки</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full glass-input rounded-xl text-xs p-3 pr-10 focus:ring-1 focus:ring-emerald-500/30"
                    placeholder="Введіть місто (наприклад, Київ, Львів...)"
                    value={citySearchQuery}
                    onChange={(e) => {
                      const query = e.target.value;
                      setCitySearchQuery(query);
                      setShowCitySuggestions(true);
                      soundService.playHover();
                      
                      const matchedCity = Object.keys(NOVA_POSHTA_DATA).find(
                        c => c.toLowerCase() === query.trim().toLowerCase()
                      );
                      if (matchedCity) {
                        setNovaPoshtaCity(matchedCity);
                        setNovaPoshtaBranch(NOVA_POSHTA_DATA[matchedCity][0]);
                      }
                    }}
                    onFocus={() => setShowCitySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                    required
                  />
                  <MapPin className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                </div>
                
                {/* Suggestions drop */}
                {showCitySuggestions && (
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-slate-950 shadow-2xl p-1.5 space-y-0.5 scrollbar-thin">
                    {Object.keys(NOVA_POSHTA_DATA)
                      .filter(city => city.toLowerCase().includes(citySearchQuery.toLowerCase()))
                      .map(city => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            soundService.playClick();
                            setNovaPoshtaCity(city);
                            setCitySearchQuery(city);
                            setNovaPoshtaBranch(NOVA_POSHTA_DATA[city][0]);
                            setShowCitySuggestions(false);
                          }}
                          className="w-full text-left text-xs text-slate-300 hover:text-white hover:bg-emerald-500/10 px-3 py-2 rounded-lg transition-colors font-medium"
                        >
                          📍 {city}
                        </button>
                      ))}
                    {Object.keys(NOVA_POSHTA_DATA).filter(city => city.toLowerCase().includes(citySearchQuery.toLowerCase())).length === 0 && (
                      <div className="text-[10px] text-slate-500 p-2 text-center">
                        Інше місто (спробуйте Київ, Харків, Одеса, Дніпро, Львів)
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Відділення пошти */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 font-display">Відділення служби доставки</label>
                {NOVA_POSHTA_DATA[novaPoshtaCity] ? (
                  <select
                    className="w-full glass-input rounded-xl text-xs p-3 bg-slate-950 text-slate-300 border border-white/10 focus:ring-1 focus:ring-emerald-500/30"
                    value={novaPoshtaBranch}
                    onChange={(e) => {
                      soundService.playClick();
                      setNovaPoshtaBranch(e.target.value);
                    }}
                    required
                  >
                    {NOVA_POSHTA_DATA[novaPoshtaCity].map((branch) => (
                      <option key={branch} value={branch} className="bg-slate-950 text-slate-300">
                        {branch}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="w-full glass-input rounded-xl text-xs p-3"
                    value={novaPoshtaBranch}
                    onChange={(e) => setNovaPoshtaBranch(e.target.value)}
                    required
                  />
                )}
              </div>

              {/* Спосіб оплати */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Спосіб оплати Escrow</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundService.playClick();
                      setPaymentMethod("CARD");
                    }}
                    className={`text-xs p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === "CARD"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold"
                        : "border-white/5 bg-slate-950 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    💳 Карткою (Mono / LiqPay)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundService.playClick();
                      setPaymentMethod("BALANCE");
                    }}
                    className={`text-xs p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === "BALANCE"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold"
                        : "border-white/5 bg-slate-950 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    💰 Баланс ({user?.balance?.toLocaleString()} UAH)
                  </button>
                </div>
              </div>

              {/* Розрахунок чеку */}
              <div className="rounded-2xl border border-white/5 bg-slate-950/80 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Вартість товару:</span>
                  <span className="text-white font-semibold">{listing.buyNowPrice.toLocaleString()} UAH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Комісія депонування:</span>
                  <span className="text-emerald-400 font-semibold">0 UAH (Акція)</span>
                </div>
                <div className="h-[1px] bg-white/5 my-2" />
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-white">До сплати:</span>
                  <span className="text-emerald-400 font-black">{listing.buyNowPrice.toLocaleString()} UAH</span>
                </div>
              </div>

              {/* Дії */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    soundService.playClick();
                    setShowBuyModal(false);
                  }}
                  className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  {paymentMethod === "CARD" ? "Перейти до оплати 💳" : `Оплатити ${listing.buyNowPrice.toLocaleString()} UAH`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* НОВИЙ МОНОБАНК / LIQPAY КІБЕР-ПЛАТІЖНИЙ ШЛЮЗ */}
      {showCardPaymentModal && listing.buyNowPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900/95 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative animate-slide-up overflow-hidden">
            {/* Background cyber grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            {/* Close */}
            {cardPaymentStep !== 1 && cardPaymentStep !== 3 && (
              <button
                onClick={() => {
                  soundService.playClick();
                  setShowCardPaymentModal(false);
                }}
                className="absolute top-4 right-4 text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl px-3 py-1.5 transition-all"
              >
                Скасувати
              </button>
            )}

            {/* HEADER */}
            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
              <span className="text-xl">🔐</span>
              <div>
                <h3 className="text-sm font-black tracking-widest text-white uppercase font-display">
                  KRAM Escrow Secure Gateway
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                  Транзитне депонування • {deliveryProvider === "NOVA_POSHTA" ? "Нова Пошта" : "Укрпошта"}
                </p>
              </div>
            </div>

            {/* STEP 0: CARD DETAILS FORM */}
            {cardPaymentStep === 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Form fields */}
                <form onSubmit={handleCardPaymentSubmit} className="lg:col-span-7 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Швидкі демо-картки</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fillDemoCard("MONO")}
                        className="flex-1 rounded-xl bg-[#ffe600]/10 hover:bg-[#ffe600]/20 border border-[#ffe600]/30 text-xs font-bold text-[#ffe600] py-2 transition-all"
                      >
                        🐈 monobank (Visa)
                      </button>
                      <button
                        type="button"
                        onClick={() => fillDemoCard("LIQPAY")}
                        className="flex-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-400 py-2 transition-all"
                      >
                        💚 LiqPay (MC)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Номер кредитної картки</label>
                    <input
                      type="text"
                      className="w-full glass-input rounded-xl text-sm p-3 font-mono font-bold tracking-widest text-white focus:ring-1 focus:ring-emerald-500/30"
                      placeholder="4441 1111 2222 3333"
                      value={cardNumber}
                      onChange={(e) => {
                        soundService.playHover();
                        setCardNumber(formatCardNumber(e.target.value));
                      }}
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Термін дії</label>
                      <input
                        type="text"
                        className="w-full glass-input rounded-xl text-sm p-3 text-center font-mono font-bold text-white focus:ring-1 focus:ring-emerald-500/30"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">CVV-код</label>
                      <input
                        type="password"
                        className="w-full glass-input rounded-xl text-sm p-3 text-center font-mono font-bold text-white focus:ring-1 focus:ring-emerald-500/30"
                        placeholder="***"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ""))}
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-950/60 border border-white/5 p-3.5 text-[10px] text-slate-400 leading-relaxed">
                    🛡️ <strong>KRAM Escrow Protocol:</strong> Кошти будуть списані з вашої картки, але залишаться заблокованими на рахунку ескроу-гарантії. Продавець отримає виплату тільки після вашого підтвердження огляду посилки.
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 py-3.5 text-xs font-black text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] border border-emerald-400/20 uppercase tracking-widest"
                  >
                    Заблокувати {listing.buyNowPrice.toLocaleString()} UAH
                  </button>
                </form>

                {/* Cyber Card Mockup */}
                <div className="lg:col-span-5 hidden lg:block">
                  <div className="w-full aspect-[1.58/1] rounded-2xl p-6 bg-gradient-to-br from-slate-950 to-slate-900 border border-white/10 relative overflow-hidden flex flex-col justify-between shadow-2xl group hover:border-emerald-500/30 hover:scale-[1.02] transition-all duration-300">
                    {/* Gloss element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#ffe600]/[0.02] rounded-full blur-xl pointer-events-none" />

                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black text-emerald-400 font-mono tracking-widest uppercase">KRAM PLATINUM</span>
                      {cardNumber.startsWith("4") ? (
                        <span className="text-xs font-black text-[#ffe600] font-mono">🐈 monobank</span>
                      ) : cardNumber.startsWith("5") ? (
                        <span className="text-xs font-black text-emerald-400 font-mono">💚 LiqPay</span>
                      ) : (
                        <span className="text-xs font-black text-slate-500 font-mono">BANK CARD</span>
                      )}
                    </div>

                    {/* Chip */}
                    <div className="w-8 h-6 bg-amber-400/20 border border-amber-400/30 rounded-md flex items-center justify-center">
                      <span className="text-[10px]">📟</span>
                    </div>

                    {/* Number */}
                    <div className="text-sm font-mono font-bold tracking-widest text-slate-100 text-center py-2">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[8px] text-slate-600 block uppercase font-bold">Власник</span>
                        <span className="text-[10px] font-mono font-bold text-slate-300">{user?.name || "KRAM BUYER"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-slate-600 block uppercase font-bold">Діє до</span>
                        <span className="text-[10px] font-mono font-bold text-slate-300">{cardExpiry || "MM/YY"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-[10px] text-slate-500 font-medium mt-3">
                    3D-Secure 2.0 • Захищено шифруванням SHA-256
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: LOADING SPINNER */}
            {cardPaymentStep === 1 && (
              <div className="py-12 flex flex-col items-center justify-center space-y-6">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <span className="w-16 h-16 rounded-full border-4 border-emerald-500/10 border-t-emerald-400 animate-spin absolute" />
                  <span className="w-10 h-10 rounded-full bg-emerald-500/5 animate-pulse" />
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-sm font-bold text-white animate-pulse">{paymentLoadingText}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Будь ласка, не закривайте вікно...</p>
                </div>
              </div>
            )}

            {/* STEP 2: 3D SECURE OTP CODE */}
            {cardPaymentStep === 2 && (
              <form onSubmit={handleOtpVerify} className="max-w-sm mx-auto py-4 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto text-xl font-bold animate-bounce">
                    🛡️
                  </div>
                  <h4 className="text-sm font-bold text-white">Верифікація безпеки 3D-Secure</h4>
                  <p className="text-xs text-slate-400 leading-normal">
                    Введіть одноразовий код безпеки, надісланий банком-емітентом для підтвердження депонування {listing.buyNowPrice.toLocaleString()} UAH.
                  </p>
                </div>

                {/* Test code suggestion box */}
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-center text-xs">
                  <span className="text-slate-400">Тестовий SMS/Push код: </span>
                  <strong className="text-violet-400 font-mono text-sm tracking-widest">{generatedOtp}</strong>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    className="w-full glass-input rounded-xl text-lg p-3.5 text-center font-mono font-black tracking-[0.6em] focus:ring-1 focus:ring-violet-500/30"
                    placeholder="----"
                    value={otpCode}
                    onChange={(e) => {
                      soundService.playHover();
                      setOtpCode(e.target.value.replace(/[^0-9]/g, ""));
                    }}
                    maxLength={4}
                    required
                  />
                  {otpError && (
                    <p className="text-[10px] font-bold text-red-400 text-center animate-shake">{otpError}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundService.playClick();
                      setCardPaymentStep(0);
                    }}
                    className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Назад
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-500 py-3 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] border border-violet-500/20"
                  >
                    Підтвердити платіж
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SUCCESS STATE */}
            {cardPaymentStep === 3 && (
              <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl animate-scale-up text-glow-emerald">
                  ✓
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-black text-white">🎉 Оплата Успішна!</h4>
                  <p className="text-xs text-emerald-400 font-semibold font-mono">
                    Сума {listing.buyNowPrice.toLocaleString()} UAH депонована у KRAM Escrow
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-sm leading-relaxed mx-auto pt-2">
                    Поштова накладна згенерована. Повідомлення про відправку надіслано дилеру. Ви можете перевірити статус ТТН на сторінці лоту.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО ПЕЧАТИ ТТН (РЕАЛІСТИЧНА НОВА ПОШТА З QR/BARCODES) */}
      {showInvoiceModal && transaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl p-8 shadow-2xl relative animate-slide-up">
            <button
              onClick={() => {
                soundService.playClick();
                setShowInvoiceModal(false);
              }}
              className="absolute top-4 right-4 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl px-3 py-1.5 print:hidden transition-colors"
            >
              Закрити
            </button>

            {/* Бланк Накладної */}
            <div id="printable-area" className="p-4 space-y-6">
              
              {/* Шапка Нової Пошти */}
              <div className="flex justify-between items-start border-b-2 border-red-600 pb-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-red-600 font-display flex items-center">
                    НОВА ПОШТА
                  </h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold mt-0.5">Експрес-накладна (Escrow)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">№ {transaction.ttn}</p>
                  <p className="text-[9px] text-slate-500">Дата генерації: {new Date(transaction.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Штрих-код та QR-код */}
              <div className="flex flex-col sm:flex-row items-center justify-between py-6 px-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                <div className="flex flex-col items-center sm:items-start space-y-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Машинне зчитування (Barcode)</span>
                  <SvgBarcode value={transaction.ttn || ""} />
                  <span className="text-xs font-mono font-bold tracking-widest text-slate-800">*{transaction.ttn}*</span>
                </div>
                <div className="flex flex-col items-center space-y-2 shrink-0">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Цифровий скан (QR)</span>
                  <SvgQRCode />
                </div>
              </div>

              {/* Відправник та Отримувач */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-6">
                <div className="space-y-2.5">
                  <h4 className="font-bold text-red-600 uppercase text-[9px] tracking-wider">Відправник (Дилер KRAM):</h4>
                  <p className="font-extrabold text-slate-900 text-sm">Олександр (KRAM Seller)</p>
                  <p className="text-slate-600 font-medium">Адреса відправки: <strong className="text-slate-900">{sellerCity.name}</strong></p>
                  <p className="text-slate-600 font-medium">Телефон: +38 (067) ***-**-**</p>
                </div>
                <div className="space-y-2.5">
                  <h4 className="font-bold text-red-600 uppercase text-[9px] tracking-wider">Отримувач:</h4>
                  <p className="font-extrabold text-slate-900 text-sm">{user?.name || "Покупець KRAM"}</p>
                  <p className="text-slate-600 font-medium">Місто призначення: <strong className="text-slate-900">{novaPoshtaCity}</strong></p>
                  <p className="text-slate-600 font-medium">Отримує у: <strong className="text-slate-900">{novaPoshtaBranch}</strong></p>
                </div>
              </div>

              {/* Характеристики вантажу */}
              <div className="grid grid-cols-3 gap-4 text-xs border-b border-slate-100 pb-6 text-center sm:text-left">
                <div>
                  <span className="text-slate-500 block">Тип відправлення:</span>
                  <strong className="text-slate-900 text-sm">Посилка / Документи</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Фактична вага:</span>
                  <strong className="text-slate-900 text-sm">1.85 кг</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Оголошена цінність:</span>
                  <strong className="text-slate-900 text-sm font-mono">{transaction.amount.toLocaleString()} UAH</strong>
                </div>
              </div>

              {/* Печатки безпеки та підписи */}
              <div className="flex justify-between items-center pt-4">
                <div className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                  *Доставка за тарифами перевізника Нова Пошта. Безпеку фінансового супроводу угоди гарантовано платформою KRAM Escrow.
                </div>
                <div className="relative flex items-center justify-center h-20 w-20 border-2 border-emerald-500 rounded-full rotate-12 bg-emerald-50/10">
                  <span className="text-[8px] font-black text-emerald-600 text-center uppercase tracking-wider leading-tight">
                    KRAM.UA<br />Escrow<br />ОДОБРЕНО
                  </span>
                </div>
              </div>

            </div>

            {/* Кнопка запуска печати */}
            <div className="mt-8 flex justify-end gap-2 print:hidden">
              <button
                onClick={() => {
                  soundService.playClick();
                  window.print();
                }}
                className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Printer className="h-4 w-4" />
                Запустити друк бланка ТТН
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
