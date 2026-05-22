"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { apiService } from "@/lib/api-service";
import { MockListing, MockBid, MockMessage, MockTransaction } from "@/lib/db";
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
  AlertTriangle
} from "lucide-react";
import confetti from "canvas-confetti";

export default function LotPage({ params }: { params: Promise<{ id: string }> }) {
  // Раскрываем params с помощью React.use()
  const { id } = use(params);
  const { user, updateBalance } = useAuth();
  
  const [listing, setListing] = useState<MockListing | null>(null);
  const [bids, setBids] = useState<MockBid[]>([]);
  
  // Состояния для ставок
  const [bidAmount, setBidAmount] = useState<string>("");
  
  // Состояния для чата
  const [chatMessage, setChatMessage] = useState("");
  const [chatWarning, setChatWarning] = useState<string | null>(null);

  // Состояния для модалки покупки
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [deliveryProvider, setDeliveryProvider] = useState("NOVA_POSHTA");
  const [novaPoshtaCity, setNovaPoshtaCity] = useState("Киев");
  const [novaPoshtaBranch, setNovaPoshtaBranch] = useState("Отделение №1 (ул. Пирогова, 2)");
  
  // Сделка после покупки
  const [transaction, setTransaction] = useState<MockTransaction | null>(null);

  useEffect(() => {
    apiService.initialize();
    loadListingData();
  }, [id]);

  const loadListingData = () => {
    const item = apiService.getListingById(id);
    if (item) {
      setListing(item);
      setBids(apiService.getBids(id));
      
      // Ищем существующую транзакцию для этого лота
      if (user) {
        const txs = apiService.getTransactions(user.id);
        const existingTx = txs.find(t => t.listingId === id);
        if (existingTx) setTransaction(existingTx);
      }
    }
  };

  if (!listing) {
    return (
      <div className="flex flex-col min-h-screen bg-[#030712] text-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-12">
          <div className="text-center">
            <h2 className="text-xl font-bold font-display">Лот не найден или загружается...</h2>
            <Link href="/" className="text-emerald-400 text-xs mt-4 underline block">Вернуться на главную</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Расчет рекомендуемой минимальной ставки
  const minRecommendedBid = listing.currentPrice + listing.bidStep;

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Пожалуйста, войдите в систему, чтобы сделать ставку!");
      return;
    }
    if (user.id === listing.sellerId) {
      alert("Вы не можете делать ставки на свой собственный лот!");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minRecommendedBid) {
      alert(`Минимальная ставка должна быть не менее ${minRecommendedBid} UAH!`);
      return;
    }

    if (user.balance < amount) {
      alert("Недостаточно средств на балансе для совершения этой ставки!");
      return;
    }

    // Делаем ставку
    const res = apiService.placeBid(listing.id, user.id, user.name, amount);
    if (res.success) {
      // Снимаем баланс (блокируется на аукционе)
      // Настоящие торги обычно блокируют сумму, мы имитируем это
      confetti({
        particleCount: 80,
        spread: 50,
        colors: ["#8b5cf6", "#a78bfa"]
      });
      setBidAmount("");
      loadListingData();
    } else {
      alert(res.error || "Ошибка при размещении ставки");
    }
  };

  const handleBuyNowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (user.id === listing.sellerId) {
      alert("Вы не можете выкупить свой собственный лот!");
      return;
    }
    if (!listing.buyNowPrice) return;
    if (user.balance < listing.buyNowPrice) {
      alert("Недостаточно средств на вашем балансе!");
      return;
    }

    const res = apiService.buyNow(listing.id, user.id, deliveryProvider);
    if (res.success) {
      // Списание баланса
      updateBalance(-listing.buyNowPrice);
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      setShowBuyModal(false);
      loadListingData();
      if (res.transaction) setTransaction(res.transaction);
    } else {
      alert(res.error || "Ошибка покупки лота");
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || chatMessage.trim() === "") return;

    // Отправляем
    const res = apiService.sendMessage(listing.id, user.id, listing.sellerId, chatMessage);
    
    // Если есть предупреждение от робота-модератора
    if (res.warning) {
      setChatWarning(res.warning);
    } else {
      setChatWarning(null);
    }

    setChatMessage("");
    alert("✉️ Ваше сообщение продавцу отправлено! Вы можете просмотреть его в разделе чатов.");
  };

  const getTimeRemaining = (endTimeStr: string) => {
    const total = Date.parse(endTimeStr) - Date.parse(new Date().toISOString());
    if (total <= 0) return "Торги завершены";
    
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}д ${hours}ч ${minutes}м`;
    return `${hours}ч ${minutes}м ${seconds}с`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#030712]">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Кнопка назад */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Назад к объявлениям
        </Link>

        {/* Главный блок лота */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
          
          {/* Галерея изображений лота */}
          <div className="space-y-4">
            <div className="glass-panel aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-white/5 relative">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
              
              {/* Статус завершенности */}
              {listing.status === "COMPLETED" && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="rounded-2xl border border-emerald-500 bg-slate-900/90 p-6 text-center shadow-2xl max-w-xs">
                    <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                    <span className="text-sm font-bold text-white block">Сделка Завершена</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Лот выкуплен покупателем</span>
                  </div>
                </div>
              )}
            </div>
            
            {listing.images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {listing.images.map((img, idx) => (
                  <div key={idx} className="glass-panel aspect-video rounded-2xl overflow-hidden border border-white/5 cursor-pointer hover:border-emerald-500/30 transition-all">
                    <img src={img} alt="Thumbnail" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Параметры лота и управление */}
          <div className="space-y-6">
            
            {/* Название и шапка параметров */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300 tracking-wider uppercase border border-white/10">
                  ID: {listing.id.substring(0, 8)}
                </span>
                
                {listing.type === "AUCTION" && (
                  <span className="rounded-lg bg-violet-600/20 text-violet-400 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border border-violet-500/20">
                    🔨 Открытый Аукцион
                  </span>
                )}
                {listing.type === "BUY_NOW" && (
                  <span className="rounded-lg bg-emerald-600/20 text-emerald-400 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border border-emerald-500/20">
                    ⚡ Купить сейчас
                  </span>
                )}
                {listing.type === "HYBRID" && (
                  <span className="rounded-lg bg-gradient-to-r from-emerald-500/10 to-violet-500/10 text-emerald-400 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border border-emerald-500/20">
                    💎 Гибридный формат
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display leading-tight">{listing.title}</h1>
            </div>

            {/* Финансовый блок лота */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6 shadow-md">
              
              {/* Цены лота */}
              <div className="grid grid-cols-2 gap-4">
                {listing.type !== "BUY_NOW" && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Текущая ставка</span>
                    <p className="text-2xl font-bold text-violet-400 mt-1">{listing.currentPrice.toLocaleString()} UAH</p>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Минимум: {(listing.currentPrice + listing.bidStep).toLocaleString()} UAH</span>
                  </div>
                )}
                
                {listing.type !== "AUCTION" && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                      {listing.type === "HYBRID" ? "Блиц-цена (Выкуп)" : "Цена товара"}
                    </span>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">{listing.buyNowPrice?.toLocaleString()} UAH</p>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Быстрое получение без ожидания торгов</span>
                  </div>
                )}
              </div>

              {/* Таймер для аукциона */}
              {listing.type !== "BUY_NOW" && listing.status === "ACTIVE" && (
                <div className="flex items-center gap-2.5 border-t border-white/5 pt-4">
                  <Clock className="h-4 w-4 text-violet-400" />
                  <span className="text-xs text-slate-400">Времени осталось:</span>
                  <span className="text-xs font-bold text-white">{getTimeRemaining(listing.endDate)}</span>
                </div>
              )}
            </div>

            {/* Блок управления ставками/покупкой */}
            {listing.status === "ACTIVE" && (
              <div className="space-y-4">
                
                {/* 1. Если это Аукцион или Гибрид - сделать ставку */}
                {listing.type !== "BUY_NOW" && (
                  <form onSubmit={handlePlaceBid} className="flex gap-2">
                    <div className="flex-grow relative rounded-xl border border-white/10 bg-slate-950 p-3 flex items-center">
                      <span className="text-xs text-slate-500 mr-1.5">Ставка (UAH):</span>
                      <input
                        type="number"
                        className="bg-transparent border-0 text-sm font-semibold text-white focus:ring-0 focus:outline-none w-full"
                        placeholder={minRecommendedBid.toString()}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={minRecommendedBid}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-violet-600 hover:bg-violet-500 px-6 font-semibold text-xs text-white transition-all shrink-0 flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                    >
                      <Gavel className="h-4 w-4" />
                      Поставить
                    </button>
                  </form>
                )}

                {/* Быстрый выбор ставок для удобства */}
                {listing.type !== "BUY_NOW" && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span>Быстрый шаг:</span>
                    {[
                      minRecommendedBid,
                      minRecommendedBid + listing.bidStep,
                      minRecommendedBid + listing.bidStep * 3
                    ].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setBidAmount(val.toString())}
                        className="rounded bg-white/5 border border-white/10 hover:border-violet-500/30 hover:text-violet-400 px-2 py-1 transition-colors"
                      >
                        +{val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. Если это Гибрид или Купить сейчас - выкуп */}
                {listing.type !== "AUCTION" && (
                  <button
                    onClick={() => setShowBuyModal(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 py-3.5 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-400/20"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Купить по Безопасной Сделке ({listing.buyNowPrice?.toLocaleString()} UAH)
                  </button>
                )}

              </div>
            )}

            {/* Блок Безопасной Сделки */}
            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4 text-[11px] text-slate-400 flex items-start gap-2.5 leading-relaxed">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Безопасная сделка KRAM:</strong> Мы задержим деньги покупателя до момента получения посылки в почтовом отделении Новой Почты. Если с товаром будет что-то не так — мы вернем всю сумму обратно на баланс покупателя.
              </span>
            </div>

          </div>

        </div>

        {/* Сделка оформлена: Выводим трекер Новой Почты! */}
        {transaction && (
          <section className="glass-panel p-8 rounded-3xl border border-emerald-500/25 bg-slate-950/60 mb-12 shadow-xl">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2 font-display">
              <Truck className="h-5 w-5 text-emerald-400" />
              Логистика и доставка (Новая Почта)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              
              {/* Шаг 1: Оформлено */}
              <div className="flex flex-col items-center text-center p-3 border-r border-white/5 last:border-0">
                <CheckCircle className="h-6 w-6 text-emerald-400 mb-2" />
                <span className="text-xs font-semibold text-white">Сделка оформлена</span>
                <span className="text-[10px] text-slate-500 mt-1">Оплата зарезервирована</span>
              </div>
              
              {/* Шаг 2: ТТН Сгенерирован */}
              <div className="flex flex-col items-center text-center p-3 border-r border-white/5 last:border-0">
                <CheckCircle className="h-6 w-6 text-emerald-400 mb-2" />
                <span className="text-xs font-semibold text-white">ТТН Сгенерирована</span>
                <span className="text-[10px] text-emerald-400 font-medium mt-1 select-all">{transaction.ttn}</span>
              </div>

              {/* Шаг 3: В пути */}
              <div className="flex flex-col items-center text-center p-3 border-r border-white/5 last:border-0">
                <Clock className="h-6 w-6 text-amber-400 mb-2 animate-pulse" />
                <span className="text-xs font-semibold text-slate-200">Ожидает отправки</span>
                <span className="text-[10px] text-slate-500 mt-1">Передается в отделение</span>
              </div>

              {/* Шаг 4: Получен */}
              <div className="flex flex-col items-center text-center p-3">
                <Clock className="h-6 w-6 text-slate-600 mb-2" />
                <span className="text-xs font-semibold text-slate-500">Доставлено покупателю</span>
                <span className="text-[10px] text-slate-600 mt-1">Ждет осмотра</span>
              </div>

            </div>

            <div className="mt-6 text-center text-xs text-slate-400 border-t border-white/5 pt-4">
              📦 <strong>Для продавца:</strong> Распечатайте бланк с ТТН <strong>{transaction.ttn}</strong> и отправьте посылку в любом отделении Новой Почты.
            </div>
          </section>
        )}

        {/* Дополнительные вкладки (Описание / История ставок / Чат с продавцом) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Описание лота */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white font-display">Описание и характеристики</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
            
            <div className="border-t border-white/5 pt-4 space-y-2">
              <span className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider block">Условия доставки:</span>
              <div className="flex flex-wrap gap-2">
                {JSON.parse(JSON.stringify(listing.deliveryOptions)).map((opt: string) => (
                  <span key={opt} className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] text-slate-300 border border-white/10">
                    {opt === "NOVA_POSHTA" && "📦 Новая Почта"}
                    {opt === "UKR_POSHTA" && "📬 Укрпочта Экспресс"}
                    {opt === "MEEST" && "⚡ Meest Пошта"}
                    {opt === "COURIER" && "📍 Курьер / Самовывоз Киев"}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Правая колонка: Чат и Ставки */}
          <div className="space-y-6">
            
            {/* История ставок (для аукционов) */}
            {listing.type !== "BUY_NOW" && (
              <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-base font-bold text-white font-display flex items-center justify-between">
                  <span>История торгов</span>
                  <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                    Всего {bids.length}
                  </span>
                </h3>

                <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                  {bids.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-500">Ставок еще нет. Будьте первым!</p>
                  ) : (
                    bids.map((b) => (
                      <div key={b.id} className="flex justify-between items-center rounded-xl bg-white/[0.02] p-2.5 text-xs border border-white/5 hover:border-violet-500/10 transition-colors">
                        <div>
                          <span className="font-semibold text-slate-200 block">{b.bidderName}</span>
                          <span className="text-[9px] text-slate-500">
                            {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="font-bold text-violet-400">{b.amount.toLocaleString()} UAH</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Чат с продавцом */}
            {user && user.id !== listing.sellerId && (
              <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-base font-bold text-white font-display flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  Спросить продавца
                </h3>
                
                {chatWarning && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-3 text-[10px] text-amber-300 leading-normal flex items-start gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{chatWarning}</span>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Напишите вопрос по лоту (например: Возможен ли самовывоз в Киеве?)..."
                    className="w-full glass-input rounded-xl text-xs p-3 leading-relaxed"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    required
                  />
                  
                  <div className="text-[9px] text-slate-500">
                    ⚠️ Сообщения проходят проверку. Не пишите номера телефонов и мессенджеры.
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700 hover:text-white py-2.5 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Отправить вопрос
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* МОДАЛЬНОЕ ОКНО ПОКУПКИ (БЕЗОПАСНАЯ СДЕЛКА) */}
      {showBuyModal && listing.buyNowPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl animate-scaleUp">
            
            <h3 className="text-lg font-bold text-white mb-2 font-display">Оформление Безопасной Сделки</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Вы покупаете лот <strong>{listing.title}</strong> по фиксированной блиц-цене с удержанием оплаты на балансе KRAM.
            </p>

            <form onSubmit={handleBuyNowSubmit} className="space-y-4">
              
              {/* Почтовая служба */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Почтовая служба</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryProvider("NOVA_POSHTA")}
                    className={`text-xs p-3 rounded-xl border text-center transition-colors ${
                      deliveryProvider === "NOVA_POSHTA"
                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-400 font-semibold"
                        : "border-white/5 bg-slate-950 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    📦 Новая Почта
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryProvider("UKR_POSHTA")}
                    className={`text-xs p-3 rounded-xl border text-center transition-colors ${
                      deliveryProvider === "UKR_POSHTA"
                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-400 font-semibold"
                        : "border-white/5 bg-slate-950 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    📬 Укрпочта
                  </button>
                </div>
              </div>

              {/* Город */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Город доставки</label>
                <input
                  type="text"
                  className="w-full glass-input rounded-xl text-xs p-3"
                  value={novaPoshtaCity}
                  onChange={(e) => setNovaPoshtaCity(e.target.value)}
                  required
                />
              </div>

              {/* Отделение */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Отделение почты</label>
                <input
                  type="text"
                  className="w-full glass-input rounded-xl text-xs p-3"
                  value={novaPoshtaBranch}
                  onChange={(e) => setNovaPoshtaBranch(e.target.value)}
                  required
                />
              </div>

              {/* Итог */}
              <div className="rounded-2xl border border-white/5 bg-slate-950 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Сумма товара:</span>
                  <span className="text-white font-semibold">{listing.buyNowPrice.toLocaleString()} UAH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Комиссия сделки:</span>
                  <span className="text-emerald-400 font-semibold">0 UAH (Акция)</span>
                </div>
                <div className="h-[1px] bg-white/5 my-2" />
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-white">К оплате с баланса:</span>
                  <span className="text-emerald-400">{listing.buyNowPrice.toLocaleString()} UAH</span>
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBuyModal(false)}
                  className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  Оплатить {listing.buyNowPrice.toLocaleString()} UAH
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
