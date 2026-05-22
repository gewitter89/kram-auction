"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiService } from "@/lib/api-service";
import { MockListing, MockCategory } from "@/lib/db";
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
  Filter,
  Plus,
  Users,
  Percent,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { soundService } from "@/lib/sound-service";

// Маппінг іконок категорій для Lucide
const categoryIcons: Record<string, React.ComponentType<any>> = {
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

    let mouse = { x: -1000, y: -1000 };

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
        ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
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
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.12 * (1 - dist / 110)})`;
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

// Рухома стрічка подій KRAM Live
function LiveEventTape() {
  const liveEvents = [
    "⚡ Користувач @v***d зробив ставку 45,000 UAH на Rolex Submariner",
    "🛡️ Безпечна угода KRAM: лот #8392 застраховано на 120,000 UAH",
    "🎉 Лот 'MacBook Pro M3 Max' успішно продано за 98,000 UAH",
    "🔥 Активність: 14 ставок за останню хвилину в категорії 'Електроніка'",
    "📦 Нова Пошта: Згенеровано автоматичну ТТН для відправки лоту #2938",
    "💎 Система: Новий продавець @premium_art пройшов верифікацію",
    "🚀 WAF статус: Система під надійним захистом, 0 активних загроз",
    "💰 Гарантійний фонд платформи збільшено до 5,000,000 UAH",
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
              Розрахуйте витрати на страхування транзиту та порівняйте з комісіями класичних посередників
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

export default function Home() {
  const [listings, setListings] = useState<MockListing[]>([]);
  const [categories, setCategories] = useState<MockCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredListings, setFilteredListings] = useState<MockListing[]>([]);

  useEffect(() => {
    apiService.initialize();
    setListings(apiService.getListings());
    setCategories(apiService.getCategories());
  }, []);

  // Фільтрація товарів по пошуку і категорії
  useEffect(() => {
    let result = listings;
    
    if (selectedCategory) {
      result = result.filter(l => l.categoryId === selectedCategory);
    }
    
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.title.toLowerCase().includes(q) || 
        l.description.toLowerCase().includes(q)
      );
    }
    
    setFilteredListings(result);
  }, [searchQuery, selectedCategory, listings]);

  const getTimeRemaining = (endTimeStr: string) => {
    const total = Date.parse(endTimeStr) - Date.parse(new Date().toISOString());
    if (total <= 0) return "Завершено";
    
    const seconds = Math.floor((total / 1000) % 60);
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
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 px-8 py-4 text-sm font-bold text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 text-center"
              >
                Дослідити лоти
              </a>
              <Link
                href="/sell"
                onClick={() => soundService.playClick()}
                onMouseEnter={() => soundService.playHover()}
                className="w-full sm:w-auto rounded-xl bg-slate-900 border border-white/10 hover:border-violet-500/50 hover:bg-slate-800/80 px-8 py-4 text-sm font-bold text-slate-200 hover:text-white transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95 text-center flex items-center justify-center gap-2"
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
                <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono text-glow-emerald">34,921</p>
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

        {/* Калькулятор вигоди */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <KramCalculator />
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
                <h3 className="text-base font-bold text-white mb-2 font-display">Безпечна угода</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Кошти покупця депонуються на транзитному рахунку і перераховуються продавцю тільки після успішної перевірки та отримання товару у відділенні пошти.
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

      {/* Підвал */}
      <Footer />
    </div>
  );
}
