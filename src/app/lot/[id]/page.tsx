"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { apiService } from "@/lib/api-service";
import { MockListing, MockBid, MockTransaction } from "@/lib/db";
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
  ChevronRight,
  TrendingUp,
  Info
} from "lucide-react";
import confetti from "canvas-confetti";
import { soundService } from "@/lib/sound-service";

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
    for (let a of anchors) {
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
function BidVelocityChart({ bids }: { bids: MockBid[] }) {
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

export default function LotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, updateBalance } = useAuth();
  
  const [listing, setListing] = useState<MockListing | null>(null);
  const [bids, setBids] = useState<MockBid[]>([]);
  
  const [bidAmount, setBidAmount] = useState<string>("");
  const [priceFlashed, setPriceFlashed] = useState(false);
  
  const [chatMessage, setChatMessage] = useState("");
  const [chatWarning, setChatWarning] = useState<string | null>(null);

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [deliveryProvider, setDeliveryProvider] = useState("NOVA_POSHTA");
  const [novaPoshtaCity, setNovaPoshtaCity] = useState("Київ");
  const [novaPoshtaBranch, setNovaPoshtaBranch] = useState("Відділення №1 (вул. Пирогова, 2)");
  
  const [transaction, setTransaction] = useState<MockTransaction | null>(null);

  const [botsActive, setBotsActive] = useState(true);
  const [botNotification, setBotNotification] = useState<{ text: string; amount: number; bidder: string } | null>(null);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    apiService.initialize();
    loadListingData();
  }, [id]);

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

    const triggerBotBid = () => {
      if (user && user.id === listing.sellerId) return;

      const randomBot = botNames[Math.floor(Math.random() * botNames.length)];
      const increment = listing.bidStep + (Math.floor(Math.random() * 2) * (listing.bidStep / 2));
      const newPrice = listing.currentPrice + increment;

      const res = apiService.placeBid(listing.id, `bot-${randomBot}`, randomBot, newPrice);
      if (res.success) {
        soundService.playGavel();
        setPriceFlashed(true);
        setTimeout(() => setPriceFlashed(false), 1200);

        setBotNotification({
          text: `Нова ставка від учасника ${randomBot}!`,
          amount: newPrice,
          bidder: randomBot
        });
        setTimeout(() => setBotNotification(null), 5000);

        if (increment >= listing.bidStep * 1.5) {
          confetti({
            particleCount: 25,
            spread: 25,
            origin: { y: 0.8 },
            colors: ["#8b5cf6", "#f59e0b"]
          });
        }

        loadListingData();
      }
    };

    const randomInterval = Math.floor(Math.random() * 14000) + 12000;
    const botTimer = setInterval(triggerBotBid, randomInterval);

    return () => clearInterval(botTimer);
  }, [listing, botsActive, user]);

  const loadListingData = () => {
    const item = apiService.getListingById(id);
    if (item) {
      setListing(item);
      setBids(apiService.getBids(id));
      
      if (user) {
        const txs = apiService.getTransactions(user.id);
        const existingTx = txs.find(t => t.listingId === id);
        if (existingTx) setTransaction(existingTx);
      }
    }
  };

  const handlePlaceBid = (e: React.FormEvent) => {
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

    const res = apiService.placeBid(listing!.id, user.id, user.name, amount);
    if (res.success) {
      soundService.playSuccess();
      confetti({
        particleCount: 110,
        spread: 60,
        colors: ["#10b981", "#34d399", "#60a5fa"]
      });
      setBidAmount("");
      setPriceFlashed(true);
      setTimeout(() => setPriceFlashed(false), 1200);

      loadListingData();
    } else {
      soundService.playWarning();
      alert(res.error || "Помилка при розміщенні ставки");
    }
  };

  const triggerManualBotBid = () => {
    if (!listing) return;
    const botNames = ["VIP_Dealer_UA", "Odesa_Collector", "Kyiv_Capitalist"];
    const randomBot = botNames[Math.floor(Math.random() * botNames.length)];
    const newPrice = listing.currentPrice + listing.bidStep;

    const res = apiService.placeBid(listing.id, `bot-${randomBot}`, randomBot, newPrice);
    if (res.success) {
      soundService.playGavel();
      setPriceFlashed(true);
      setTimeout(() => setPriceFlashed(false), 1200);
      setBotNotification({
        text: `⚡ Ставку спровоковано вручну!`,
        amount: newPrice,
        bidder: randomBot
      });
      setTimeout(() => setBotNotification(null), 4000);
      loadListingData();
    }
  };

  const handleBuyNowSubmit = (e: React.FormEvent) => {
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

    const res = apiService.buyNow(listing.id, user.id, deliveryProvider);
    if (res.success) {
      soundService.playSuccess();
      updateBalance(-listing.buyNowPrice);
      
      confetti({
        particleCount: 180,
        spread: 90,
        origin: { y: 0.5 }
      });

      setShowBuyModal(false);
      loadListingData();
      if (res.transaction) setTransaction(res.transaction);
    } else {
      soundService.playWarning();
      alert(res.error || "Помилка при покупці лоту");
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || chatMessage.trim() === "" || !listing) return;

    const res = apiService.sendMessage(listing.id, user.id, listing.sellerId, chatMessage);
    
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
                      {opt === "COURIER" && "📍 Кур'єр / Самовивіз Київ"}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Прогноз вигоди */}
            <ProfitCalculator currentPrice={listing.currentPrice} />
          </div>

          {/* Права панель: Ставки (стакан) та чат */}
          <div className="space-y-6">
            
            {/* Графік швидкості та Біржовий Стакан ставок */}
            {listing.type !== "BUY_NOW" && (
              <div className="space-y-6">
                
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

      {/* МОДАЛЬНЕ ВІКНО ПОКУПКИ (БЕЗОПАСНАЯ СДЕЛКА) */}
      {showBuyModal && listing.buyNowPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl animate-slide-up relative overflow-hidden">
            
            <h3 className="text-xl font-black text-white mb-2 font-display">Оформлення Безпечної Угоди</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Ви викуповуєте лот <strong>{listing.title}</strong> за фіксованою ціною. Кошти депонуються в гарантійному фонді KRAM.
            </p>

            <form onSubmit={handleBuyNowSubmit} className="space-y-4">
              
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

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Місто доставки</label>
                <input
                  type="text"
                  className="w-full glass-input rounded-xl text-xs p-3"
                  value={novaPoshtaCity}
                  onChange={(e) => setNovaPoshtaCity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Відділення пошти</label>
                <input
                  type="text"
                  className="w-full glass-input rounded-xl text-xs p-3"
                  value={novaPoshtaBranch}
                  onChange={(e) => setNovaPoshtaBranch(e.target.value)}
                  required
                />
              </div>

              <div className="rounded-2xl border border-white/5 bg-slate-950/80 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Вартість товару:</span>
                  <span className="text-white font-semibold">{listing.buyNowPrice.toLocaleString()} UAH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Комісія угоди:</span>
                  <span className="text-emerald-400 font-semibold">0 UAH (Акція)</span>
                </div>
                <div className="h-[1px] bg-white/5 my-2" />
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-white">До сплати з балансу:</span>
                  <span className="text-emerald-400 font-black">{listing.buyNowPrice.toLocaleString()} UAH</span>
                </div>
              </div>

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
                  Оплатити {listing.buyNowPrice.toLocaleString()} UAH
                </button>
              </div>

            </form>
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
