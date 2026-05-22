"use client";

import React, { useState, useEffect } from "react";
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
  Filter
} from "lucide-react";

// Маппинг иконок категорий для Lucide
const categoryIcons: Record<string, React.ComponentType<any>> = {
  Laptop,
  Gem,
  Watch,
  Car,
  Palette,
  Building
};

export default function Home() {
  const [listings, setListings] = useState<MockListing[]>([]);
  const [categories, setCategories] = useState<MockCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredListings, setFilteredListings] = useState<MockListing[]>([]);

  useEffect(() => {
    // Инициализация API
    apiService.initialize();
    setListings(apiService.getListings());
    setCategories(apiService.getCategories());
  }, []);

  // Фильтрация товаров по поиску и категории
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

  // Простой таймер обратного отсчета для отображения "оставшегося времени"
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
      {/* Шапка */}
      <Navbar />

      <main className="flex-grow">
        {/* Баннер / Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5">
          {/* Световые эффекты на фоне */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="mx-auto max-w-4xl text-center relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/25 mb-6 animate-pulse">
              <TrendingUp className="h-3.5 w-3.5" />
              Новый премиальный формат торгов в Украине
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 font-display leading-[1.15]">
              Покупайте дорогое. <br />
              Продавайте по <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent text-glow-emerald">лучшей цене</span>.
            </h1>
            <p className="text-base sm:text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              KRAM.UA соединяет надежность классических объявлений и азарт открытых аукционов. Полная автоматизация Новой Почты и защита сделок.
            </p>

            {/* Live Поиск */}
            <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-slate-900/60 p-2 shadow-2xl backdrop-blur-md flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-5 w-5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Поиск по премиум часам, телефонам, искусству..."
                  className="w-full bg-transparent border-0 text-sm text-white placeholder-slate-500 focus:ring-0 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setSelectedCategory(null)} 
                className="hidden sm:block rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-all border border-white/5"
              >
                Сбросить
              </button>
            </div>

            {/* Быстрые ссылки/поиски */}
            <div className="mt-4 flex flex-wrap justify-center items-center gap-2 text-xs text-slate-500">
              <span>Например:</span>
              <button onClick={() => setSearchQuery("Rolex")} className="hover:text-emerald-400 underline transition-colors">Rolex</button>
              <span>•</span>
              <button onClick={() => setSearchQuery("iPhone")} className="hover:text-emerald-400 underline transition-colors">iPhone</button>
              <span>•</span>
              <button onClick={() => setSearchQuery("монета")} className="hover:text-emerald-400 underline transition-colors">Золотая монета</button>
            </div>
          </div>
        </section>

        {/* Сетка Категорий */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-display">Категории премиум-каталога</h2>
              <p className="text-xs text-slate-400 mt-1">Выберите интересующий сегмент для поиска лотов</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const IconComponent = categoryIcons[cat.icon] || Laptop;
              const isSelected = selectedCategory === cat.id;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className={`glass-panel glass-panel-hover p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all border ${
                    isSelected ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.15)]" : "border-white/5"
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

        {/* Сетка объявлений */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-display">
                {selectedCategory ? "Найденные лоты категории" : "Горящие лоты и аукционы"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Все сделки застрахованы и проходят верификацию перед отправкой
              </p>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                Показать все
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          {filteredListings.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/5">
              <p className="text-slate-400 text-sm">Ничего не найдено по вашему запросу. Попробуйте сменить фильтр или поисковую фразу.</p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
                className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-400 transition-all"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="glass-panel glass-panel-hover rounded-3xl overflow-hidden hover-glow flex flex-col h-full border border-white/5"
                >
                  {/* Изображение с бейджем типа */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    
                    {/* Тип лота */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {listing.type === "AUCTION" && (
                        <span className="rounded-lg bg-violet-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white tracking-wider uppercase shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                          🔨 Аукцион
                        </span>
                      )}
                      {listing.type === "BUY_NOW" && (
                        <span className="rounded-lg bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white tracking-wider uppercase shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                          ⚡ Купить сейчас
                        </span>
                      )}
                      {listing.type === "HYBRID" && (
                        <span className="rounded-lg bg-gradient-to-r from-emerald-600 to-violet-600 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white tracking-wider uppercase shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          💎 Гибрид
                        </span>
                      )}
                    </div>

                    {/* Таймер для аукционов */}
                    {listing.type !== "BUY_NOW" && (
                      <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-slate-200 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-emerald-400" />
                        <span>{getTimeRemaining(listing.endDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Тело карточки */}
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-base font-bold text-white line-clamp-1 mb-2 font-display">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed flex-grow">
                      {listing.description}
                    </p>

                    {/* Разделитель */}
                    <div className="h-[1px] bg-white/5 w-full my-4" />

                    {/* Блок цен */}
                    <div className="flex items-center justify-between mb-5">
                      {listing.type === "BUY_NOW" ? (
                        <div>
                          <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Цена выкупа</p>
                          <p className="text-lg font-bold text-emerald-400">
                            {listing.buyNowPrice?.toLocaleString()} UAH
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">
                            Текущая ставка ({listing.bidsCount} ст.)
                          </p>
                          <p className="text-lg font-bold text-violet-400">
                            {listing.currentPrice.toLocaleString()} UAH
                          </p>
                        </div>
                      )}

                      {listing.type === "HYBRID" && listing.buyNowPrice && (
                        <div className="text-right">
                          <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Блиц-цена</p>
                          <p className="text-sm font-semibold text-emerald-400">
                            {listing.buyNowPrice.toLocaleString()} UAH
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Кнопка перехода */}
                    <Link
                      href={`/lot/${listing.id}`}
                      className="w-full text-center rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 py-3 text-xs font-semibold text-white transition-all hover:text-emerald-400"
                    >
                      {listing.type === "BUY_NOW" ? "Купить" : "Принять участие в торгах"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Преимущества / Trust Section */}
        <section className="py-20 bg-slate-950/50 border-t border-b border-white/5 mt-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
                Почему KRAM.UA доверяют сделки на миллионы
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Мы создали самую защищенную среду для покупки и продажи ценных вещей
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-panel p-8 rounded-3xl border border-white/5 text-center">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Безопасная сделка</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Средства покупателя депонируются на транзитном счете и переводятся продавцу только после успешной проверки и получения товара в отделении почты.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-white/5 text-center">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Автоматическая логистика</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Мгновенная интеграция с Новой Почтой. ТТН создается автоматически при оформлении заказа. Отслеживайте статус посылки прямо в личном кабинете.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-white/5 text-center">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Гибридные торги</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Гибкие опции продажи: запускайте классический аукцион на повышение, фиксируйте цену выкупа или комбинируйте оба формата для максимизации выгоды.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Подвал */}
      <Footer />
    </div>
  );
}
