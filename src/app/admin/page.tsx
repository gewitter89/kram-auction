"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { apiService } from "@/lib/api-service";
import { 
  Activity, 
  Terminal, 
  Cpu, 
  ShieldAlert, 
  RefreshCw, 
  Play, 
  Pause,
  AlertTriangle,
  Server,
  Zap,
  Globe,
  Database,
  ShieldCheck,
  Radio,
  Lock,
  Workflow
} from "lucide-react";
import { soundService } from "@/lib/sound-service";

// Мережевий радар сканування
function RadarScanner() {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center space-y-4">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
      
      <div className="relative w-36 h-36 border border-emerald-500/10 rounded-full flex items-center justify-center overflow-hidden">
        {/* Сітка радару */}
        <div className="absolute inset-2 border border-emerald-500/20 rounded-full" />
        <div className="absolute inset-8 border border-emerald-500/15 rounded-full" />
        <div className="absolute inset-16 border border-emerald-500/10 rounded-full" />
        <div className="absolute inset-24 border border-emerald-500/5 rounded-full" />

        {/* Промінь, що обертається */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-emerald-500/25 to-transparent origin-center rounded-full pointer-events-none"
          style={{
            transformOrigin: "50% 50%",
            animation: "radar-sweep 5s linear infinite",
            clipPath: "polygon(50% 50%, 100% 0, 100% 50%)"
          }}
        />

        {/* Скановані вузли */}
        <div className="absolute top-1/4 left-1/3 h-2 w-2 rounded-full bg-emerald-400 radar-pulse-dot" />
        <div className="absolute bottom-1/3 right-1/4 h-1.5 w-1.5 rounded-full bg-violet-400 radar-pulse-dot" style={{ animationDelay: '0.8s' }} />
        <div className="absolute top-1/2 right-1/3 h-2 w-2 rounded-full bg-emerald-400 radar-pulse-dot" style={{ animationDelay: '1.5s' }} />

        <div className="absolute inset-0 flex items-center justify-center">
          <Globe className="h-6 w-6 text-emerald-500/30 animate-pulse" />
        </div>
      </div>
      
      <div className="text-center font-mono">
        <span className="text-[10px] uppercase font-bold text-slate-500">Локальний радар</span>
        <p className="text-xs font-bold text-emerald-400">Сканування портів...</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  
  // Системні ресурси
  const [cpuUsage, setCpuUsage] = useState(28);
  const [ramUsage, setRamUsage] = useState(54);
  const [trafficCount, setTrafficCount] = useState(98);
  
  // Стани симуляції атак
  const [ddosAlert, setDdosAlert] = useState(false);
  const [sqliAlert, setSqliAlert] = useState(false);
  const [blockedCount, setBlockedCount] = useState(1842);

  // Стани підсистем платформи
  const [firewallActive, setFirewallActive] = useState(true);
  const [escrowActive, setEscrowActive] = useState(true);
  const [wsActive, setWsActive] = useState(true);
  const [npSyncActive, setNpSyncActive] = useState(true);

  // Журнал логів
  const [logs, setLogs] = useState<string[]>([
    "[12:40:02] SECURE: SSH-з'єднання з 192.168.1.45 підтверджено (Розробник).",
    "[12:40:15] BOT_ENGINE: Ініціалізовано симуляцію ставок ботів (завантажено 7 ботів).",
    "[12:41:03] GATEWAY: Ендпоінт вебхуків Нової Пошти готовий [Статус: 200 OK].",
    "[12:41:20] ESCROW: Сховище транзитних коштів заблоковано. Ротація ключів проведена.",
    "[12:42:08] MODERATION: Запущено анти-фрод сканер перевірки особистих кабінетів.",
    "[12:43:00] TRANSACTIONS: Автоматичний аудит транзакцій завершено. Розбіжностей не виявлено."
  ]);

  const [botSystemActive, setBotSystemActive] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Динамічна симуляція зміни показників системи
  useEffect(() => {
    const interval = setInterval(() => {
      // Базові показники в залежності від атак
      const baseCpu = ddosAlert ? 92 : sqliAlert ? 48 : 22;
      const baseRam = ddosAlert ? 94 : sqliAlert ? 62 : 52;
      
      setCpuUsage(Math.min(99, Math.max(12, Math.floor(baseCpu + Math.random() * 8))));
      setRamUsage(Math.min(99, Math.max(30, Math.floor(baseRam + Math.random() * 3))));
      
      // Генерація трафіку
      if (ddosAlert) {
        setTrafficCount(prev => prev + Math.floor(Math.random() * 200) + 100);
        setBlockedCount(prev => prev + Math.floor(Math.random() * 15) + 5);
      } else {
        setTrafficCount(Math.max(40, Math.min(250, trafficCount + Math.floor(Math.random() * 20) - 10)));
      }

      if (sqliAlert) {
        setBlockedCount(prev => prev + Math.floor(Math.random() * 2) + 1);
      }

      // Генерація подій до логу
      const eventLogs = [
        "SECURE: Проведено ротацію криптографічного сесійного ключа.",
        "BOT_ENGINE: Бот здійснив ставку на активний лот маркету.",
        "ESCROW: Зарезервовано депозит під нову Безпечну угоду.",
        "LOGISTICS: Оброблено вебхук Нової Пошти зі статусом 'У дорозі'.",
        "MODERATION: Антифрод сканер оновив рейтинг довіри користувача Aleksandr.",
        "DATABASE: Створено резервну копію стану системи. dev.db стиснуто."
      ];
      const warningLogs = [
        "SECURITY_WARNING: Спроба неавторизованого входу заблокована з IP 45.12.38.109.",
        "BOT_ENGINE: Активовано компенсацію затримки потоку ставок.",
        "GATEWAY: Виявлено високу затримку зв'язку з логістичним шлюзом.",
        "ESCROW: Завершено перевірку контрольної суми транзакцій."
      ];
      const ddosLogs = [
        "FIREWALL: Блокування флуду пакетів з IP 83.190.11.23 на порт 443.",
        "DDoS_SHIELD: Запущено глобальне обмеження лімітів запитів (Rate Limiting).",
        "SECURITY_ALERT: Виявлено аномальний трафік! Смуга пропускання перевищує 4.2 Gbps.",
        "WAF: Синхронізація блокування SYN-флуду. Перенаправлення через Cloudflare Warp."
      ];
      const sqliLogs = [
        "WAF_BLOCK: Виявлено SQL-ін'єкцію в параметрі пошуку 'OR 1=1'. Запит відхилено.",
        "SECURITY_ALERT: Порушення структури запиту в /api/listings. Джерело ізольовано.",
        "DATABASE: Заблоковано спробу ін'єкції у таблицю користувачів. Сесія анульована.",
        "WAF: Сигнатура SQL-атаки співпала з шаблоном OWASP Top 10. IP заблоковано."
      ];

      let newLog = "";
      const time = new Date().toLocaleTimeString();

      if (ddosAlert && Math.random() > 0.3) {
        newLog = `[${time}] ${ddosLogs[Math.floor(Math.random() * ddosLogs.length)]}`;
      } else if (sqliAlert && Math.random() > 0.4) {
        newLog = `[${time}] ${sqliLogs[Math.floor(Math.random() * sqliLogs.length)]}`;
      } else {
        const rand = Math.random();
        if (rand > 0.75) {
          newLog = `[${time}] ${eventLogs[Math.floor(Math.random() * eventLogs.length)]}`;
        } else if (rand > 0.9) {
          newLog = `[${time}] ${warningLogs[Math.floor(Math.random() * warningLogs.length)]}`;
        }
      }

      // Якщо якась підсистема вимкнена, додаємо попередження
      if (!firewallActive && Math.random() > 0.85) {
        newLog = `[${time}] ⚠️ WARNING: Firewall/WAF вимкнено! Сервер відкритий до вразливостей.`;
      }
      if (!escrowActive && Math.random() > 0.85) {
        newLog = `[${time}] ⚠️ WARNING: Депонування Escrow призупинено! Фінансовий шлюз незахищений.`;
      }

      if (newLog) {
        setLogs(prev => [...prev.slice(-30), newLog]);
      }

    }, 1500);

    return () => clearInterval(interval);
  }, [ddosAlert, sqliAlert, trafficCount, firewallActive, escrowActive]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Тригер DDoS
  const handleToggleDdos = () => {
    soundService.playClick();
    if (!ddosAlert && sqliAlert) setSqliAlert(false); // вимикаємо інші атаки
    
    setDdosAlert(!ddosAlert);
    const time = new Date().toLocaleTimeString();
    if (!ddosAlert) {
      setLogs(prev => [...prev, `[${time}] ⚠️ WARNING: Активовано симуляцію DDoS-атаки! Сигналізація брандмауера активована.`]);
    } else {
      setLogs(prev => [...prev, `[${time}] SECURE: DDoS-атаку нейтралізовано. WAF переведено в режим пасивного моніторингу.`]);
    }
  };

  // Тригер SQLi
  const handleToggleSqli = () => {
    soundService.playClick();
    if (!sqliAlert && ddosAlert) setDdosAlert(false);

    setSqliAlert(!sqliAlert);
    const time = new Date().toLocaleTimeString();
    if (!sqliAlert) {
      setLogs(prev => [...prev, `[${time}] ⚠️ WARNING: Запущено симуляцію SQL Injection атаки на базу даних.`]);
    } else {
      setLogs(prev => [...prev, `[${time}] SECURE: Сигнатуру SQLi ліквідовано. Усі вразливі з'єднання закриті.`]);
    }
  };

  const handleClearAllData = () => {
    soundService.playClick();
    if (confirm("Ви впевнені, що хочете скинути всі дані платформи KRAM.UA? Це очистить історію ставок, створені лоти та баланси.")) {
      localStorage.clear();
      apiService.initialize();
      alert("🧹 Локальне сховище очищено! Сторінку буде перезавантажено.");
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020408] bg-grid-pattern relative">
      <Navbar />

      {/* DDoS тривожний банер */}
      {ddosAlert && (
        <div className="bg-rose-950/90 border-b border-rose-500/30 text-rose-300 px-4 py-3 text-xs text-center font-bold font-mono tracking-widest animate-pulse flex items-center justify-center gap-2 relative z-50">
          <AlertTriangle className="h-4 w-4 animate-bounce" />
          УВАГА: ЗАФІКСОВАНО СИМУЛЯЦІЮ DDOS-АТАКИ. НАВАНТАЖЕННЯ НА РЕСУРСИ КРИТИЧНЕ.
        </div>
      )}

      {/* SQLi тривожний банер */}
      {sqliAlert && (
        <div className="bg-amber-950/90 border-b border-amber-500/30 text-amber-300 px-4 py-3 text-xs text-center font-bold font-mono tracking-widest animate-pulse flex items-center justify-center gap-2 relative z-50">
          <AlertTriangle className="h-4 w-4 animate-bounce" />
          УВАГА: ОГЛЯД СИГНАТУРИ SQL INJECTION. БАЗА ДАНИХ ПРОВОДИТЬ САНІТАЦІЮ ЗАПИТІВ.
        </div>
      )}

      {/* Динамічна підсвітка */}
      <div className={`absolute top-[10%] left-[5%] w-[450px] h-[450px] rounded-full blur-[140px] pointer-events-none transition-colors duration-1000 ${
        ddosAlert ? "bg-rose-500/5" : sqliAlert ? "bg-amber-500/5" : "bg-emerald-500/5"
      }`} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Заголовок та головні дії */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white font-display tracking-tight leading-none flex items-center gap-2">
              <Server className="h-8 w-8 text-emerald-400" />
              Кібер-Термінал Управління KRAM.UA
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 font-mono">
              Внутрішня система захисту • WAF v2.4 • WebSocket Gateway: <span className="text-emerald-400">АКТИВНИЙ</span>
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleToggleDdos}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all border flex items-center gap-1.5 font-mono ${
                ddosAlert 
                  ? "bg-rose-950 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]" 
                  : "bg-slate-900 text-slate-300 border-white/5 hover:bg-slate-800"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              {ddosAlert ? "Нейтралізувати DDoS" : "Симулювати DDoS"}
            </button>
            
            <button
              onClick={handleToggleSqli}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all border flex items-center gap-1.5 font-mono ${
                sqliAlert 
                  ? "bg-amber-950 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                  : "bg-slate-900 text-slate-300 border-white/5 hover:bg-slate-800"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              {sqliAlert ? "Нейтралізувати SQLi" : "Симулювати SQLi"}
            </button>

            <button
              onClick={handleClearAllData}
              className="rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-850 text-xs font-bold text-rose-400 px-4 py-2.5 transition-all flex items-center gap-1.5 font-mono"
            >
              <RefreshCw className="h-4 w-4" />
              Скинути базу даних
            </button>
          </div>
        </div>

        {/* Сетка ресурсів */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono">
          
          {/* CPU */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-emerald-400" /> Навантаження CPU
              </span>
              <span className={cpuUsage > 80 ? "text-rose-400 animate-pulse font-black" : "text-emerald-400"}>{cpuUsage}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full transition-all duration-300 rounded-full ${
                  cpuUsage > 80 ? "bg-rose-500" : "bg-emerald-400"
                }`}
                style={{ width: `${cpuUsage}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-500">Ядер: 16 активних | Темп: {ddosAlert ? "79°C" : "42°C"}</p>
          </div>

          {/* RAM */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Database className="h-4 w-4 text-violet-400" /> Пам'ять RAM
              </span>
              <span className={ramUsage > 80 ? "text-rose-400 animate-pulse font-black" : "text-violet-400"}>{ramUsage}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full transition-all duration-300 rounded-full ${
                  ramUsage > 80 ? "bg-rose-500" : "bg-violet-400"
                }`}
                style={{ width: `${ramUsage}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-500">Виділено: {(16.0 * (ramUsage/100)).toFixed(1)} GB / 16.0 GB</p>
          </div>

          {/* Мережевий трафік */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-sky-400" /> Мережевий трафік
              </span>
              <span className="text-sky-400 font-bold">{trafficCount} req/sec</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  ddosAlert ? "bg-rose-500" : "bg-sky-400"
                }`}
                style={{ width: `${Math.min(100, trafficCount / 25)}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-500">Канал зв'язку: {ddosAlert ? "4.8 Gbps" : "18.5 Mbps"}</p>
          </div>

          {/* Симулятор ботів */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400" /> Симуляція ботів
              </span>
              <span className={botSystemActive ? "text-emerald-400" : "text-slate-500"}>
                {botSystemActive ? "АКТИВНА" : "ПАУЗА"}
              </span>
            </div>
            <button
              onClick={() => {
                soundService.playClick();
                setBotSystemActive(!botSystemActive);
              }}
              className={`w-full rounded-xl py-1 text-[10px] font-bold border transition-colors ${
                botSystemActive ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-white/5 bg-slate-800 text-slate-400"
              }`}
            >
              {botSystemActive ? "Вимкнути ставки ботів" : "Запустити ставки ботів"}
            </button>
            <p className="text-[9px] text-slate-500">Генерація тиску покупців у лотах</p>
          </div>

        </div>

        {/* Панель брандмауера WAF & Інтерактивні тумблери підсистем */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-mono">
          
          {/* Стан брандмауера та блокування */}
          <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-white/5 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Статус Брандмауера WAF (Web Application Firewall)
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Рівень захисту від шкідливого трафіку та OWASP-уразливостей</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Рівень фільтрації</span>
                <p className="text-lg font-black text-emerald-400 mt-1">99.98%</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Всього заблоковано атак</span>
                <p className={`text-lg font-black mt-1 transition-all duration-300 ${ddosAlert ? "text-rose-400 text-glow-violet" : "text-white"}`}>
                  {blockedCount.toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Активні погрози</span>
                <p className={`text-lg font-black mt-1 ${ddosAlert ? "text-rose-400 animate-pulse" : sqliAlert ? "text-amber-400 animate-pulse" : "text-slate-500"}`}>
                  {ddosAlert ? "14 DDoS Botnets" : sqliAlert ? "1 SQLi Vector" : "0"}
                </p>
              </div>
            </div>

            {/* Прогрес активного блокування */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Інтенсивність фільтрації трафіку WAF</span>
                <span className={ddosAlert ? "text-rose-400 font-bold" : "text-slate-500"}>
                  {ddosAlert ? "МАКСИМАЛЬНА (Блокування DDoS)" : "СТАНДАРТ"}
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-white/5 p-[2px]">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    ddosAlert 
                      ? "bg-gradient-to-r from-rose-600 via-violet-500 to-rose-600 animate-pulse" 
                      : sqliAlert
                        ? "bg-amber-500"
                        : "bg-emerald-400"
                  }`} 
                  style={{ width: ddosAlert ? "100%" : sqliAlert ? "45%" : "12%" }}
                />
              </div>
            </div>
          </div>

          {/* Тумблери підсистем */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Workflow className="h-4 w-4 text-violet-400" />
                Модулі платформи
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Вмикання та вимикання підсистем KRAM</p>
            </div>

            <div className="space-y-2.5">
              {/* Firewall */}
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-[11px] text-slate-300">WAF / Firewall</span>
                <button
                  onClick={() => {
                    soundService.playClick();
                    setFirewallActive(!firewallActive);
                    const time = new Date().toLocaleTimeString();
                    setLogs(prev => [...prev, `[${time}] SYSTEM: WAF / Firewall ${!firewallActive ? 'УВІМКНЕНО' : 'ВИМКНЕНО'}`]);
                  }}
                  className={`h-4 w-8 rounded-full relative transition-colors ${firewallActive ? 'bg-emerald-500' : 'bg-slate-800'}`}
                >
                  <div className={`h-3 w-3 rounded-full bg-white absolute top-0.5 transition-all ${firewallActive ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Escrow */}
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-[11px] text-slate-300">Депонування Escrow</span>
                <button
                  onClick={() => {
                    soundService.playClick();
                    setEscrowActive(!escrowActive);
                    const time = new Date().toLocaleTimeString();
                    setLogs(prev => [...prev, `[${time}] SYSTEM: Escrow депонування ${!escrowActive ? 'УВІМКНЕНО' : 'ВИМКНЕНО'}`]);
                  }}
                  className={`h-4 w-8 rounded-full relative transition-colors ${escrowActive ? 'bg-emerald-500' : 'bg-slate-800'}`}
                >
                  <div className={`h-3 w-3 rounded-full bg-white absolute top-0.5 transition-all ${escrowActive ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* WebSockets */}
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-[11px] text-slate-300">WebSocket Live Gateway</span>
                <button
                  onClick={() => {
                    soundService.playClick();
                    setWsActive(!wsActive);
                    const time = new Date().toLocaleTimeString();
                    setLogs(prev => [...prev, `[${time}] SYSTEM: WebSocket шлюз ${!wsActive ? 'УВІМКНЕНО' : 'ВИМКНЕНО'}`]);
                  }}
                  className={`h-4 w-8 rounded-full relative transition-colors ${wsActive ? 'bg-emerald-500' : 'bg-slate-800'}`}
                >
                  <div className={`h-3 w-3 rounded-full bg-white absolute top-0.5 transition-all ${wsActive ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Нова Пошта */}
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-[11px] text-slate-300">Nova Poshta API Sync</span>
                <button
                  onClick={() => {
                    soundService.playClick();
                    setNpSyncActive(!npSyncActive);
                    const time = new Date().toLocaleTimeString();
                    setLogs(prev => [...prev, `[${time}] SYSTEM: Синхронізація API Нової Пошти ${!npSyncActive ? 'УВІМКНЕНО' : 'ВИМКНЕНО'}`]);
                  }}
                  className={`h-4 w-8 rounded-full relative transition-colors ${npSyncActive ? 'bg-emerald-500' : 'bg-slate-800'}`}
                >
                  <div className={`h-3 w-3 rounded-full bg-white absolute top-0.5 transition-all ${npSyncActive ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Радар та консоль логування */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-3">
            <RadarScanner />
          </div>

          <div className="lg:col-span-9">
            <section className="glass-panel rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
              <div className="bg-slate-950 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    Журнал Системи безпеки та ставок (Live Log)
                  </h3>
                </div>
                <span className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-mono font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  ПОТІК ДАНИХ АКТИВНИЙ
                </span>
              </div>

              <div className="p-6 matrix-terminal h-80 overflow-y-auto text-[11px] text-emerald-400/90 leading-relaxed font-mono space-y-2">
                {logs.map((log, index) => {
                  const isWarning = log.includes("ALERT") || log.includes("WARNING") || log.includes("⚠️");
                  const isSecure = log.includes("SECURE") || log.includes("checkpoint") || log.includes("SYSTEM:");
                  return (
                    <div key={index} className={isWarning ? "text-rose-400 font-bold" : isSecure ? "text-teal-400" : "text-emerald-400/80"}>
                      {log}
                    </div>
                  );
                })}
                <div ref={terminalEndRef} />
              </div>
            </section>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
