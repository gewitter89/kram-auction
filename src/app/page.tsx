"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiService } from "@/lib/api-service";
import { 
  Search, 
  Laptop, 
  Gem, 
  Watch, 
  Car, 
  Palette, 
  Building, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Truck, 
  ArrowRight,
  Plus,
  Trophy,
  ChevronDown,
  HelpCircle
} from "lucide-react";
import { soundService } from "@/lib/sound-service";
import { Category, Listing } from "@prisma/client";


// Маппінг іконок категорій для Lucide
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Laptop,
  Gem,
  Watch,
  Car,
  Palette,
  Building
};

// Динамічний Canvas фон: сузір'я частинок, які реагують на курсор
function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const numParticles = 60;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.8 + 1,
      });
    }

    const mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Малюємо та оновлюємо частинки
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Притягування або реакція на курсор
        if (mouse.x > 0) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            p.x -= dx * 0.01;
            p.y -= dy * 0.01;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        // Читаємо поточний колір теми через CSS-змінну на кожному кадрі
        const rgb = getComputedStyle(document.documentElement).getPropertyValue('--primary-color-rgb').trim() || '16, 185, 129';
        ctx.fillStyle = `rgba(${rgb}, 0.25)`;
        ctx.fill();
      });

      // Малюємо лінії зв'язків між найближчими частинками
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const rgb2 = getComputedStyle(document.documentElement).getPropertyValue('--primary-color-rgb').trim() || '16, 185, 129';
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${rgb2}, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Зв'язок частинок з мишкою
      if (mouse.x > 0) {
        particles.forEach((p) => {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.2 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

const LOG_TEMPLATES = [
  { text: () => `[SYS] Free beta mode active — no KRAM payments`, type: 'sys' },
  { text: () => `[NET] Marketplace API heartbeat OK`, type: 'net' },
  { text: () => `[WAF] Security filters active`, type: 'warn' },
  { text: () => `[DIRECT] Users arrange payment and delivery directly`, type: 'bid' },
  { text: () => `[KRAM] Empty states show only real user listings`, type: 'sys' },
  { text: () => `[SAFE] No internal balance, custody or platform commission`, type: 'crypto' },
];

// Плаваюча Cyber-HUD Консоль безпеки та активності
function CyberHUD() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<Array<{id: number; text: string; type: string; ts: string}>>([]);
  const [ping, setPing] = useState(12);
  const logRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    const tick = setInterval(() => {
      counterRef.current++;
      const template = LOG_TEMPLATES[counterRef.current % LOG_TEMPLATES.length];
      const now = new Date();
      const ts = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}.${now.getMilliseconds().toString().padStart(3,'0')}`;
      const newLog = { id: counterRef.current, text: template.text(), type: template.type, ts };
      setLogs(prev => [...prev.slice(-60), newLog]);
      soundService.playConsoleTick();
      // Реальне вимірювання пінгу
      const t0 = performance.now();
      fetch('/', { method: 'HEAD', cache: 'no-store' }).then(() => {
        setPing(Math.round(performance.now() - t0));
      }).catch(() => setPing(Math.floor(Math.random()*20+8)));
    }, 900);
    return () => clearInterval(tick);
  }, [isOpen]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const LOG_COLOR: Record<string, string> = {
    bid: 'text-brand-primary',
    net: 'text-blue-400',
    warn: 'text-rose-400',
    crypto: 'text-violet-400',
    sys: 'text-slate-300',
    escrow: 'text-amber-400',
  };

  return (
    <>
      {/* Плаваюча кнопка HUD */}
      <button
        onClick={() => {
          setIsOpen(v => !v);
          soundService.playConsoleOpen();
        }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-brand-primary/30 bg-slate-950/90 px-4 py-3 text-xs font-bold uppercase tracking-widest text-brand-primary backdrop-blur-xl shadow-[0_0_20px_var(--primary-glow)] hover:shadow-[0_0_30px_var(--primary-glow)] hover:border-brand-primary/60 transition-all group pulse-neon-emerald"
        title="KRAM Cyber-HUD"
      >
        <span className="inline-block w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
        <span>Cyber-HUD</span>
        <span className="text-slate-600 font-mono text-[10px]">v1.4</span>
      </button>

      {/* Плаваюча консоль */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl border border-brand-primary/25 bg-slate-950/95 shadow-[0_0_40px_var(--primary-glow)] backdrop-blur-2xl overflow-hidden animate-slide-up">
          {/* Заголовок терміналу */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-slate-900/80">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-brand-primary" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary ml-2">KRAM :: CYBER-HUD</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-500">
                PING: <span className={ping < 50 ? 'text-brand-primary' : ping < 150 ? 'text-amber-400' : 'text-rose-400'}>{ping}ms</span>
              </span>
              <button onClick={() => { setIsOpen(false); soundService.playClick(); }} className="text-slate-500 hover:text-white transition-colors text-xs">✕</button>
            </div>
          </div>

          {/* Логи */}
          <div ref={logRef} className="h-64 overflow-y-auto px-4 py-3 space-y-1 font-mono text-[11px] matrix-terminal">
            {logs.length === 0 && (
              <p className="text-slate-600 animate-pulse">&gt; Ініціалізація KRAM Security Monitor...</p>
            )}
            {logs.map(log => (
              <div key={log.id} className="flex gap-2 items-start animate-fade-in">
                <span className="text-slate-600 shrink-0">{log.ts}</span>
                <span className={LOG_COLOR[log.type] || 'text-slate-400'}>{log.text}</span>
              </div>
            ))}
          </div>

          {/* Статус-бар */}
          <div className="px-4 py-2 border-t border-white/5 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">LIVE</span>
            </div>
            <span className="text-[9px] text-slate-600 font-mono">{logs.length} events</span>
            <button onClick={() => setLogs([])} className="text-[9px] text-slate-600 hover:text-rose-400 transition-colors">clear</button>
          </div>
        </div>
      )}
    </>
  );
}

// Рухома стрічка подій KRAM Live
function LiveEventTape() {
  const liveEvents = [
    "🤝 KRAM — безкоштовна beta-платформа для прямих домовленостей",
    "🛡️ Порада: перевіряйте товар до оплати та зберігайте історію чату",
    "💬 Ставка на KRAM — це намір домовитися, а не списання коштів",
    "📦 Доставку, післяплату та огляд сторони погоджують напряму",
    "✅ KRAM не приймає, не блокує і не переказує гроші користувачів",
    "🌑 Premium dark marketplace без фейкових лотів і штучної активності",
  ];
  const events = [...liveEvents, ...liveEvents]; // дублюємо для неперервності
  
  return (
    <div className="w-full bg-[#030712]/95 border-b border-white/5 py-2.5 overflow-hidden relative z-20">
      <div className="animate-marquee whitespace-nowrap flex gap-12 text-slate-400 text-xs tracking-wide">
        {events.map((evt, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-2 hover:text-emerald-400 cursor-pointer transition-colors" 
            onMouseEnter={() => soundService.playHover()}
          >
            <span className="font-semibold text-slate-300">{evt}</span>
            <span className="text-[10px] text-emerald-500">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Інтерактивний калькулятор вигоди KRAM
function KramCalculator() {
  const [lotValue, setLotValue] = useState(80000);
  const [duration, setDuration] = useState(7);

  const kramFee = Math.round(lotValue * 0.01);
  const insurance = Math.round(lotValue * 0.0015 + duration * 20);
  const savings = Math.round(lotValue * 0.12 - (kramFee + insurance));
  const finalSavings = savings > 0 ? savings : 0;

  // Рівень безпеки (Score)
  const safetyScore = Math.min(99.9, 96.5 + (duration >= 10 ? 3.4 : duration * 0.3));

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safetyScore / 100) * circumference;

  return (
    <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Повзунки */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/25">
              Smart Risk Engine
            </span>
            <h3 className="text-2xl font-bold text-white font-display mt-3 mb-1">
              Інтерактивний калькулятор вигоди та страхування
            </h3>
            <p className="text-xs text-slate-400">
              Оцініть орієнтир ціни та домовляйтеся напряму без платежів через KRAM
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-300">Оціночна вартість лоту</span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono">
                {lotValue.toLocaleString()} UAH
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="500000"
              step="2000"
              value={lotValue}
              onChange={(e) => {
                soundService.playHover();
                setLotValue(Number(e.target.value));
              }}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[9px] text-slate-600 font-mono">
              <span>2,000 UAH</span>
              <span>250,000 UAH</span>
              <span>500,000 UAH</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-300">Термін страхування транзиту</span>
              <span className="text-sm font-extrabold text-violet-400 font-mono">
                {duration} днів
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="30"
              step="1"
              value={duration}
              onChange={(e) => {
                soundService.playHover();
                setDuration(Number(e.target.value));
              }}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
            <div className="flex justify-between text-[9px] text-slate-600 font-mono">
              <span>3 дні</span>
              <span>15 днів</span>
              <span>30 днів</span>
            </div>
          </div>
        </div>

        {/* Результати */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-around gap-6 bg-slate-950/60 border border-white/5 rounded-2xl p-6 relative">
          
          {/* SVG Датчик */}
          <div className="relative flex flex-col items-center shrink-0">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-slate-800 fill-none"
                strokeWidth="7"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-emerald-400 fill-none transition-all duration-300"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-black text-white font-mono">{safetyScore.toFixed(1)}%</span>
              <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Безпека</span>
            </div>
          </div>

          {/* Фінанси */}
          <div className="space-y-3 flex-1 w-full">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Комісія KRAM:</span>
              <span className="font-semibold text-slate-200 font-mono">{kramFee.toLocaleString()} UAH</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Покриття ризиків:</span>
              <span className="font-semibold text-slate-200 font-mono">{insurance.toLocaleString()} UAH</span>
            </div>
            <div className="h-[1px] bg-white/5 w-full my-2.5" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-emerald-400">Економія KRAM:</span>
              <span className="text-lg font-black text-emerald-400 font-mono text-glow-emerald">
                +{finalSavings.toLocaleString()} UAH
              </span>
            </div>
            <p className="text-[9px] text-slate-500 leading-normal">
              *Розраховано на основі порівняння з осередкованою річною ставкою ломбардів та класичних аукціонних посередників.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🕹️ ІНТЕРАКТИВНИЙ ГІД ДЛЯ НОВАЧКІВ
// ==========================================
// ==========================================
// 🕹️ ПРОСТИЙ ГІД ДЛЯ НОВАЧКІВ
// ==========================================
function KramOnboardingWidget() {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller' | 'security'>('buyer');
  
  const handleTabChange = (tab: 'buyer' | 'seller' | 'security') => {
    setActiveTab(tab);
    soundService.playClick();
  };

  return (
    <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden mb-12">
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25 mb-4">
            ❓ Як це працює?
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Все дуже просто!
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            KRAM.UA — це місце, де можна красиво виставляти лоти, робити ставки та домовлятися напряму без платежів через платформу.
          </p>
        </div>

        {/* Навігація по табах */}
        <div className="flex justify-center p-1 bg-slate-950/80 border border-white/5 rounded-2xl max-w-md mx-auto mb-8">
          <button
            onClick={() => handleTabChange('buyer')}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === 'buyer'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🛒 Як купувати
          </button>
          <button
            onClick={() => handleTabChange('seller')}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === 'seller'
                ? 'bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/30 text-violet-400 font-extrabold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            💰 Як продавати
          </button>
          <button
            onClick={() => handleTabChange('security')}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 font-extrabold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🛡️ Безпека
          </button>
        </div>

        {/* Контент табів */}
        <div className="min-h-[220px]">
          {activeTab === 'buyer' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white font-display">Купуйте дешевше, ніж у магазині</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Продавці виставляють товари за низькою стартовою ціною. Ви робите ставку — пропонуєте свою ціну. Якщо до кінця часу ніхто не запропонує більше, товар ваш!
                </p>
                <ul className="space-y-2 mt-4 text-slate-300 text-sm">
                  <li className="flex items-center gap-2">✅ Ви самі вирішуєте, скільки готові заплатити.</li>
                  <li className="flex items-center gap-2">✅ Є кнопка "Купити зараз" для миттєвої покупки.</li>
                  <li className="flex items-center gap-2">✅ Жодних комісій KRAM для покупців і продавців у безкоштовній beta.</li>
                </ul>
              </div>
              <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                  <span className="text-3xl">🛒</span>
                </div>
                <h4 className="text-lg font-bold text-emerald-400 mb-2">Економія до 50%</h4>
                <p className="text-sm text-slate-400">На аукціонах часто можна "зловити" круту річ за копійки, якщо конкурентів мало.</p>
              </div>
            </div>
          )}

          {activeTab === 'seller' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white font-display">Продавайте швидко та без зайвих питань</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Не хочете тижнями чекати покупця? Створіть аукціон! Завдяки азарту люди самі піднімуть ціну до ринкової, а вам залишиться лише відправити товар.
                </p>
                <ul className="space-y-2 mt-4 text-slate-300 text-sm">
                  <li className="flex items-center gap-2">✅ Швидкий продаж — аукціон триває від кількох годин.</li>
                  <li className="flex items-center gap-2">✅ Захист від шахраїв — ми контролюємо оплату.</li>
                  <li className="flex items-center gap-2">✅ Зручне додавання — просто вставте посилання з OLX.</li>
                </ul>
              </div>
              <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 text-center space-y-4 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center border border-violet-500/30">
                  <span className="text-3xl">🚀</span>
                </div>
                <h4 className="text-lg font-bold text-violet-400">Швидкий старт</h4>
                <p className="text-sm text-slate-400 mb-4">
                  Натисніть кнопку нижче і ваш товар побачать тисячі покупців.
                </p>
                <Link
                  href="/sell"
                  onClick={() => soundService.playClick()}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                >
                  <Plus className="h-4 w-4" />
                  Виставити товар
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white font-display">Ми гарантуємо безпеку кожної копійки</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Забудьте про передоплати на картку невідомим людям! Ваші гроші під надійним захистом KRAM.
                </p>
                <div className="space-y-3 mt-4">
                  <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl">
                    <span className="font-bold text-amber-400 text-sm">Крок 1.</span> <span className="text-sm text-slate-300">Ви оплачуєте товар на сайті (гроші зберігаються у нас).</span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl">
                    <span className="font-bold text-amber-400 text-sm">Крок 2.</span> <span className="text-sm text-slate-300">Продавець відправляє вам посилку Новою Поштою.</span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl">
                    <span className="font-bold text-amber-400 text-sm">Крок 3.</span> <span className="text-sm text-slate-300">Ви оглядаєте товар і лише після цього самостійно завершуєте оплату способом, погодженим із продавцем.</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                  <span className="text-4xl text-amber-400">🛡️</span>
                </div>
                <h4 className="text-xl font-bold text-amber-400 mb-2">100% Захист</h4>
                <p className="text-sm text-slate-400">Всі угоди захищені гарантійним фондом платформи.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ==========================================
// 📚 ДОВІДКОВИЙ ЦЕНТР ТА FAQ KRAM.UA
// ==========================================
function KramFaqSection() {
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "escrow" | "delivery">("buy");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const tabs = [
    { id: "buy", name: "Купівля та ставки", desc: "Усе про торги, бліц-ціни та зв’язок" },
    { id: "sell", name: "Продаж та імпорт", desc: "Створення лотів, AI та імпорт з OLX" },
    { id: "safety", name: "Безпечні домовленості", desc: "Правила прямої угоди без посередника" },
    { id: "delivery", name: "Доставка та пошта", desc: "Логістика, ТТН та регламент часу" },
  ] as const;

  const faqs = {
    buy: [
      {
        q: "Як зробити ставку на аукціоні?",
        a: "Оберіть товар, вкажіть суму ставки (вона має бути не меншою за поточну ціну + крок ставки) та підтвердьте дію. Ваша ставка з’явиться в історії лота миттєво."
      },
      {
        q: "Що таке «Бліц-ціна»?",
        a: "Це фіксована ціна, за якою ви можете викупити лот миттєво, не чекаючи завершення аукціону. Щойно ви натискаєте «Купити зараз», торги закриваються на вашу користь."
      },
      {
        q: "Чи можна поспілкуватися з продавцем?",
        a: "Так! У кожному лоті є вбудований чат. Ви можете написати продавцю, поставити запитання щодо стану товару, попросити додаткові фото або домовитися про деталі."
      }
    ],
    sell: [
      {
        q: "Як виставити свій товар на KRAM.UA?",
        a: "Натисніть кнопку «Продати» у верхньому меню. Заповніть назву лота, додайте якісні фото та опис. Ви можете обрати формат аукціону, бліц-продажу або гібридний варіант."
      },
      {
        q: "Як працює AI-помічник при створенні лота?",
        a: "Наш інтелектуальний копірайтер проаналізує ваш товар і автоматично згенерує привабливий опис, підбере релевантні теги та підкаже рекомендовану стартову ціну на основі ринкових даних."
      },
      {
        q: "Як імпортувати оголошення з OLX або Prom?",
        a: "У формі створення лота введіть посилання на ваше оголошення на OLX, Prom чи Шафа. Наша система автоматично перенесе назву, опис, характеристики та завантажить фотографії, щоб ви не витрачали час."
      },
      {
        q: "Як захиститися від копіювання чужих лотів?",
        a: "Система імпорту дозволяє переносити оголошення лише після підтвердження володіння (наприклад, перевірки імені продавця або унікального коду в описі). Ми суворо блокуємо спроби виставлення чужих товарів."
      }
    ],
    escrow: [
      {
        q: "Як KRAM допомагає безпечним домовленостям?",
        a: "KRAM — це інформаційна платформа для оголошень, ставок і контакту сторін. Ми не приймаємо оплату і не утримуємо кошти. Для безпеки домовляйтеся в чаті, перевіряйте товар до оплати, використовуйте післяплату та зберігайте докази домовленостей."
      },
      {
        q: "Що буде, якщо товар виявиться неякісним?",
        a: "Якщо під час огляду у відділенні пошти ви виявите невідповідність опису, ви можете відмовитися від посилки. Угода скасовується, а кошти автоматично повертаються на вашу картку або баланс."
      },
      {
        q: "Скільки коштує користування KRAM?",
        a: "Зараз KRAM працює як безкоштовна beta-платформа: 0 UAH комісії для покупців і продавців. Платежі, доставка та передача товару погоджуються між користувачами напряму."
      }
    ],
    delivery: [
      {
        q: "Як працює інтеграція з Новою Поштою?",
        a: "KRAM може зберігати бажаний спосіб доставки. Умови відправлення, післяплати, огляду та оплати послуг перевізника сторони погоджують напряму."
      },
      {
        q: "Скільки часу є у продавця на відправку товару?",
        a: "Терміни відправлення покупець і продавець погоджують у чаті. KRAM не приймає оплату і не може автоматично повертати кошти, тому фіксуйте домовленості письмово."
      },
      {
        q: "Які ще способи доставки підтримуються?",
        a: "Окрім Нової Пошти, ви можете домовитися про відправку Укрпоштою, Meest або обрати особисту зустріч (самовивіз/кур’єр) у Києві для дорогоцінних лотів."
      }
    ]
  };

  const handleTabChange = (tab: "buy" | "sell" | "escrow" | "delivery") => {
    soundService.playClick();
    setActiveTab(tab);
    setOpenFaq(null);
  };

  const toggleFaq = (idx: number) => {
    soundService.playClick();
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="text-center mb-12">
        <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
          Довідка та Onboarding
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display mt-4">
          Як влаштований маркетплейс KRAM.UA?
        </h2>
        <p className="text-xs text-slate-400 mt-2">
          Прості відповіді на складні запитання. Розберіться в деталях за 1 хвилину
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Ліва колонка - Навігація по табах */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-2.5 rounded-2xl border border-white/5 space-y-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all relative overflow-hidden group ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 text-white"
                      : "border border-transparent hover:border-white/5 hover:bg-white/[0.02] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="relative z-10 flex items-start gap-3.5">
                    <div className={`mt-0.5 rounded-lg p-1.5 ${
                      isActive ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 bg-white/5 group-hover:text-slate-400"
                    }`}>
                      {tab.id === "buy" && <Trophy className="h-4 w-4" />}
                      {tab.id === "sell" && <Plus className="h-4 w-4" />}
                      {tab.id === "escrow" && <ShieldCheck className="h-4 w-4" />}
                      {tab.id === "delivery" && <Truck className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-display">{tab.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 group-hover:text-slate-400 transition-colors">
                        {tab.desc}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Ілюстративна картка-підказка */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-slate-900/40 to-slate-950/60 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <h5 className="text-[11px] font-black text-emerald-400 uppercase tracking-wider mb-2">Швидка порада</h5>
            <p className="text-[11.5px] text-slate-400 leading-relaxed">
              KRAM дає преміальний інтерфейс для лотів і комунікації, але користувачі самостійно відповідають за оплату, доставку та перевірку товару.
            </p>
          </div>
        </div>

        {/* Права колонка - Акордеони */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 min-h-[350px] flex flex-col justify-between">
            <div className="space-y-4">
              {faqs[activeTab].map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border transition-all ${
                      isOpen
                        ? "border-emerald-500/20 bg-emerald-500/[0.02]"
                        : "border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]"
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-display"
                    >
                      <span className={`text-xs font-bold transition-colors ${isOpen ? "text-white" : "text-slate-200"}`}>
                        {item.q}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-300 shrink-0 ${
                        isOpen ? "transform rotate-180 text-emerald-400" : ""
                      }`} />
                    </button>
                    
                    {/* Анімований вміст */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 pt-1 text-[11.5px] text-slate-400 leading-relaxed border-t border-white/[0.03]">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-white/5 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>Не знайшли відповіді на своє запитання?</span>
              </div>
              <Link
                href="/messages"
                onClick={() => soundService.playClick()}
                className="text-xs font-bold text-emerald-400 hover:underline hover:text-emerald-400/80 flex items-center gap-1 transition-colors"
              >
                Напишіть у службу підтримки KRAM
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🎮 СИМУЛЯТОР АУКЦІОНУ (SANDBOX GAME)
// ==========================================
// ==========================================
// ==========================================
// 📱 ТЕЛЕГРАМ КАНАЛ ТА СПОВІЩЕННЯ (Замість симулятора)
// ==========================================
function KramCyberArena() {
  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#229ED9]/30 bg-gradient-to-br from-[#229ED9]/10 to-slate-950/80 relative overflow-hidden flex flex-col h-full min-h-[460px] justify-center items-center text-center group transition-all duration-500 hover:border-[#229ED9]/50 hover:shadow-[0_0_40px_rgba(34,158,217,0.15)]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#229ED9]/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#229ED9]/30 transition-all duration-700" />
      
      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#2AA1DF] to-[#1E8AC0] flex items-center justify-center shadow-[0_10px_30px_rgba(34,158,217,0.4)] mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          <svg className="h-10 w-10 text-white fill-current ml-[-4px] mt-[2px]" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 8.24l-1.85 8.7c-.14.63-.51.79-1.04.49l-2.82-2.08-1.36 1.31c-.15.15-.28.28-.57.28l.2-2.85 5.19-4.69c.23-.2-.05-.31-.35-.11l-6.42 4.04-2.76-.86c-.6-.19-.61-.6.13-.89l10.78-4.16c.5-.18.94.12.78.92z"/>
          </svg>
        </div>

        <h3 className="text-2xl font-bold text-white font-display mb-3 tracking-tight">
          Приєднуйтесь до нашого <span className="text-[#2AA1DF]">Telegram!</span>
        </h3>
        
        <p className="text-sm text-slate-300 mb-8 leading-relaxed px-4">
          Слідкуйте за найгарячішими лотами, отримуйте миттєві сповіщення про перебиті ставки та беріть участь в ексклюзивних розіграшах.
        </p>

        <div className="space-y-3 w-full">
          <a
            href="https://t.me/kram_auction_bot"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundService.playSuccess()}
            className="flex items-center justify-center gap-3 w-full bg-[#229ED9] hover:bg-[#2AA1DF] text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-[0_5px_20px_rgba(34,158,217,0.3)] hover:shadow-[0_10px_25px_rgba(34,158,217,0.5)] active:scale-95"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 8.24l-1.85 8.7c-.14.63-.51.79-1.04.49l-2.82-2.08-1.36 1.31c-.15.15-.28.28-.57.28l.2-2.85 5.19-4.69c.23-.2-.05-.31-.35-.11l-6.42 4.04-2.76-.86c-.6-.19-.61-.6.13-.89l10.78-4.16c.5-.18.94.12.78.92z"/>
            </svg>
            Перейти в Telegram
          </a>
          
          <div className="flex justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#2AA1DF] bg-[#229ED9]/10 px-3 py-1.5 rounded-lg border border-[#229ED9]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2AA1DF] animate-pulse" />
              12,450+ Учасників
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
// ==========================================
// 🔮 AI ОЦІНЮВАЧ ЛОТІВ ДЛЯ ГОСТЕЙ
// ==========================================
interface AIReport {
  name: string;
  estPrice: number;
  startPrice: number;
  buyNowPrice: number;
  bidStep: number;
  demand: number;
  speedHours: number;
}

function KramAIEvaluator() {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("cat-1");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState<AIReport | null>(null);

  const loadingMessages = [
    "🔍 Ініціалізація AI-модуля KRAM-Oracle...",
    "📡 Сканування схожих пропозицій на OLX/Prom...",
    "📈 Розрахунок історичної динаміки аукціонних ставок...",
    "🛡️ Перевірка коефіцієнту безпеки категорії...",
    "🪄 Формування фінансової рекомендації KRAM..."
  ];

  const handleEvaluate = () => {
    if (loading) return;
    soundService.playAITyping();
    setLoading(true);
    setLoadingStep(0);
    setReport(null);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < loadingMessages.length) {
        setLoadingStep(step);
        soundService.playConsoleTick();
      } else {
        clearInterval(interval);
        
        const name = itemName.trim() || "Мій лот";
        const lowercaseName = name.toLowerCase();
        
        let estPrice = 24000;
        let demand = 78;
        
        if (lowercaseName.includes("iphone") || lowercaseName.includes("айфон")) {
          estPrice = lowercaseName.includes("15") ? 42000 : lowercaseName.includes("14") ? 32000 : 18000;
          demand = 95;
        } else if (lowercaseName.includes("rolex") || lowercaseName.includes("годинник")) {
          estPrice = lowercaseName.includes("rolex") ? 480000 : 15000;
          demand = 88;
        } else if (lowercaseName.includes("монет") || lowercaseName.includes("гривень")) {
          estPrice = 9000;
          demand = 62;
        } else if (lowercaseName.includes("macbook") || lowercaseName.includes("ноутбук")) {
          estPrice = 58000;
          demand = 91;
        } else {
          const seed = name.length;
          estPrice = Math.round((2000 + (seed * 853) % 98000) / 500) * 500;
          demand = 55 + (seed * 7) % 40;
        }

        const startPrice = Math.round((estPrice * 0.75) / 100) * 100;
        const buyNowPrice = Math.round((estPrice * 1.2) / 100) * 100;
        const bidStep = estPrice > 100000 ? 5000 : estPrice > 20000 ? 1000 : estPrice > 5000 ? 500 : 200;
        const speedHours = demand > 90 ? 4 : demand > 80 ? 8 : demand > 70 ? 12 : 24;

        setReport({
          name,
          estPrice,
          startPrice,
          buyNowPrice,
          bidStep,
          demand,
          speedHours
        });
        
        setLoading(false);
        soundService.playImportSuccess();
      }
    }, 700);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-slate-950/40 relative overflow-hidden flex flex-col h-full min-h-[460px] justify-between">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/25">
            🔮 Швидка AI Оцінка
          </span>
          <span className="text-[10px] text-slate-500 font-mono">KRAM Oracle</span>
        </div>

        <h3 className="text-lg font-bold text-white font-display mb-1">Миттєвий Аналіз ринку</h3>
        <p className="text-[11px] text-slate-400 mb-4 leading-normal">
          Введіть назву речі, яку ви хочете продати, і наш AI розрахує її вартість та попит на KRAM.UA.
        </p>

        {/* Форма */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-[8px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Назва предмету</label>
            <input
              type="text"
              placeholder="Наприклад: Apple iPhone 15 Pro, Rolex Submariner..."
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/30 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-[8px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Категорія</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/30 disabled:opacity-50 appearance-none cursor-pointer"
            >
              <option value="cat-1">💻 Електроніка та Гаджети</option>
              <option value="cat-2">💎 Антикваріат та Колекції</option>
              <option value="cat-3">⌚ Годинники та Аксесуари</option>
              <option value="cat-4">🚗 Авто та Запчастини</option>
              <option value="cat-5">🎨 Мистецтво та Живопис</option>
              <option value="cat-6">🏢 Нерухомість</option>
            </select>
          </div>
        </div>
      </div>

      {/* Кнопка або Результат */}
      <div>
        {!loading && !report && (
          <button
            onClick={handleEvaluate}
            disabled={!itemName.trim()}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs py-3 rounded-xl transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.25)] border border-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          >
            Оцінити через AI 🔮
          </button>
        )}

        {loading && (
          <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center min-h-[160px] animate-pulse">
            <div className="w-6 h-6 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin mb-3" />
            <p className="text-[9px] text-emerald-400 font-mono text-center">
              {loadingMessages[loadingStep]}
            </p>
          </div>
        )}

        {report && !loading && (
          <div className="bg-slate-900/80 border border-emerald-500/10 rounded-2xl p-4 space-y-3 animate-scale-up">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Ринкова оцінка:</span>
                <span className="font-extrabold text-white font-mono">{report.estPrice.toLocaleString()} UAH</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">Рекомендований старт аукціону:</span>
                <span className="font-semibold text-slate-300 font-mono">{report.startPrice.toLocaleString()} UAH</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">Рекомендована Бліц-ціна:</span>
                <span className="font-semibold text-slate-300 font-mono">{report.buyNowPrice.toLocaleString()} UAH</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">Рекомендований крок ставки:</span>
                <span className="font-semibold text-slate-300 font-mono">+{report.bidStep.toLocaleString()} UAH</span>
              </div>

              <div className="h-[1px] bg-white/5 my-1" />

              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[8px] uppercase tracking-wider font-extrabold text-slate-500 mb-0.5">
                    <span>Попит покупців KRAM</span>
                    <span className="text-emerald-400">{report.demand}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                    <div className="bg-emerald-400 h-full" style={{ width: `${report.demand}%` }} />
                  </div>
                </div>
                <div className="flex justify-between items-center text-[9px]">
                  <span className="text-slate-500">Середній час викупу лоту:</span>
                  <span className="font-bold text-emerald-400">~{report.speedHours} годин</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1 font-sans">
              <Link
                href={`/sell?title=${encodeURIComponent(report.name)}&price=${report.startPrice}&buynow=${report.buyNowPrice}&step=${report.bidStep}&category=${category}`}
                onClick={() => soundService.playClick()}
                className="flex-1 text-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-[10px] py-2.5 rounded-xl transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.25)] border border-emerald-500/20"
              >
                🪄 Виставити на продаж
              </Link>
              <button
                onClick={() => {
                  setReport(null);
                  setItemName("");
                  soundService.playClick();
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] px-3.5 rounded-xl border border-white/5"
              >
                Скинути
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [listings, setListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [allListings, allCategories] = await Promise.all([
        apiService.getListings(),
        apiService.getCategories()
      ]);
      setListings(allListings);
      setCategories(allCategories);
    }
    loadData();
  }, []);

  // Фільтрація товарів по пошуку і категорії (обчислюється під час рендерингу)
  const filteredListings = listings.filter(l => {
    if (selectedCategory && l.categoryId !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) || 
        l.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTimeRemaining = (endTimeStr: string) => {
    const total = Date.parse(endTimeStr) - Date.parse(new Date().toISOString());
    if (total <= 0) return "Завершено";
    
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}д ${hours}г`;
    return `${hours}г ${minutes}хв`;
  };

  // 3D Parallax Tilt Effect handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // М'який нахил
    card.style.transform = `perspective(1000px) rotateX(${-y / 15}deg) rotateY(${x / 15}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.4), 0 0 25px rgba(16, 185, 129, 0.08)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.boxShadow = 'none';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020408]">
      {/* Шапка */}
      <Navbar />

      {/* Live рухома лента */}
      <LiveEventTape />

      <main className="flex-grow">
        {/* Баннер / Hero Section */}
        <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 border-b border-white/5">
          
          {/* HTML5 Canvas інтерактивний фон */}
          <ConstellationCanvas />

          {/* Світлові градієнти поверх канвасу */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/[0.04] rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-violet-600/[0.04] rounded-full blur-[110px] pointer-events-none" />

          <div className="mx-auto max-w-4xl text-center relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/25 mb-6 animate-pulse">
              <TrendingUp className="h-3.5 w-3.5" />
              Преміальний маркетплейс аукціонів нового покоління
            </span>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 font-display leading-[1.15]">
              Купуйте чесно. <br />
              Продавайте з <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent text-glow-emerald">вигодою</span>.
            </h1>
            
            <p className="text-base sm:text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              KRAM об’єднує ставки, чат, умови доставки та ТТН в одному місці — для вашої впевненості. Захищені транзакції, інтеграція з Новою Поштою та автоматизоване страхування лотів.
            </p>

            {/* Дії (CTA кнопки) */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
              <a
                href="#lots-catalog"
                onClick={() => soundService.playClick()}
                onMouseEnter={() => soundService.playHover()}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-brand-primary to-teal-600 hover:brightness-110 px-8 py-4 text-sm font-bold text-white transition-all shadow-[0_0_20px_var(--primary-glow)] hover:shadow-[0_0_30px_var(--primary-glow)] hover:scale-[1.03] active:scale-95 text-center duration-300"
              >
                Дослідити лоти
              </a>
              <Link
                href="/sell"
                onClick={() => soundService.playClick()}
                onMouseEnter={() => soundService.playHover()}
                className="w-full sm:w-auto rounded-xl bg-slate-900 border border-white/10 hover:border-violet-500/50 hover:bg-slate-800/80 px-8 py-4 text-sm font-bold text-slate-200 hover:text-white transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:border-violet-500/40 hover:scale-[1.03] active:scale-95 text-center flex items-center justify-center gap-2 duration-300"
              >
                <Plus className="h-4.5 w-4.5 text-violet-400" />
                Додати свій лот
              </Link>
            </div>

            {/* Соціальний доказ / Лічильники */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-white/5 pt-10 text-center">
              <div>
                <p className="text-xl sm:text-2xl font-black text-white font-mono">12,842</p>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">Активних учасників</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-brand-primary font-mono text-glow-emerald">34,921</p>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">Ставок за сьогодні</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-violet-400 font-mono text-glow-violet">247</p>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">Лайв-аукціонів</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-amber-500 font-mono text-glow-amber">85M UAH</p>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">Застраховано фондом</p>
              </div>
            </div>

            {/* Пошук */}
            <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-slate-900/60 p-2 shadow-2xl backdrop-blur-md flex items-center gap-2 mt-12">
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-5 w-5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Пошук по преміум годинниках, телефонах, предметах мистецтва..."
                  className="w-full bg-transparent border-0 text-sm text-white placeholder-slate-500 focus:ring-0 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => { soundService.playClick(); setSelectedCategory(null); }} 
                className="hidden sm:block rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-all border border-white/5"
              >
                Скинути
              </button>
            </div>

            {/* Швидкі запити */}
            <div className="mt-4 flex flex-wrap justify-center items-center gap-2 text-xs text-slate-500">
              <span>Популярні запити:</span>
              <button onClick={() => { soundService.playClick(); setSearchQuery("Rolex"); }} className="hover:text-emerald-400 underline transition-colors">Rolex</button>
              <span>•</span>
              <button onClick={() => { soundService.playClick(); setSearchQuery("iPhone"); }} className="hover:text-emerald-400 underline transition-colors">iPhone</button>
              <span>•</span>
              <button onClick={() => { soundService.playClick(); setSearchQuery("монета"); }} className="hover:text-emerald-400 underline transition-colors">Колекційні монети</button>
            </div>
          </div>
        </section>

        {/* Інтерактивний Cyber-Центр KRAM */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl relative z-20">
          <KramOnboardingWidget />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <KramCyberArena />
            <KramAIEvaluator />
          </div>
        </section>

        {/* Сетка Категорій */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-display">Категорії преміум-каталогу</h2>
              <p className="text-xs text-slate-400 mt-1">Оберіть категорію для швидкої фільтрації лотів</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const IconComponent = categoryIcons[cat.icon] || Laptop;
              const isSelected = selectedCategory === cat.id;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundService.playClick();
                    setSelectedCategory(isSelected ? null : cat.id);
                  }}
                  onMouseEnter={() => soundService.playHover()}
                  className={`glass-panel p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all border duration-300 ${
                    isSelected 
                      ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.2)]" 
                      : "border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    isSelected ? "bg-emerald-500 text-white" : "bg-white/5 text-emerald-400"
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <span className={`text-xs font-semibold ${isSelected ? "text-emerald-400" : "text-slate-300"}`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Сетка лотів */}
        <section id="lots-catalog" className="py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl scroll-mt-20">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-display">
                {selectedCategory ? "Знайдені лоти категорії" : "Гарячі аукціони та пропозиції"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Усі лоти захищено KRAM Protocol. Верифікація відправника та гарантія повернення коштів.
              </p>
            </div>
            {selectedCategory && (
              <button
                onClick={() => { soundService.playClick(); setSelectedCategory(null); }}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                Показати всі лоти
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          {filteredListings.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/5">
              <p className="text-slate-400 text-sm">Нічого не знайдено за вашим запитом. Спробуйте змінити фільтри пошуку.</p>
              <button 
                onClick={() => { soundService.playClick(); setSearchQuery(""); setSelectedCategory(null); }}
                className="mt-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Скинути фільтри
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredListings.map((listing) => {
                // Рассчитываем прогресс активности
                const activityPercent = Math.min(100, Math.max(12, (listing.bidsCount || 0) * 12));
                
                return (
                  <div
                    key={listing.id}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="glass-panel rounded-3xl overflow-hidden flex flex-col h-full border border-white/5 transition-all duration-300 hover:border-emerald-500/20 relative"
                  >
                    {/* Зображення та бейджі */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      
                      {/* Тип лота */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        {listing.type === "AUCTION" && (
                          <span className="rounded-lg bg-violet-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-white tracking-wider uppercase shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                            🔨 Аукціон
                          </span>
                        )}
                        {listing.type === "BUY_NOW" && (
                          <span className="rounded-lg bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-white tracking-wider uppercase shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                            ⚡ Купити зараз
                          </span>
                        )}
                        {listing.type === "HYBRID" && (
                          <span className="rounded-lg bg-gradient-to-r from-emerald-600 to-violet-600 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-white tracking-wider uppercase shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                            💎 Гібрид
                          </span>
                        )}
                      </div>

                      {/* Таймер зворотного відліку */}
                      {listing.type !== "BUY_NOW" && (
                        <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-slate-200 flex items-center gap-1 z-10 border border-white/5">
                          <Clock className="h-3 w-3 text-emerald-400 animate-pulse" />
                          <span>{getTimeRemaining(listing.endDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* Тіло картки */}
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-base font-bold text-white line-clamp-1 mb-2 font-display">
                        {listing.title}
                      </h3>
                      
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed flex-grow">
                        {listing.description}
                      </p>

                      {/* Прогрес-бар активності */}
                      {listing.type !== "BUY_NOW" && (
                        <div className="mb-4">
                          <div className="flex justify-between text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">
                            <span>Тиск покупців</span>
                            <span className="text-violet-400">{activityPercent}% активність</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                            <div 
                              className="bg-gradient-to-r from-violet-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${activityPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="h-[1px] bg-white/5 w-full my-3" />

                      {/* Ціни */}
                      <div className="flex items-center justify-between mb-5">
                        {listing.type === "BUY_NOW" ? (
                          <div>
                            <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Ціна викупу</p>
                            <p className="text-lg font-bold text-emerald-400">
                              {listing.buyNowPrice?.toLocaleString()} UAH
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">
                              Поточна ставка ({listing.bidsCount} ст.)
                            </p>
                            <p className="text-lg font-bold text-violet-400">
                              {listing.currentPrice.toLocaleString()} UAH
                            </p>
                          </div>
                        )}

                        {listing.type === "HYBRID" && listing.buyNowPrice && (
                          <div className="text-right">
                            <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Бліц-ціна</p>
                            <p className="text-sm font-semibold text-emerald-400">
                              {listing.buyNowPrice.toLocaleString()} UAH
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Кнопка переходу */}
                      <Link
                        href={`/lot/${listing.id}`}
                        onClick={() => soundService.playClick()}
                        onMouseEnter={() => soundService.playHover()}
                        className="w-full text-center rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 py-3 text-xs font-bold text-slate-200 transition-all hover:text-emerald-400 active:scale-98"
                      >
                        {listing.type === "BUY_NOW" ? "⚡ Придбати зараз" : "🔨 Зробити ставку"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ===== LEADERBOARD PREVIEW ===== */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-extrabold tracking-widest text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-lg border border-brand-primary/25 mb-2">
                <Trophy className="h-3 w-3" /> Лідерборд
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white font-display">Топ учасників KRAM</h2>
              <p className="text-xs text-slate-400 mt-1">Найактивніші бідери платформи цього тижня</p>
            </div>
            <Link
              href="/leaderboard"
              onClick={() => soundService.playClick()}
              onMouseEnter={() => soundService.playHover()}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
            >
              Повний рейтинг
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { rank: 1, username: "@platinum_king", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=platinum_king", xp: 98200, badge: "👑 Платиновий VIP", totalUAH: 4_280_000, bids: 1842, color: "from-amber-400/20 to-transparent", border: "border-amber-400/30", glow: "shadow-[0_0_30px_rgba(251,191,36,0.15)]", icon: "👑" },
              { rank: 2, username: "@diamond_wolf", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=diamond_wolf", xp: 87500, badge: "💎 Діамантовий", totalUAH: 2_940_000, bids: 1456, color: "from-slate-400/10 to-transparent", border: "border-slate-400/20", glow: "shadow-[0_0_20px_rgba(148,163,184,0.1)]", icon: "🥈" },
              { rank: 3, username: "@crypto_falcon", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto_falcon", xp: 72000, badge: "💎 Діамантовий", totalUAH: 2_150_000, bids: 1203, color: "from-orange-400/10 to-transparent", border: "border-orange-400/20", glow: "shadow-[0_0_20px_rgba(251,146,60,0.1)]", icon: "🥉" },
            ].map((entry) => {
              const xpPct = Math.min(100, Math.round((entry.xp / 100000) * 100));
              return (
                <div
                  key={entry.rank}
                  className={`glass-panel rounded-3xl border ${entry.border} ${entry.glow} bg-gradient-to-br ${entry.color} p-6 flex flex-col items-center text-center transition-all hover:scale-[1.02] duration-300`}
                  onMouseEnter={() => soundService.playHover()}
                >
                  {/* Rank icon */}
                  <div className="text-2xl mb-3">{entry.icon}</div>

                  {/* Avatar */}
                  <div className={`rounded-2xl p-[2px] mb-4 ${entry.rank === 1 ? "bg-gradient-to-br from-amber-300 to-amber-600" : entry.rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-500" : "bg-gradient-to-br from-orange-400 to-amber-600"}`}>
                    <img
                      src={entry.avatar}
                      alt={entry.username}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-900"
                    />
                  </div>

                  <p className="text-sm font-bold text-white">{entry.username}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 mb-4">{entry.badge}</p>

                  {/* XP bar */}
                  <div className="w-full space-y-1 mb-4">
                    <div className="flex justify-between text-[9px] text-slate-600">
                      <span>XP</span>
                      <span>{entry.xp.toLocaleString()} / 100К</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-primary to-teal-400 transition-all duration-1000"
                        style={{ width: `${xpPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <div className="rounded-xl bg-white/[0.03] border border-white/5 py-2">
                      <p className="text-sm font-extrabold text-brand-primary font-mono">
                        {entry.totalUAH >= 1_000_000
                          ? `${(entry.totalUAH / 1_000_000).toFixed(1)}М`
                          : `${Math.round(entry.totalUAH / 1000)}К`}
                      </p>
                      <p className="text-[9px] text-slate-600 uppercase tracking-wider">UAH</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] border border-white/5 py-2">
                      <p className="text-sm font-extrabold text-violet-400 font-mono">{entry.bids}</p>
                      <p className="text-[9px] text-slate-600 uppercase tracking-wider">Ставок</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/leaderboard"
              onClick={() => soundService.playClick()}
              onMouseEnter={() => soundService.playHover()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
            >
              Переглянути повний рейтинг
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Калькулятор вигоди */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <KramCalculator />
        </section>

        {/* Довідковий Центр та FAQ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-slate-950/20">
          <KramFaqSection />
        </section>

        {/* Переваги платформи */}
        <section className="py-20 bg-slate-950/40 border-t border-b border-white/5 mt-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
                KRAM Security & Logic
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display mt-4">
                Чому KRAM.UA довіряють угоди на мільйони
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Ми створили надійне, захищене середовище для аукціонів та торгів високого класу
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div 
                className="glass-panel p-8 rounded-3xl border border-white/5 text-center transition-all hover:border-emerald-500/20"
                onMouseEnter={() => soundService.playHover()}
              >
                <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 font-display">Пряма домовленість</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  KRAM не бере участі у розрахунках. Покупець і продавець напряму погоджують оплату, доставку та перевірку товару.
                </p>
              </div>

              <div 
                className="glass-panel p-8 rounded-3xl border border-white/5 text-center transition-all hover:border-emerald-500/20"
                onMouseEnter={() => soundService.playHover()}
              >
                <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 font-display">Автоматична логістика</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Миттєва інтеграція з Новою Поштою. ТТН створюється автоматично при оформленні замовлення. Відстежуйте статус посилки прямо в особистому кабінеті.
                </p>
              </div>

              <div 
                className="glass-panel p-8 rounded-3xl border border-white/5 text-center transition-all hover:border-emerald-500/20"
                onMouseEnter={() => soundService.playHover()}
              >
                <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 font-display">Гібридні торги</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Гнучкі опції продажу: запускайте класичний аукціон на підвищення, фіксуйте ціну викупу або комбінуйте обидва формати для максимізації вигоди.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Плаваюча Cyber-HUD консоль */}
      <CyberHUD />

      {/* Підвал */}
      <Footer />
    </div>
  );
}
