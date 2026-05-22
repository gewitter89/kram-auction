"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { apiService } from "@/lib/api-service";
import { MockCategory } from "@/lib/db";
import { 
  Laptop, 
  Gem, 
  Watch, 
  Car, 
  Palette, 
  Building,
  Image as ImageIcon,
  Check,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Info,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";

export default function SellPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<MockCategory[]>([]);
  const [step, setStep] = useState(1);

  // Состояния полей формы
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

  // Проверка авторизации
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
    setCategories(apiService.getCategories());
  }, [user, router]);

  const handleAddImageUrl = () => {
    if (imageInput.trim() !== "") {
      setImages([...images, imageInput.trim()]);
      setImageInput("");
    }
  };

  const handleQuickAddImage = (url: string) => {
    setImages([...images, url]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleDelivery = (opt: string) => {
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
        alert("Пожалуйста, заполните название, описание, категорию и добавьте хотя бы 1 изображение!");
        return;
      }
    }
    if (step === 2) {
      if (dealType === "AUCTION" && (!startPrice || !bidStep)) {
        alert("Заполните стартовую цену и шаг ставки!");
        return;
      }
      if (dealType === "BUY_NOW" && !buyNowPrice) {
        alert("Заполните цену выкупа (Блиц)!");
        return;
      }
      if (dealType === "HYBRID" && (!startPrice || !buyNowPrice || !bidStep)) {
        alert("Пожалуйста, укажите стартовую цену, цену выкупа и шаг ставки!");
        return;
      }
      if (dealType === "HYBRID" && parseFloat(buyNowPrice) <= parseFloat(startPrice)) {
        alert("Цена мгновенного выкупа (Блиц) должна быть выше стартовой цены аукциона!");
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Формируем дату завершения
    const endDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * parseInt(durationDays)).toISOString();

    const newListing = apiService.createListing({
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

    // Запускаем праздничное конфетти
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    // Оповещаем пользователя
    apiService.addNotification(
      user.id,
      `Вы успешно создали объявление "${title}"! Статус: Активно.`,
      "INFO"
    );

    alert("🎉 Поздравляем! Ваш лот успешно опубликован на KRAM.UA!");
    router.push("/");
  };

  // Предопределенные заглушки красивых товаров на выбор
  const imagePresets = [
    { name: "Швейцарские часы", url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600" },
    { name: "iPhone 15 Pro", url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600" },
    { name: "Ноутбук Apple Macbook", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600" },
    { name: "Золотые монеты", url: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600" },
    { name: "Элитное авто", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600" },
    { name: "Картина маслом", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#030712]">
      <Navbar />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Заголовок */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/25 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Бесплатное размещение лота
          </span>
          <h1 className="text-3xl font-extrabold text-white font-display">Разместить лот на KRAM</h1>
          <p className="text-xs text-slate-400 mt-2">
            Создайте лот за 3 простых шага с адаптивными параметрами продажи
          </p>
        </div>

        {/* Шкала шагов (Progress Indicator) */}
        <div className="mb-10 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0" />
          <div className="relative z-10 flex justify-between">
            {[
              { num: 1, label: "Описание" },
              { num: 2, label: "Формат и Цена" },
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

        {/* Тело формы */}
        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-white/5 space-y-8 shadow-xl">

          {/* ШАГ 1: Описание, Категория, Картинки */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-white font-display">Шаг 1: Основная информация лота</h3>
                <p className="text-[11px] text-slate-500 mt-1">Опишите ваш товар детально, чтобы привлечь больше потенциальных покупателей.</p>
              </div>

              {/* Название */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Название лота</label>
                <input
                  type="text"
                  placeholder="Например: Apple Watch Ultra 2 Titanium"
                  className="w-full glass-input rounded-xl text-xs p-3.5"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Категория */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Категория каталога</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
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

              {/* Описание */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Описание состояния и характеристик</label>
                <textarea
                  rows={5}
                  placeholder="Опишите состояние товара, дефекты (если есть), комплектацию и условия отправки..."
                  className="w-full glass-input rounded-xl text-xs p-3.5 leading-relaxed"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Картинки */}
              <div className="space-y-4">
                <label className="text-xs font-semibold text-slate-400">Фотографии товара</label>
                
                {/* Список загруженных */}
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
                          Удалить
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Добавить URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Вставьте ссылку на изображение товара..."
                    className="flex-grow glass-input rounded-xl text-xs px-3.5 py-3"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 px-4 text-xs font-semibold text-white transition-all shrink-0"
                  >
                    Добавить
                  </button>
                </div>

                {/* Быстрые пресеты для тестирования */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 block">Быстрые демо-картинки (выберите одну для теста):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {imagePresets.map((preset, pIdx) => (
                      <button
                        type="button"
                        key={pIdx}
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

          {/* ШАГ 2: Формат сделки, Цена */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-white font-display">Шаг 2: Формат сделки и ценообразование</h3>
                <p className="text-[11px] text-slate-500 mt-1">Выберите как именно вы хотите продать этот товар.</p>
              </div>

              {/* Выбор формата продажи */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-400">Формат продажи</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "HYBRID", title: "💎 Гибридный лот", desc: "Аукцион с возможностью мгновенного выкупа (Блиц)" },
                    { id: "AUCTION", title: "🔨 Чистый аукцион", desc: "Побеждает максимальная ставка на момент окончания" },
                    { id: "BUY_NOW", title: "⚡ Фиксированная цена", desc: "Быстрая продажа без торгов и таймеров ставок" }
                  ].map((format) => (
                    <button
                      type="button"
                      key={format.id}
                      onClick={() => setDealType(format.id as any)}
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

              {/* Ценовые поля */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Стартовая цена аукциона */}
                {dealType !== "BUY_NOW" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Стартовая цена (UAH)</label>
                    <div className="relative rounded-xl border border-white/10 bg-slate-950 p-3.5 flex items-center">
                      <DollarSign className="h-4 w-4 text-slate-500 shrink-0 mr-1" />
                      <input
                        type="number"
                        placeholder="25000"
                        className="bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:ring-0 focus:outline-none w-full"
                        value={startPrice}
                        onChange={(e) => setStartPrice(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Цена выкупа */}
                {dealType !== "AUCTION" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">
                      {dealType === "HYBRID" ? "Блиц-цена мгновенного выкупа (UAH)" : "Цена продажи (UAH)"}
                    </label>
                    <div className="relative rounded-xl border border-white/10 bg-slate-950 p-3.5 flex items-center">
                      <DollarSign className="h-4 w-4 text-slate-500 shrink-0 mr-1" />
                      <input
                        type="number"
                        placeholder="35000"
                        className="bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:ring-0 focus:outline-none w-full"
                        value={buyNowPrice}
                        onChange={(e) => setBuyNowPrice(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Минимальный шаг ставки */}
                {dealType !== "BUY_NOW" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Шаг ставки аукциона (UAH)</label>
                    <select
                      value={bidStep}
                      onChange={(e) => setBidStep(e.target.value)}
                      className="w-full glass-input rounded-xl text-xs p-3.5 bg-slate-950 text-white"
                    >
                      <option value="100">100 UAH</option>
                      <option value="250">250 UAH</option>
                      <option value="500">500 UAH</option>
                      <option value="1000">1,000 UAH</option>
                      <option value="5000">5,000 UAH</option>
                    </select>
                  </div>
                )}

                {/* Продолжительность торгов */}
                {dealType !== "BUY_NOW" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Продолжительность аукциона</label>
                    <select
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      className="w-full glass-input rounded-xl text-xs p-3.5 bg-slate-950 text-white"
                    >
                      <option value="1">1 День (Быстрые торги)</option>
                      <option value="3">3 Дня (Рекомендуется)</option>
                      <option value="5">5 Дней</option>
                      <option value="7">7 Дней</option>
                    </select>
                  </div>
                )}

              </div>

              {dealType === "HYBRID" && (
                <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4 text-[11px] text-slate-400 flex items-start gap-2.5 leading-relaxed">
                  <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Преимущество гибрида:</strong> Лот участвует в торгах как классический аукцион. Но если покупатель будет готов заплатить блиц-цену, торги автоматически завершатся, и лот будет мгновенно продан ему.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ШАГ 3: Способы доставки и оплаты */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-white font-display">Шаг 3: Доставка и подтверждение</h3>
                <p className="text-[11px] text-slate-500 mt-1">Определите способы отправки и завершите публикацию объявления.</p>
              </div>

              {/* Способы доставки */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-400">Доступные способы отправки</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "NOVA_POSHTA", name: "📦 Новая Почта (Автоматическая генерация ТТН)", desc: "Покупатель выбирает отделение в корзине, ТТН генерируется автоматически. Вы получаете готовый бланк отправки." },
                    { id: "UKR_POSHTA", name: "📬 Укрпочта Экспресс", desc: "Отправка в любое отделение Укрпочты по Украине." },
                    { id: "MEEST", name: "⚡ Meest ПОШТА (Доставка по коду)", desc: "Доставка почтоматами или отделениями Meest." },
                    { id: "COURIER", name: "📍 Курьерская доставка / Самовывоз в Киеве", desc: "Личная встреча с покупателем." }
                  ].map((delivery) => {
                    const isChecked = deliveryOptions.includes(delivery.id);
                    return (
                      <button
                        type="button"
                        key={delivery.id}
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

              {/* Безопасность и регламент */}
              <div className="rounded-xl border border-white/10 bg-slate-950 p-4 text-[11px] text-slate-400 leading-relaxed">
                🛡️ Размещая объявление, вы соглашаетесь с тем, что KRAM.UA осуществляет холдирование средств покупателя на время сделки для предотвращения мошенничества. Все торги завершаются автоматически по таймеру. Комиссия площадки составляет 1.5% от суммы сделки в случае успешной продажи.
              </div>
            </div>
          )}

          {/* Навигационные кнопки */}
          <div className="flex justify-between border-t border-white/5 pt-6 mt-6">
            {step > 1 ? (
              <button
                type="button"
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
                onClick={handleNextStep}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-semibold text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                Продолжить
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 px-6 py-3 text-xs font-bold text-white transition-all border border-emerald-400/20 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Опубликовать лот на KRAM
              </button>
            )}
          </div>

        </form>

      </main>

      <Footer />
    </div>
  );
}
