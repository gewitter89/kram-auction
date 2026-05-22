"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiService } from "@/lib/api-service";
import Link from "next/link";
import { 
  Search, 
  Clock, 
  SlidersHorizontal, 
  RotateCcw,
  Plus
} from "lucide-react";
import { soundService } from "@/lib/sound-service";
import { Category, Listing } from "@prisma/client";


export default function Catalog() {
  const [listings, setListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Стани фільтрації
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [dealType, setDealType] = useState<string>("ALL"); // ALL, AUCTION, BUY_NOW, HYBRID
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("NEWEST"); // NEWEST, CHEAPEST, EXPENSIVE, BIDS_COUNT

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [allListings, allCategories] = await Promise.all([
          apiService.getListings(),
          apiService.getCategories()
        ]);
        setListings(allListings);
        setCategories(allCategories);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Фільтрація товарів (обчислюється під час рендерингу)
  const filteredListings = (() => {
    let result = [...listings];

    // Пошук
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.title.toLowerCase().includes(q) || 
        l.description.toLowerCase().includes(q)
      );
    }

    // Категорія
    if (selectedCategory !== "") {
      result = result.filter(l => l.categoryId === selectedCategory);
    }

    // Тип угоди
    if (dealType !== "ALL") {
      result = result.filter(l => l.type === dealType);
    }

    // Мінімальна ціна
    if (minPrice !== "") {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        result = result.filter(l => {
          const price = l.type === "BUY_NOW" ? (l.buyNowPrice || 0) : l.currentPrice;
          return price >= min;
        });
      }
    }

    // Максимальна ціна
    if (maxPrice !== "") {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        result = result.filter(l => {
          const price = l.type === "BUY_NOW" ? (l.buyNowPrice || 0) : l.currentPrice;
          return price <= max;
        });
      }
    }

    // Сортування
    if (sortBy === "NEWEST") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "CHEAPEST") {
      result.sort((a, b) => {
        const priceA = a.type === "BUY_NOW" ? (a.buyNowPrice || 0) : a.currentPrice;
        const priceB = b.type === "BUY_NOW" ? (b.buyNowPrice || 0) : b.currentPrice;
        return priceA - priceB;
      });
    } else if (sortBy === "EXPENSIVE") {
      result.sort((a, b) => {
        const priceA = a.type === "BUY_NOW" ? (a.buyNowPrice || 0) : a.currentPrice;
        const priceB = b.type === "BUY_NOW" ? (b.buyNowPrice || 0) : b.currentPrice;
        return priceB - priceA;
      });
    } else if (sortBy === "BIDS_COUNT") {
      result.sort((a, b) => b.bidsCount - a.bidsCount);
    }

    return result;
  })();

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setDealType("ALL");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("NEWEST");
  };

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
    <div className="flex flex-col min-h-screen bg-[#030712]">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Шапка каталогу */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white font-display">Каталог лотів</h1>
            <p className="text-xs text-slate-400 mt-1">
              Знайдено {filteredListings.length} лотів для безпечної угоди
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => {
                soundService.playClick();
                setSortBy(e.target.value);
              }}
              onMouseEnter={() => soundService.playHover()}
              className="glass-input rounded-xl text-xs px-4 py-2.5 bg-slate-900 border border-white/10 text-slate-300 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="NEWEST">Спочатку нові</option>
              <option value="CHEAPEST">Спочатку дешевші</option>
              <option value="EXPENSIVE">Спочатку дорожчі</option>
              <option value="BIDS_COUNT">За кількістю ставок</option>
            </select>
            
            <Link
              href="/sell"
              onMouseEnter={() => soundService.playHover()}
              onClick={() => soundService.playClick()}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all"
            >
              <Plus className="h-4 w-4" />
              Продати лот
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Бічний фільтр (Sidebar) */}
          <aside className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
                Фільтри
              </span>
              <button
                onClick={() => {
                  soundService.playClick();
                  resetFilters();
                }}
                onMouseEnter={() => soundService.playHover()}
                className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Скинути
              </button>
            </div>

            {/* Пошук */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Пошук</label>
              <div className="relative rounded-xl border border-white/10 bg-slate-950 p-2 flex items-center gap-1.5">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Введіть ключові слова..."
                  className="bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:ring-0 focus:outline-none w-full"
                  value={searchQuery}
                  onChange={(e) => {
                    soundService.playHover();
                    setSearchQuery(e.target.value);
                  }}
                />
              </div>
            </div>

            {/* Категорії */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Категорія</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  soundService.playClick();
                  setSelectedCategory(e.target.value);
                }}
                onMouseEnter={() => soundService.playHover()}
                className="w-full glass-input rounded-xl text-xs px-3 py-2.5 bg-slate-950 text-slate-300"
              >
                <option value="">Всі категорії</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Формат продажу */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Тип угоди</label>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { value: "ALL", label: "Всі лоти" },
                  { value: "AUCTION", label: "🔨 Аукціони" },
                  { value: "BUY_NOW", label: "⚡ Купити зараз" },
                  { value: "HYBRID", label: "💎 Гібридний формат" }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      soundService.playClick();
                      setDealType(type.value);
                    }}
                    onMouseEnter={() => soundService.playHover()}
                    className={`text-left text-xs px-3 py-2 rounded-xl border transition-all ${
                      dealType === type.value
                        ? "border-emerald-500/50 bg-emerald-500/10 text-white font-medium"
                        : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Фільтр цін */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Діапазон цін (UAH)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Від"
                  value={minPrice}
                  onChange={(e) => {
                    soundService.playHover();
                    setMinPrice(e.target.value);
                  }}
                  className="glass-input rounded-xl text-xs px-3 py-2.5 bg-slate-950 text-white text-center"
                />
                <input
                  type="number"
                  placeholder="До"
                  value={maxPrice}
                  onChange={(e) => {
                    soundService.playHover();
                    setMaxPrice(e.target.value);
                  }}
                  className="glass-input rounded-xl text-xs px-3 py-2.5 bg-slate-950 text-white text-center"
                />
              </div>
            </div>

          </aside>

          {/* Сітка товарів (Listings Grid) */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="glass-panel rounded-3xl p-16 text-center border border-white/5 flex flex-col items-center justify-center">
                <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 text-sm font-display">Завантаження лотів...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="glass-panel rounded-3xl p-16 text-center border border-white/5 flex flex-col items-center justify-center">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-bold text-white mb-2 font-display">Каталог порожній</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-sm">Наразі немає активних лотів. Станьте першим, хто виставить свій товар на продаж!</p>
                <Link
                  href="/sell"
                  onMouseEnter={() => soundService.playHover()}
                  onClick={() => soundService.playClick()}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3 text-sm font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Створити перший лот
                </Link>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="glass-panel rounded-3xl p-16 text-center border border-white/5">
                <p className="text-slate-400 text-sm">Не знайдено лотів, що відповідають обраним фільтрам.</p>
                <button
                  onClick={() => {
                    soundService.playClick();
                    resetFilters();
                  }}
                  onMouseEnter={() => soundService.playHover()}
                  className="mt-4 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700 px-4 py-2 text-xs text-white transition-all"
                >
                  Скинути всі фільтри
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <div
                    key={listing.id}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={() => soundService.playHover()}
                    className="glass-panel glass-panel-hover rounded-3xl overflow-hidden hover-glow flex flex-col h-full border border-white/5 transition-all duration-300"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      
                      {/* Бейдж типу */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {listing.type === "AUCTION" && (
                          <span className="rounded-lg bg-violet-600/90 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white tracking-wider uppercase">
                            🔨 Аукціон
                          </span>
                        )}
                        {listing.type === "BUY_NOW" && (
                          <span className="rounded-lg bg-emerald-600/90 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white tracking-wider uppercase">
                            ⚡ Купити зараз
                          </span>
                        )}
                        {listing.type === "HYBRID" && (
                          <span className="rounded-lg bg-gradient-to-r from-emerald-600 to-violet-600 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white tracking-wider uppercase">
                            💎 Гібрид
                          </span>
                        )}
                      </div>

                      {/* Час */}
                      {listing.type !== "BUY_NOW" && (
                        <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-semibold text-slate-200 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-emerald-400" />
                          <span>{getTimeRemaining(listing.endDate)}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-grow flex flex-col">
                      <h3 className="text-sm font-bold text-white line-clamp-1 mb-2 font-display">
                        {listing.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-4 leading-relaxed flex-grow">
                        {listing.description}
                      </p>

                      <div className="h-[1px] bg-white/5 w-full my-3" />

                      <div className="flex items-center justify-between mb-4">
                        {listing.type === "BUY_NOW" ? (
                          <div>
                            <p className="text-[9px] uppercase text-slate-500 font-semibold tracking-wider">Ціна викупу</p>
                            <p className="text-base font-bold text-emerald-400">
                              {listing.buyNowPrice?.toLocaleString()} UAH
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-[9px] uppercase text-slate-500 font-semibold tracking-wider">
                              Ставка ({listing.bidsCount} ст.)
                            </p>
                            <p className="text-base font-bold text-violet-400">
                              {listing.currentPrice.toLocaleString()} UAH
                            </p>
                          </div>
                        )}

                        {listing.type === "HYBRID" && listing.buyNowPrice && (
                          <div className="text-right">
                            <p className="text-[9px] uppercase text-slate-500 font-semibold tracking-wider">Бліц-ціна</p>
                            <p className="text-xs font-semibold text-emerald-400">
                              {listing.buyNowPrice.toLocaleString()} UAH
                            </p>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/lot/${listing.id}`}
                        onMouseEnter={() => soundService.playHover()}
                        onClick={() => soundService.playClick()}
                        className="w-full text-center rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 py-2.5 text-xs font-semibold text-white transition-all hover:text-emerald-400"
                      >
                        Деталі лота
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
