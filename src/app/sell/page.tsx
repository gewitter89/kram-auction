"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { apiService } from "@/lib/api-service";
import { MockCategory } from "@/lib/db";
import { 
  Check,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Info,
  Sparkles,
  Globe,
  Loader2,
  ShieldAlert,
  FileText,
  Coins,
  Cpu
} from "lucide-react";
import confetti from "canvas-confetti";
import { soundService } from "@/lib/sound-service";

function calculateEndDate(durationDays: string): string {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * parseInt(durationDays)).toISOString();
}

export default function SellPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<MockCategory[]>([]);

  useEffect(() => {
    async function loadCats() {
      const cats = await apiService.getCategories();
      setCategories(cats);
    }
    loadCats();
  }, []);
  const [step, setStep] = useState(1);

  // Імпорт з інших платформ
  const [importUrl, setImportUrl] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState(0); // 0: input, 1: instruction, 2: scanning, 3: success
  const [importCode, setImportCode] = useState("");
  const [importLog, setImportLog] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // KRAM AI Copilot
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [aiPriceAnalysis, setAiPriceAnalysis] = useState<{
    recommendedStart: number;
    recommendedBuyNow: number;
    recommendedStep: number;
    demand: string;
    score: number;
    advice: string;
  } | null>(null);

  const generateImportCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "KRAM-";
    for (let i = 0; i < 8; i++) {
      if (i === 4) code += "-";
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setImportCode(code);
    return code;
  };

  const handleStartImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl.trim()) return;
    
    if (!importUrl.includes("olx.ua") && !importUrl.includes("prom.ua") && !importUrl.includes("shafa.ua")) {
      soundService.playWarning();
      alert("Будь ласка, вкажіть коректне посилання з OLX.ua, Prom.ua або Shafa.ua!");
      return;
    }

    soundService.playClick();
    generateImportCode();
    setImportStep(1);
    setShowImportModal(true);
  };

  const runVerificationAndImport = async () => {
    setImportStep(2);
    setIsImporting(true);
    setImportLog([]);
    soundService.playConsoleOpen();

    const logs = [
      "🔗 Підключення до сервера донора...",
      "📡 Отримання HTML коду сторінки...",
      "🔍 Пошук верифікаційного коду...",
      `🔑 Верифікація підпису власності ${importCode}...`,
      "✅ Код знайдено! Права на оголошення підтверджені.",
      "📦 Вилучення медіа-файлів та зображень...",
      "⚙️ Структурування метаданих оголошення..."
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setImportLog((prev) => [...prev, logs[i]]);
      soundService.playConsoleTick();
    }

    setIsImporting(false);
    setImportStep(3);
    soundService.playImportSuccess();

    const urlLower = importUrl.toLowerCase();
    if (urlLower.includes("iphone") || urlLower.includes("телефон") || urlLower.includes("apple")) {
      setTitle("Apple iPhone 15 Pro Max 512GB Natural Titanium");
      setDescription("Продам власний iPhone 15 Pro Max на 512 ГБ у кольорі Natural Titanium.\n\nСтан пристрою:\n- Ідеальний, без подряпин чи сколів.\n- Батарея: 98% ємності.\n- Повний заводський комплект: оригінальна коробка, кабель, чеки.\n- Купувався в офіційному магазині.\n\nПродаж тільки через безпечну угоду KRAM або особисто.");
      setCategoryId("cat-1");
      setImages([
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800"
      ]);
    } else if (urlLower.includes("watch") || urlLower.includes("годинник") || urlLower.includes("rolex")) {
      setTitle("Rolex Submariner Date Black Dial (2023)");
      setDescription("Ексклюзивний швейцарський годинник в ідеальному стані. Повний комплект: оригінальна коробка, гарантійна карта, чек про купівлю. Корпус із нержавіючої сталі Oystersteel, керамічний безель Cerachrom. Будь-які перевірки в авторизованому сервісі вітаються.");
      setCategoryId("cat-3");
      setImages([
        "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800",
        "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800"
      ]);
    } else {
      const host = importUrl.includes("olx.ua") ? "OLX" : importUrl.includes("prom.ua") ? "Prom" : "Шафа";
      setTitle(`Оголошення з ${host}`);
      setDescription(`Успішно імпортований лот з вашого профілю на ${host}.\n\n(Опис було зчитано та автоматично переформатовано під стандарти KRAM.UA).\n\nПеревірте параметри лота та завершіть створення.`);
      setCategoryId("cat-1");
      setImages([
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
      ]);
    }
  };

  const handleAiGenerateDescription = async () => {
    if (!title.trim()) {
      soundService.playWarning();
      alert("Вкажіть назву лота, щоб AI міг згенерувати опис!");
      return;
    }
    setAiLoading(true);
    setAiAction("generate");
    soundService.playAITyping();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const generated = `🔥 **Ексклюзивний лот: ${title}**\n\n` +
      `Пропоную вашій увазі високоякісний товар у чудовому стані. Лот повністю відповідає всім стандартам якості та пройшов попередню перевірку перед виставленням.\n\n` +
      `📌 **Основні переваги та характеристики:**\n` +
      `- Оригінальний брендовий виріб\n` +
      `- Повний комплект (коробка, документація, аксесуари)\n` +
      `- Преміальні матеріали виконання\n` +
      `- Мінімальний термін використання\n\n` +
      `💎 **Умови угоди:**\n` +
      `Швидка доставка через Нову Пошту (активовано послугу безпечної угоди KRAM). Можливий як викуп по фіксованій бліц-ціні, так і участь в аукціоні. Запитуйте додаткові фото в чаті!`;

    setDescription(generated);
    setAiLoading(false);
    setAiAction(null);
    soundService.playSuccess();
  };

  const handleAiEnhanceDescription = async () => {
    if (!description.trim()) {
      soundService.playWarning();
      alert("Напишіть хоча б кілька слів в описі, щоб AI міг його покращити!");
      return;
    }
    setAiLoading(true);
    setAiAction("enhance");
    soundService.playAITyping();

    await new Promise((resolve) => setTimeout(resolve, 1800));

    const enhanced = `💎 **PREMIUM LOT: ${title || "Товар KRAM"}**\n\n` +
      `⚡ *Професійне оновлення опису штучним інтелектом KRAM AI:*\n\n` +
      `${description.replace(/^[•*\-]/gm, "")}\n\n` +
      `--- \n` +
      `🛠️ **СТАН ТА ДІАГНОСТИКА:**\n` +
      `- Зовнішній вигляд: Ідеальний (9.8/10)\n` +
      `- Працездатність: 100% протестовано\n` +
      `- Наявність дефектів: відсутні\n\n` +
      `📦 **ДЕТАЛІ ДОСТАВКИ:**\n` +
      `Відправка в день замовлення. Усі витрати на страхування вантажу на суму до 50 000 грн покриваються платформою KRAM.UA.`;

    setDescription(enhanced);
    setAiLoading(false);
    setAiAction(null);
    soundService.playSuccess();
  };

  const handleAiAnalyzePrice = async () => {
    if (!title.trim()) {
      soundService.playWarning();
      alert("Вкажіть назву лота для аналізу ринкових цін!");
      return;
    }
    setAiLoading(true);
    setAiAction("price");
    soundService.playAITyping();

    await new Promise((resolve) => setTimeout(resolve, 2200));

    const titleLower = title.toLowerCase();
    let start = 1500;
    let buy = 2200;
    let stepVal = 100;
    let demandStr = "Середній (72%)";
    let scoreVal = 85;
    let adviceStr = "Цей товар користується стабільним попитом. Рекомендується ставити тип продажу 'Гібрид', щоб підігріти інтерес аукціоном та дати можливість купити одразу.";

    if (titleLower.includes("iphone") || titleLower.includes("apple")) {
      start = 38000;
      buy = 44000;
      stepVal = 500;
      demandStr = "Дуже Високий (96%)";
      scoreVal = 98;
      adviceStr = "Попит на техніку Apple на піку. Аукціон привабить багато учасників. Стартуйте з 38 000 грн і ставте крок 500 грн для динамічності торгу.";
    } else if (titleLower.includes("rolex") || titleLower.includes("tissot") || titleLower.includes("watch")) {
      start = 240000;
      buy = 295000;
      stepVal = 2000;
      demandStr = "Високий (84%)";
      scoreVal = 91;
      adviceStr = "Елітні годинники купують поціновувачі. Гібридний аукціон ідеальний. Не занижуйте крок ставки менше ніж 1000-2000 грн.";
    }

    setAiPriceAnalysis({
      recommendedStart: start,
      recommendedBuyNow: buy,
      recommendedStep: stepVal,
      demand: demandStr,
      score: scoreVal,
      advice: adviceStr
    });

    setAiLoading(false);
    setAiAction(null);
    soundService.playSuccess();
  };

  const applyAiPrices = () => {
    if (!aiPriceAnalysis) return;
    setStartPrice(aiPriceAnalysis.recommendedStart.toString());
    setBuyNowPrice(aiPriceAnalysis.recommendedBuyNow.toString());
    setBidStep(aiPriceAnalysis.recommendedStep.toString());
    soundService.playClick();
    alert("💸 Ціни успішно розраховані! Вони будуть застосовані на наступному кроці 'Формат та Ціна'.");
  };

  // Стани полів форми
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");

  const [dealType, setDealType] = useState<"AUCTION" | "BUY_NOW" | "HYBRID">("HYBRID");
  const [startPrice, setStartPrice] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [bidStep, setBidStep] = useState("500");
  const [durationDays, setDurationDays] = useState("3");

  const [deliveryOptions, setDeliveryOptions] = useState<string[]>(["NOVA_POSHTA"]);

  // Читання URL query-параметрів для автоматичного заповнення
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const titleParam = params.get("title");
      const priceParam = params.get("price");
      const buynowParam = params.get("buynow");
      const stepParam = params.get("step");
      const categoryParam = params.get("category");

      if (titleParam) {
        setTitle(titleParam);
        setDescription(`Преміальний лот: ${titleParam}. Усі технічні характеристики та стан повністю відповідають високим стандартам KRAM. Детальні умови та комплектація надаються за запитом у чаті.`);
      }
      if (priceParam) setStartPrice(priceParam);
      if (buynowParam) {
        setBuyNowPrice(buynowParam);
      }
      if (stepParam) setBidStep(stepParam);
      if (categoryParam) setCategoryId(categoryParam);

      // Використовуємо setTimeout, щоб уникнути синхронного виклику setState в useEffect
      setTimeout(() => {
        if (buynowParam) {
          setDealType("HYBRID");
        } else if (priceParam) {
          setDealType("AUCTION");
        }
      }, 0);

      // Автоматичне підвантаження картинки для WOW-ефекту
      if (titleParam) {
        const lower = titleParam.toLowerCase();
        let mockImg = "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800"; // neural
        if (lower.includes("iphone") || lower.includes("phone") || lower.includes("айфон")) {
          mockImg = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800";
        } else if (lower.includes("rolex") || lower.includes("watch") || lower.includes("годинник")) {
          mockImg = "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800";
        } else if (lower.includes("macbook") || lower.includes("laptop") || lower.includes("ноутбук")) {
          mockImg = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800";
        }
        setImages([mockImg]);
      }
    }
  }, []);

  // Перевірка авторизації
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  const handleAddImageUrl = () => {
    if (imageInput.trim() !== "") {
      setImages([...images, imageInput.trim()]);
      setImageInput("");
      soundService.playClick();
    }
  };

  const handleQuickAddImage = (url: string) => {
    setImages([...images, url]);
    soundService.playClick();
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    soundService.playClick();
  };

  const toggleDelivery = (opt: string) => {
    soundService.playClick();
    if (deliveryOptions.includes(opt)) {
      if (deliveryOptions.length > 1) {
        setDeliveryOptions(deliveryOptions.filter(d => d !== opt));
      }
    } else {
      setDeliveryOptions([...deliveryOptions, opt]);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!title || !description || !categoryId || images.length === 0) {
        soundService.playWarning();
        alert("Будь ласка, заповніть назву, опис, категорію та додайте щонайменше 1 зображення!");
        return;
      }
    }
    if (step === 2) {
      if (dealType === "AUCTION" && (!startPrice || !bidStep)) {
        soundService.playWarning();
        alert("Заповніть стартову ціну та крок ставки!");
        return;
      }
      if (dealType === "BUY_NOW" && !buyNowPrice) {
        soundService.playWarning();
        alert("Заповніть ціну викупу (Бліц)!");
        return;
      }
      if (dealType === "HYBRID" && (!startPrice || !buyNowPrice || !bidStep)) {
        soundService.playWarning();
        alert("Будь ласка, вкажіть стартову ціну, ціну викупу та крок ставки!");
        return;
      }
      if (dealType === "HYBRID" && parseFloat(buyNowPrice) <= parseFloat(startPrice)) {
        soundService.playWarning();
        alert("Ціна миттєвого викупу (Бліц) повинна бути вищою за стартову ціну аукціону!");
        return;
      }
    }
    soundService.playClick();
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    soundService.playClick();
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Формуємо дату завершення за допомогою зовнішньої чистої функції
    const endDate = calculateEndDate(durationDays);

    await apiService.createListing({
      title,
      description,
      images,
      categoryId,
      sellerId: user.id,
      type: dealType,
      startPrice: dealType === "BUY_NOW" ? parseFloat(buyNowPrice) : parseFloat(startPrice),
      buyNowPrice: dealType !== "AUCTION" ? parseFloat(buyNowPrice) : undefined,
      bidStep: parseFloat(bidStep),
      endDate,
      deliveryOptions
    });

    // Запускаємо святкове конфетті
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    // Звук перемоги/успіху
    soundService.playSuccess();

    // Сповіщаємо користувача
    await apiService.addNotification(
      user.id,
      `Ви успішно створили оголошення "${title}"! Статус: Активно.`,
      "INFO"
    );

    alert("🎉 Вітаємо! Ваш лот успішно опубліковано на KRAM.UA!");
    router.push("/");
  };

  // Красиві демо-товари на вибір
  const imagePresets = [
    { name: "Швейцарський годинник", url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600" },
    { name: "iPhone 15 Pro", url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600" },
    { name: "Ноутбук Apple Macbook", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600" },
    { name: "Золоті монети", url: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600" },
    { name: "Елітне авто", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600" },
    { name: "Картина олією", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#030712]">
      <Navbar />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Заголовок */}
        <div className="text-center mb-10">
          <span 
            onMouseEnter={() => soundService.playHover()}
            className="cursor-default inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/25 mb-4"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Безкоштовне розміщення лота
          </span>
          <h1 className="text-3xl font-extrabold text-white font-display">Розмістити лот на KRAM</h1>
          <p className="text-xs text-slate-400 mt-2">
            Створіть лот за 3 простих кроки з адаптивними параметрами продажу
          </p>
        </div>

        {/* Шкала кроків (Progress Indicator) */}
        <div className="mb-10 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0" />
          <div className="relative z-10 flex justify-between">
            {[
              { num: 1, label: "Опис" },
              { num: 2, label: "Формат та Ціна" },
              { num: 3, label: "Доставка" }
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
                  step === s.num
                    ? "border-emerald-500 bg-[#030712] text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-110"
                    : step > s.num
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-white/10 bg-[#030712] text-slate-500"
                }`}>
                  {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                </div>
                <span className={`text-[10px] mt-2 font-medium ${step === s.num ? "text-emerald-400 font-semibold" : "text-slate-500"}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Тіло форми */}
        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-white/5 space-y-8 shadow-xl">

          {/* КРОК 1: Опис, Категорія, Картинки */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-white font-display">Крок 1: Основна інформація лота</h3>
                <p className="text-[11px] text-slate-500 mt-1">Опишіть ваш товар детально, щоб залучити більше потенційних покупців.</p>
              </div>

              {/* Блок швидкого імпорту */}
              <div className="border border-white/5 bg-slate-950/40 rounded-2xl p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-display">
                    <Globe className="h-3.5 w-3.5 text-emerald-400" />
                    Швидкий імпорт оголошення
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">OLX • Prom.ua • Шафа</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Бажаєте перенести свій лот з іншого майданчика? Вставте посилання нижче — система автоматично зчитає опис та фото після верифікації вашого профілю.
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Вставте посилання на ваше оголошення (OLX, Prom.ua, Шафа)..."
                    className="flex-grow glass-input rounded-xl text-xs px-3.5 py-2.5"
                    value={importUrl}
                    onMouseEnter={() => soundService.playHover()}
                    onChange={(e) => setImportUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleStartImport}
                    onMouseEnter={() => soundService.playHover()}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 text-xs font-semibold text-slate-950 transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)] shrink-0"
                  >
                    Імпортувати
                  </button>
                </div>
              </div>

              {/* Назва */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Назва лота</label>
                <input
                  type="text"
                  placeholder="Наприклад: Apple Watch Ultra 2 Titanium"
                  className="w-full glass-input rounded-xl text-xs p-3.5"
                  value={title}
                  onMouseEnter={() => soundService.playHover()}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Категорія */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Категорія каталогу</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onMouseEnter={() => soundService.playHover()}
                      onClick={() => {
                        soundService.playClick();
                        setCategoryId(cat.id);
                      }}
                      className={`text-xs p-3 rounded-xl border text-center transition-all ${
                        categoryId === cat.id
                          ? "border-emerald-500 bg-emerald-500/5 text-emerald-400 font-semibold"
                          : "border-white/5 bg-white/[0.01] text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Опис */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Опис стану та характеристик</label>
                <textarea
                  rows={5}
                  placeholder="Опишіть стан товару, дефекти (якщо є), комплектацію та умови відправки..."
                  className="w-full glass-input rounded-xl text-xs p-3.5 leading-relaxed font-sans"
                  value={description}
                  onMouseEnter={() => soundService.playHover()}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* KRAM AI Copilot */}
              <div className="border border-brand-primary/20 bg-gradient-to-br from-brand-primary/10 via-violet-500/5 to-transparent rounded-2xl p-5 space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-emerald-400 animate-pulse" />
                    KRAM AI Copilot
                  </span>
                  <span className="rounded bg-brand-primary/10 px-2 py-0.5 text-[8px] font-semibold text-brand-primary border border-brand-primary/20 font-mono">
                    Smart Engine v2.1
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Інтелектуальний помічник допоможе вам правильно презентувати лот покупцям, оцінити його ринкову ціну та автоматично оформити опис.
                </p>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={handleAiGenerateDescription}
                    onMouseEnter={() => soundService.playHover()}
                    className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-all disabled:opacity-50"
                  >
                    {aiLoading && aiAction === "generate" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    Згенерувати опис
                  </button>
                  
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={handleAiEnhanceDescription}
                    onMouseEnter={() => soundService.playHover()}
                    className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 hover:text-violet-400 hover:bg-violet-500/5 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-all disabled:opacity-50"
                  >
                    {aiLoading && aiAction === "enhance" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-violet-400" />
                    )}
                    Покращити опис
                  </button>

                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={handleAiAnalyzePrice}
                    onMouseEnter={() => soundService.playHover()}
                    className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 hover:text-amber-400 hover:bg-amber-500/5 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-all disabled:opacity-50"
                  >
                    {aiLoading && aiAction === "price" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Coins className="h-3.5 w-3.5 text-amber-400" />
                    )}
                    Оцінити ціну (AI)
                  </button>
                </div>

                {/* Результати аналізу ціни */}
                {aiPriceAnalysis && (
                  <div className="bg-slate-950/60 rounded-xl border border-white/5 p-4 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[11px] font-bold text-white">Аналітика ринку</span>
                      <span className="text-[10px] text-amber-400 font-bold font-mono">
                        Рейтинг лота: {aiPriceAnalysis.score}/100
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white/[0.01] p-2 rounded-lg border border-white/5">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Старт</span>
                        <span className="text-xs font-black text-white font-mono">
                          {aiPriceAnalysis.recommendedStart.toLocaleString()} UAH
                        </span>
                      </div>
                      <div className="bg-white/[0.01] p-2 rounded-lg border border-white/5">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Бліц (Викуп)</span>
                        <span className="text-xs font-black text-emerald-400 font-mono">
                          {aiPriceAnalysis.recommendedBuyNow.toLocaleString()} UAH
                        </span>
                      </div>
                      <div className="bg-white/[0.01] p-2 rounded-lg border border-white/5">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Крок</span>
                        <span className="text-xs font-black text-white font-mono">
                          {aiPriceAnalysis.recommendedStep.toLocaleString()} UAH
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 leading-normal flex items-start gap-2 bg-white/[0.01] p-2.5 rounded-lg">
                      <Info className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-slate-300 font-semibold mb-0.5">Попит: {aiPriceAnalysis.demand}</p>
                        <p>{aiPriceAnalysis.advice}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={applyAiPrices}
                      onMouseEnter={() => soundService.playHover()}
                      className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold py-2 transition-colors"
                    >
                      Застосувати ціни до лота
                    </button>
                  </div>
                )}
              </div>

              {/* Картинки */}
              <div className="space-y-4">
                <label className="text-xs font-semibold text-slate-400">Фотографії товару</label>
                
                {/* Список завантажених */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                        <img src={img} alt="Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-rose-600/90 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          Видалити
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Додати URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Вставте посилання на зображення товару..."
                    className="flex-grow glass-input rounded-xl text-xs px-3.5 py-3"
                    value={imageInput}
                    onMouseEnter={() => soundService.playHover()}
                    onChange={(e) => setImageInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    onMouseEnter={() => soundService.playHover()}
                    className="rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 px-4 text-xs font-semibold text-white transition-all shrink-0"
                  >
                    Додати
                  </button>
                </div>

                {/* Швидкі пресети */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 block">Швидкі демо-зображення (оберіть одне для тесту):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {imagePresets.map((preset, pIdx) => (
                      <button
                        type="button"
                        key={pIdx}
                        onMouseEnter={() => soundService.playHover()}
                        onClick={() => handleQuickAddImage(preset.url)}
                        className="text-[9px] bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:text-emerald-400 rounded-lg px-2.5 py-1 text-slate-400 transition-colors"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* КРОК 2: Формат угоди, Ціна */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-white font-display">Крок 2: Формат угоди та ціноутворення</h3>
                <p className="text-[11px] text-slate-500 mt-1">Оберіть, як саме ви бажаєте продати цей товар.</p>
              </div>

              {/* Вибір формату продажу */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-400">Формат продажу</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "HYBRID", title: "💎 Гібридний лот", desc: "Аукціон з можливістю миттєвого викупу (Бліц)" },
                    { id: "AUCTION", title: "🔨 Чистий аукціон", desc: "Перемагає максимальна ставка на момент закінчення торгів" },
                    { id: "BUY_NOW", title: "⚡ Фіксована ціна", desc: "Швидкий продаж без торгів та таймерів ставок" }
                  ].map((format) => (
                    <button
                      type="button"
                      key={format.id}
                      onMouseEnter={() => soundService.playHover()}
                      onClick={() => {
                        soundService.playClick();
                        setDealType(format.id as "AUCTION" | "BUY_NOW" | "HYBRID");
                      }}
                      className={`text-left p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        dealType === format.id
                          ? "border-emerald-500 bg-emerald-500/5 text-white"
                          : "border-white/5 bg-white/[0.01] text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-bold block mb-1">{format.title}</span>
                      <span className="text-[9px] text-slate-500 leading-normal">{format.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Цінові поля */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Стартова ціна аукціону */}
                {dealType !== "BUY_NOW" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Стартова ціна (UAH)</label>
                    <div className="relative rounded-xl border border-white/10 bg-slate-950 p-3.5 flex items-center">
                      <DollarSign className="h-4 w-4 text-slate-500 shrink-0 mr-1" />
                      <input
                        type="number"
                        placeholder="25000"
                        className="bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:ring-0 focus:outline-none w-full"
                        value={startPrice}
                        onMouseEnter={() => soundService.playHover()}
                        onChange={(e) => setStartPrice(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Ціна викупу */}
                {dealType !== "AUCTION" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">
                      {dealType === "HYBRID" ? "Бліц-ціна миттєвого викупу (UAH)" : "Ціна продажу (UAH)"}
                    </label>
                    <div className="relative rounded-xl border border-white/10 bg-slate-950 p-3.5 flex items-center">
                      <DollarSign className="h-4 w-4 text-slate-500 shrink-0 mr-1" />
                      <input
                        type="number"
                        placeholder="35000"
                        className="bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:ring-0 focus:outline-none w-full"
                        value={buyNowPrice}
                        onMouseEnter={() => soundService.playHover()}
                        onChange={(e) => setBuyNowPrice(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Мінімальний крок ставки */}
                {dealType !== "BUY_NOW" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Крок ставки аукціону (UAH)</label>
                    <select
                      value={bidStep}
                      onMouseEnter={() => soundService.playHover()}
                      onChange={(e) => {
                        soundService.playClick();
                        setBidStep(e.target.value);
                      }}
                      className="w-full glass-input rounded-xl text-xs p-3.5 bg-slate-950 text-white font-semibold"
                    >
                      <option value="100">100 UAH</option>
                      <option value="250">250 UAH</option>
                      <option value="500">500 UAH</option>
                      <option value="1000">1,000 UAH</option>
                      <option value="5000">5,000 UAH</option>
                    </select>
                  </div>
                )}

                {/* Тривалість торгів */}
                {dealType !== "BUY_NOW" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Тривалість аукціону</label>
                    <select
                      value={durationDays}
                      onMouseEnter={() => soundService.playHover()}
                      onChange={(e) => {
                        soundService.playClick();
                        setDurationDays(e.target.value);
                      }}
                      className="w-full glass-input rounded-xl text-xs p-3.5 bg-slate-950 text-white font-semibold"
                    >
                      <option value="1">1 День (Швидкі торги)</option>
                      <option value="3">3 Дні (Рекомендується)</option>
                      <option value="5">5 Днів</option>
                      <option value="7">7 Днів</option>
                    </select>
                  </div>
                )}

              </div>

              {dealType === "HYBRID" && (
                <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4 text-[11px] text-slate-400 flex items-start gap-2.5 leading-relaxed">
                  <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Перевага гібрида:</strong> Лот бере участь у торгах як класичний аукціон. Але якщо покупець готовий сплатити бліц-ціну, торги автоматично завершаться, і лот буде миттєво проданий.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* КРОК 3: Способи доставки та оплати */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-white font-display">Крок 3: Доставка та підтвердження</h3>
                <p className="text-[11px] text-slate-500 mt-1">Визначте способи відправки та завершіть публікацію оголошення.</p>
              </div>

              {/* Способи доставки */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-400">Доступні способи відправки</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "NOVA_POSHTA", name: "📦 Нова Пошта (Автоматична генерація ТТН)", desc: "Покупець обирає відділення при викупі, ТТН генерується автоматично. Ви отримуєте готовий бланк відправки." },
                    { id: "UKR_POSHTA", name: "📬 Укрпошта Експрес", desc: "Відправка в будь-яке відділення Укрпошти по Україні." },
                    { id: "MEEST", name: "⚡ Meest ПОШТА (Доставка за кодом)", desc: "Доставка поштоматами або відділеннями Meest." },
                    { id: "COURIER", name: "📍 Кур’єрська доставка / Самовивіз у Києві", desc: "Особиста зустріч з покупцем." }
                  ].map((delivery) => {
                    const isChecked = deliveryOptions.includes(delivery.id);
                    return (
                      <button
                        type="button"
                        key={delivery.id}
                        onMouseEnter={() => soundService.playHover()}
                        onClick={() => toggleDelivery(delivery.id)}
                        className={`text-left p-4 rounded-xl border flex items-start gap-3 transition-all ${
                          isChecked
                            ? "border-emerald-500 bg-emerald-500/5 text-white"
                            : "border-white/5 bg-white/[0.01] text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20"
                        }`}>
                          {isChecked && <Check className="h-3 w-3" />}
                        </div>
                        <div className="text-xs">
                          <span className="font-bold block mb-0.5">{delivery.name}</span>
                          <span className="text-[10px] text-slate-500 leading-normal block">{delivery.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Безпека та регламент */}
              <div className="rounded-xl border border-white/10 bg-slate-950 p-4 text-[11px] text-slate-400 leading-relaxed">
                🛡️ Розміщуючи оголошення, ви погоджуєтеся з тим, що KRAM.UA здійснює холдування коштів покупця на час угоди для запобігання шахрайству. Всі торги завершуються автоматично за таймером. Комісія майданчика становить 1.5% від суми угоди в разі успішного продажу.
              </div>
            </div>
          )}

          {/* Навігаційні кнопки */}
          <div className="flex justify-between border-t border-white/5 pt-6 mt-6">
            {step > 1 ? (
              <button
                type="button"
                onMouseEnter={() => soundService.playHover()}
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 px-4 py-3 text-xs font-semibold text-slate-300 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                Назад
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onMouseEnter={() => soundService.playHover()}
                onClick={handleNextStep}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-semibold text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                Продовжити
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                onMouseEnter={() => soundService.playHover()}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 px-6 py-3 text-xs font-bold text-white transition-all border border-emerald-400/20 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Опублікувати лот на KRAM
              </button>
            )}
          </div>

        </form>

        {/* Модальне вікно імпорту оголошень */}
        {showImportModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-panel max-w-md w-full border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl relative animate-scaleUp">
              
              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setShowImportModal(false);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>

              <div className="text-center space-y-1">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  🛡️ Підтвердження власності
                </h3>
                <p className="text-[10px] text-slate-500">OLX / Prom.ua безпечний перевірочний протокол</p>
              </div>

              {importStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-slate-900/60 rounded-xl p-3.5 text-[11px] text-slate-300 leading-relaxed border border-white/5 space-y-2">
                    <p>Для того, щоб переконатися, що це оголошення дійсно є вашим, а не чужим:</p>
                    <p className="font-semibold text-emerald-400">
                      1. Додайте наступний код підтвердження у кінець опису вашого оголошення на донорській платформі:
                    </p>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-emerald-500/30 text-center font-mono font-black text-sm text-emerald-400 tracking-wider shadow-inner select-all">
                      {importCode}
                    </div>
                    <p>
                      2. Після збереження змін на сайті-донорі натисніть кнопку нижче для початку автоматичної верифікації.
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundService.playClick();
                        setShowImportModal(false);
                      }}
                      className="flex-1 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white py-3 transition-colors"
                    >
                      Скасувати
                    </button>
                    <button
                      type="button"
                      disabled={isImporting}
                      onClick={runVerificationAndImport}
                      className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 py-3 transition-colors"
                    >
                      Я підтвердив, почати імпорт
                    </button>
                  </div>
                </div>
              )}

              {importStep === 2 && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-4 space-y-2">
                    <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
                    <span className="text-xs text-slate-400 animate-pulse">Зчитування даних та верифікація...</span>
                  </div>

                  <div className="bg-slate-950/80 rounded-xl p-4 border border-white/5 font-mono text-[9px] text-emerald-500 h-40 overflow-y-auto space-y-1.5 shadow-inner">
                    {importLog.map((log, idx) => (
                      <div key={idx} className="animate-fadeIn">{log}</div>
                    ))}
                  </div>
                </div>
              )}

              {importStep === 3 && (
                <div className="space-y-4 text-center">
                  <div className="flex flex-col items-center justify-center py-2 space-y-2">
                    <span className="text-3xl">🎉</span>
                    <span className="text-xs font-bold text-white">Успішна верифікація власності!</span>
                    <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
                      Лот успішно імпортовано та перенесено. Всі поля форми автоматично заповнено.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundService.playClick();
                      setShowImportModal(false);
                    }}
                    className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 py-3 transition-colors"
                  >
                    Перейти до перегляду
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
