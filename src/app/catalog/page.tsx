"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiService } from "@/lib/api-service";
import { MockListing, MockCategory } from "@/lib/db";
import Link from "next/link";
import { 
  Search, 
  Clock, 
  SlidersHorizontal, 
  RotateCcw,
  Plus
} from "lucide-react";

export default function Catalog() {
  const [listings, setListings] = useState<MockListing[]>([]);
  const [categories, setCategories] = useState<MockCategory[]>([]);
  
  // Состояния фильтрации
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [dealType, setDealType] = useState<string>("ALL"); // ALL, AUCTION, BUY_NOW, HYBRID
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("NEWEST"); // NEWEST, CHEAPEST, EXPENSIVE, BIDS_COUNT

  const [filteredListings, setFilteredListings] = useState<MockListing[]>([]);

  useEffect(() => {
    apiService.initialize();
    setListings(apiService.getListings());
    setCategories(apiService.getCategories());
  }, []);

  // Фильтр-эффект
  useEffect(() => {
    let result = [...listings];

    // Поиск
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.title.toLowerCase().includes(q) || 
        l.description.toLowerCase().includes(q)
      );
    }

    // Категория
    if (selectedCategory !== "") {
      result = result.filter(l => l.categoryId === selectedCategory);
    }

    // Тип сделки
    if (dealType !== "ALL") {
      result = result.filter(l => l.type === dealType);
    }

    // Минимальная цена
    if (minPrice !== "") {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        result = result.filter(l => {
          const price = l.type === "BUY_NOW" ? (l.buyNowPrice || 0) : l.currentPrice;
          return price >= min;
        });
      }
    }

    // Максимальная цена
    if (maxPrice !== "") {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        result = result.filter(l => {
          const price = l.type === "BUY_NOW" ? (l.buyNowPrice || 0) : l.currentPrice;
          return price <= max;
        });
      }
    }

    // Сортировка
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

    setFilteredListings(result);
  }, [searchQuery, selectedCategory, dealType, minPrice, maxPrice, sortBy, listings]);

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
    if (total <= 0) return "Завершен";
    
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}д ${hours}ч`;
    return `${hours}ч ${minutes}м`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#030712]">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Шапка каталога */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white font-display">Каталог товаров</h1>
            <p className="text-xs text-slate-400 mt-1">
              Найдено {filteredListings.length} лотов для безопасной сделки
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glass-input rounded-xl text-xs px-4 py-2.5 bg-slate-900 border border-white/10 text-slate-300 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="NEWEST">Сначала новые</option>
              <option value="CHEAPEST">Дешевые сначала</option>
              <option value="EXPENSIVE">Дорогие сначала</option>
              <option value="BIDS_COUNT">По количеству ставок</option>
            </select>
            
            <Link
              href="/sell"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all"
            >
              <Plus className="h-4 w-4" />
              Продать лот
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Боковой фильтр (Sidebar) */}
          <aside className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
                Фильтры
              </span>
              <button
                onClick={resetFilters}
                className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Сбросить
              </button>
            </div>

            {/* Поиск */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Поиск</label>
              <div className="relative rounded-xl border border-white/10 bg-slate-950 p-2 flex items-center gap-1.5">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Введите ключевые слова..."
                  className="bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:ring-0 focus:outline-none w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Категории */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Категория</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full glass-input rounded-xl text-xs px-3 py-2.5 bg-slate-950 text-slate-300"
              >
                <option value="">Все категории</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Формат продажи */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Тип сделки</label>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { value: "ALL", label: "Все лоты" },
                  { value: "AUCTION", label: "🔨 Аукционы" },
                  { value: "BUY_NOW", label: "⚡ Купить сейчас" },
                  { value: "HYBRID", label: "💎 Гибридный формат" }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setDealType(type.value)}
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

            {/* Фильтр цен */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Диапазон цены (UAH)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="От"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="glass-input rounded-xl text-xs px-3 py-2.5 bg-slate-950 text-white text-center"
                />
                <input
                  type="number"
                  placeholder="До"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="glass-input rounded-xl text-xs px-3 py-2.5 bg-slate-950 text-white text-center"
                />
              </div>
            </div>

          </aside>

          {/* Сетка товаров (Listings Grid) */}
          <div className="lg:col-span-3">
            {filteredListings.length === 0 ? (
              <div className="glass-panel rounded-3xl p-16 text-center border border-white/5">
                <p className="text-slate-400 text-sm">Не найдено лотов, соответствующих выбранным фильтрам.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700 px-4 py-2 text-xs text-white transition-all"
                >
                  Сбросить все фильтры
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="glass-panel glass-panel-hover rounded-3xl overflow-hidden hover-glow flex flex-col h-full border border-white/5"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      
                      {/* Бейдж типа */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {listing.type === "AUCTION" && (
                          <span className="rounded-lg bg-violet-600/90 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white tracking-wider uppercase">
                            🔨 Аукцион
                          </span>
                        )}
                        {listing.type === "BUY_NOW" && (
                          <span className="rounded-lg bg-emerald-600/90 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white tracking-wider uppercase">
                            ⚡ Купить сейчас
                          </span>
                        )}
                        {listing.type === "HYBRID" && (
                          <span className="rounded-lg bg-gradient-to-r from-emerald-600 to-violet-600 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white tracking-wider uppercase">
                            💎 Гибрид
                          </span>
                        )}
                      </div>

                      {/* Время */}
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
                            <p className="text-[9px] uppercase text-slate-500 font-semibold tracking-wider">Цена выкупа</p>
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
                            <p className="text-[9px] uppercase text-slate-500 font-semibold tracking-wider">Блиц-цена</p>
                            <p className="text-xs font-semibold text-emerald-400">
                              {listing.buyNowPrice.toLocaleString()} UAH
                            </p>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/lot/${listing.id}`}
                        className="w-full text-center rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 py-2.5 text-xs font-semibold text-white transition-all hover:text-emerald-400"
                      >
                        Детали лота
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
