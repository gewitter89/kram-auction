"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { apiService } from "@/lib/api-service";
import { MockListing, MockTransaction } from "@/lib/db";
import { 
  TrendingUp, 
  Gavel, 
  DollarSign, 
  Award, 
  CheckCircle, 
  Plus,
  Activity,
  UserCheck,
  Zap
} from "lucide-react";
import { soundService } from "@/lib/sound-service";

export default function DashboardPage() {
  const { user, login, updateBalance } = useAuth();
  const [listings, setListings] = useState<MockListing[]>([]);
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);

  // Состояния для верификации
  const [verificationStep, setVerificationStep] = useState(2); // 2 из 4 пройдено
  const [boostingStatus, setBoostingStatus] = useState<string | null>(null);

  useEffect(() => {
    apiService.initialize();
    if (user) {
      // Загружаем лоты текущего продавца
      const allListings = apiService.getListings();
      const myListings = allListings.filter(l => l.sellerId === user.id);
      
      // Загружаем транзакции
      const myTxs = apiService.getTransactions(user.id);

      Promise.resolve().then(() => {
        setListings(myListings);
        setTransactions(myTxs);
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-[#020408] text-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-12">
          <div className="text-center space-y-4 max-w-sm glass-panel p-8 rounded-3xl border border-white/5">
            <UserCheck className="h-10 w-10 text-emerald-400 mx-auto animate-pulse" />
            <h2 className="text-xl font-bold font-display">Увійдіть в особистий кабінет</h2>
            <p className="text-xs text-slate-400">Панель продавця доступна тільки зареєстрованим дилерам та користувачам.</p>
            <button
              onClick={() => {
                soundService.playClick();
                login("demo-seller@kram.ua");
              }}
              onMouseEnter={() => soundService.playHover()}
              className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
            >
              Увійти як Продавець
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Розрахунок статистики
  const totalRevenue = transactions
    .filter(t => t.sellerId === user.id && t.paymentStatus === "PAID")
    .reduce((sum, t) => sum + t.amount, 0);

  const activeAuctionsCount = listings.filter(l => l.status === "ACTIVE" && l.type !== "BUY_NOW").length;
  const soldCount = listings.filter(l => l.status === "COMPLETED").length;

  const boostListing = (listingId: string) => {
    setBoostingStatus(listingId);
    setTimeout(() => {
      setBoostingStatus(null);
      alert("🚀 Лот успішно піднято в топ пошуку! Накладено рекламне неонове світіння.");
    }, 1200);
  };

  const addFakeFunds = () => {
    updateBalance(50000);
    alert("💳 Тестовий баланс поповнено на 50,000 UAH!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020408] bg-grid-pattern relative">
      <Navbar />

      {/* Floating Light Beacons */}
      <div className="absolute top-[10%] left-[5%] w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none animate-ambient-slow" />
      <div className="absolute bottom-[20%] right-[5%] w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[130px] pointer-events-none animate-ambient-slow" />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Заголовок */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white font-display tracking-tight leading-none">Панель аналітики продавця</h1>
            <p className="text-xs text-slate-400 mt-1.5">Керуйте угодами, відстежуйте прибуток та стежте за логістикою посилок.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                soundService.playClick();
                addFakeFunds();
              }}
              onMouseEnter={() => soundService.playHover()}
              className="rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-bold text-slate-200 px-4 py-2.5 transition-all flex items-center gap-1.5"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              Тест: +50k UAH
            </button>
            <Link
              href="/sell"
              onMouseEnter={() => soundService.playHover()}
              onClick={() => soundService.playClick()}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-xs font-bold text-white px-4 py-2.5 transition-all shadow-lg shadow-emerald-500/15 flex items-center gap-1.5 border border-emerald-400/20"
            >
              <Plus className="h-4 w-4" />
              Створити лот
            </Link>
          </div>
        </div>

        {/* Сетка Ключевых Метрик */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Баланс */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-lg pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Поточний баланс</span>
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-white font-display">{user.balance.toLocaleString()} UAH</p>
              <span className="text-[9px] text-slate-500 block mt-1">Доступно для миттєвого виведення</span>
            </div>
          </div>

          {/* Доход с Escrow */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-violet-600/5 rounded-full blur-lg pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Зароблено (Escrow)</span>
              <TrendingUp className="h-5 w-5 text-violet-400" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-white font-display">{totalRevenue.toLocaleString()} UAH</p>
              <span className="text-[9px] text-emerald-400 font-medium block mt-1">Сума всіх успішних угод</span>
            </div>
          </div>

          {/* Активные Аукционы */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-lg pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Активні аукціони</span>
              <Gavel className="h-5 w-5 text-amber-400" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-white font-display">{activeAuctionsCount} лотів</p>
              <span className="text-[9px] text-slate-500 block mt-1">Роботи-симулятори ведуть торги</span>
            </div>
          </div>

          {/* Успешные продажи */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/5 rounded-full blur-lg pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Успішні продажі</span>
              <CheckCircle className="h-5 w-5 text-sky-400" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-white font-display">{soldCount} угод</p>
              <span className="text-[9px] text-slate-500 block mt-1">100% захист від шахрайства</span>
            </div>
          </div>

        </div>

        {/* График Выручки & Прогресс Верификации (Split Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* График продаж (Custom SVG с градиентным свечением) */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Статистика продажів та переглядів
                </h3>
                <p className="text-[10px] text-slate-400">Дані за останні 14 днів торгів</p>
              </div>
              <div className="flex gap-4 text-[10px] font-semibold text-slate-400 bg-slate-950 p-2 rounded-lg border border-white/10">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Продажі</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-400" /> Перегляди</span>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="relative w-full aspect-[21/9] bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden p-2">
              <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                <defs>
                  {/* Gradients */}
                  <linearGradient id="chartEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="chartViolet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                {/* Violet Curve (Views) */}
                <path
                  d="M 0,160 Q 100,60 200,90 T 400,150 T 600,80 L 600,220 L 0,220 Z"
                  fill="url(#chartViolet)"
                />
                <path
                  d="M 0,160 Q 100,60 200,90 T 400,150 T 600,80"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                />

                {/* Emerald Curve (Sales) */}
                <path
                  d="M 0,190 Q 100,120 200,150 T 400,70 T 600,110 L 600,220 L 0,220 Z"
                  fill="url(#chartEmerald)"
                />
                <path
                  d="M 0,190 Q 100,120 200,150 T 400,70 T 600,110"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />

                {/* Highlight Nodes */}
                <circle cx="200" cy="150" r="4" className="fill-emerald-400 stroke-slate-900 stroke-2" />
                <circle cx="400" cy="70" r="4" className="fill-emerald-400 stroke-slate-900 stroke-2" />
                <circle cx="200" cy="90" r="4" className="fill-violet-400 stroke-slate-900 stroke-2" />
              </svg>
            </div>
            
            <div className="mt-4 flex justify-between text-[9px] text-slate-500 font-bold px-1">
              <span>08 ТРА</span>
              <span>10 ТРА</span>
              <span>12 ТРА</span>
              <span>14 ТРА</span>
              <span>16 ТРА</span>
              <span>18 ТРА</span>
              <span>20 ТРА</span>
            </div>
          </div>

          {/* Блок верификации продавца */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-display">Статус продавця: Золотий</h3>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">Пройдіть кроки верифікації, щоб підняти ліміт угод до 1,000,000 UAH та прибрати комісію.</p>
              
              {/* Прогресс-бар */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400">Верифікація акаунта:</span>
                  <span className="text-emerald-400">{verificationStep * 25}%</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                    style={{ width: `${verificationStep * 25}%` }}
                  />
                </div>
              </div>

              {/* Список шагов */}
              <div className="space-y-2.5 pt-4">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-semibold">✓ Підтвердити номер телефону</span>
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-semibold">✓ Прив’язати картку виплат</span>
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className={verificationStep >= 3 ? "text-emerald-400 font-semibold" : "text-slate-400"}>
                    {verificationStep >= 3 ? "✓ Документи завантажено" : "3. Завантажити скан паспорта / ID"}
                  </span>
                  <button 
                    onClick={() => {
                      soundService.playClick();
                      setVerificationStep(Math.max(3, verificationStep));
                    }}
                    onMouseEnter={() => soundService.playHover()}
                    className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${
                      verificationStep >= 3 ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-500 text-white"
                    }`}
                  >
                    {verificationStep >= 3 ? "Готово" : "Завантажити"}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className={verificationStep >= 4 ? "text-emerald-400 font-semibold" : "text-slate-400"}>
                    {verificationStep >= 4 ? "✓ 5 угод пройдено" : "4. Провести 5 безпечних угод"}
                  </span>
                  <button
                    onClick={() => {
                      soundService.playClick();
                      setVerificationStep(4);
                    }}
                    onMouseEnter={() => soundService.playHover()}
                    className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${
                      verificationStep >= 4 ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-500 text-white"
                    }`}
                  >
                    {verificationStep >= 4 ? "Готово" : "Виконати"}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[9px] text-slate-500 border-t border-white/5 pt-4 text-center mt-4">
              🛡️ Дані шифруються AES-256 відповідно до вимог GDPR.
            </div>
          </div>

        </div>

        {/* Список лотов мерчанта */}
        <section className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white font-display">Ваш преміум асортимент ({listings.length})</h3>
              <p className="text-xs text-slate-400 mt-1">Тут ви можете просувати лоти, дивитися активність ставок або закривати угоди.</p>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Ви ще не виставили жодного лота. Створіть ваше перше преміум оголошення!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-3">Фото та Назва</th>
                    <th className="py-3">Тип</th>
                    <th className="py-3">Поточна ціна</th>
                    <th className="py-3">Статус</th>
                    <th className="py-3 text-right">Керування</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <img src={l.images[0]} className="h-10 w-16 object-cover rounded-lg border border-white/10" alt="" />
                          <div>
                            <span className="font-bold text-slate-200 block max-w-[200px] truncate">{l.title}</span>
                            <span className="text-[9px] text-slate-500 block">Створено: {new Date(l.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        {l.type === "AUCTION" && <span className="text-violet-400">🔨 Аукціон</span>}
                        {l.type === "BUY_NOW" && <span className="text-emerald-400">⚡ Викуп</span>}
                        {l.type === "HYBRID" && <span className="text-sky-400">💎 Гібрид</span>}
                      </td>
                      <td className="py-4 font-bold text-white">
                        {l.currentPrice.toLocaleString()} UAH
                      </td>
                      <td className="py-4">
                        {l.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Активний
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-semibold bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                            Завершено
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/lot/${l.id}`}
                            onMouseEnter={() => soundService.playHover()}
                            onClick={() => soundService.playClick()}
                            className="rounded-lg bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 text-[10px] font-bold border border-white/5 transition-all flex items-center gap-1"
                          >
                            Дивитися лот
                          </Link>
                          {l.status === "ACTIVE" && (
                            <button
                              onClick={() => {
                                soundService.playClick();
                                boostListing(l.id);
                              }}
                              onMouseEnter={() => soundService.playHover()}
                              disabled={boostingStatus === l.id}
                              className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-3 py-1.5 text-[10px] font-bold transition-all shadow-[0_0_10px_rgba(139,92,246,0.2)] border border-violet-500/20"
                            >
                              {boostingStatus === l.id ? "Підняття..." : "Просунути"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
