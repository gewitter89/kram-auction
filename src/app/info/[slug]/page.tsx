import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Scale, Truck, AlertCircle, ArrowLeft } from "lucide-react";

const CONTENT_MAP: Record<string, { title: string; icon: any; content: React.ReactNode }> = {
  "security": {
    title: "Безпечна угода KRAM",
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p><strong>Безпечна угода</strong> — це механізм, який гарантує безпеку як для покупця, так і для продавця.</p>
        <p>Гроші покупця блокуються (депонуються) на транзитному рахунку платформи KRAM до моменту, поки покупець не отримає та не перевірить товар у відділенні пошти.</p>
        <ul className="list-disc pl-5 space-y-2 text-emerald-400">
          <li>100% захист від шахрайства.</li>
          <li>Гроші переказуються продавцю лише після підтвердження отримання посилки.</li>
          <li>Якщо товар не підійшов — гроші автоматично повертаються на картку покупця.</li>
        </ul>
      </div>
    )
  },
  "moderation": {
    title: "Чат-модерація контактів",
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>Усі повідомлення на платформі KRAM.UA проходять автоматичну фільтрацію за допомогою AI для захисту користувачів від шахрайства.</p>
        <p>Система автоматично розпізнає спроби передачі номерів телефонів, посилань на інші месенджери (Telegram, Viber) або реквізитів карток, і приховує їх, видаючи попередження користувачу.</p>
        <p className="text-amber-400 font-bold">Ніколи не погоджуйтесь на оплату поза платформою KRAM!</p>
      </div>
    )
  },
  "verified-sellers": {
    title: "Перевірені продавці",
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>Щоб продавати на KRAM.UA, кожен продавець повинен пройти процедуру верифікації (KYC).</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Підтвердження номеру телефону.</li>
          <li>Прив'язка банківської картки (з підтвердженням особи власника).</li>
          <li>Завантаження скан-копій документів (Паспорт/ID).</li>
        </ul>
        <p>Усі верифіковані продавці отримують значок ⭐ та підвищений ліміт на проведення угод.</p>
      </div>
    )
  },
  "escrow": {
    title: "Депонування коштів (Escrow)",
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>Ми використовуємо захищені фінансові шлюзи (Stripe / LiqPay) для тимчасового зберігання коштів.</p>
        <p>Коли ви робите ставку, кошти <strong>не списуються</strong> (списується лише гарантійний внесок, якщо він передбачений).</p>
        <p>При викупі лоту через "Купити зараз", кошти перераховуються на рахунок Escrow, і продавець бачить, що товар оплачений. Тільки після огляду посилки кошти зараховуються продавцю.</p>
      </div>
    )
  },
  "nova-poshta": {
    title: "Нова Пошта (Авто-ТТН)",
    icon: Truck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>KRAM.UA має повну інтеграцію з API Нової Пошти.</p>
        <p>Оформлюючи покупку, електронна накладна (ТТН) створюється автоматично. Продавцю достатньо просто принести товар у відділення та назвати номер ТТН.</p>
        <p className="text-emerald-400 font-bold">Статус доставки оновлюється на платформі в режимі реального часу.</p>
      </div>
    )
  },
  "ukrposhta": {
    title: "Укрпошта Експрес",
    icon: Truck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>Доставка Укрпоштою підтримується для економних відправлень та міжнародних пересилок.</p>
        <p>Так само діє система "Безпечна угода" за умови використання післяплати від Укрпошти.</p>
      </div>
    )
  },
  "meest": {
    title: "Meest ПОШТА",
    icon: Truck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>Альтернативний оператор доставки з великою мережею поштоматів та міні-відділень у магазинах-партнерах.</p>
      </div>
    )
  },
  "pickup": {
    title: "Пункти самовивозу",
    icon: Truck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>Для габаритних лотів (наприклад, автомобілі, нерухомість) доступна опція "Самовивіз".</p>
        <p>Гроші переводяться продавцю після того, як покупець підтверджує передачу товару через спеціальний код або акт прийому-передачі в особистому кабінеті.</p>
      </div>
    )
  },
  "terms": {
    title: "Угода користувача",
    icon: Scale,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>Ця угода регулює відносини між Користувачем та адміністрацією KRAM.UA.</p>
        <p>Користуючись платформою, ви зобов'язуєтесь не розміщувати заборонені товари (зброя, наркотики тощо) та вести торги добросовісно.</p>
        <p>Порушення правил призводить до перманентного блокування акаунта без права відновлення.</p>
      </div>
    )
  },
  "bidding": {
    title: "Правила проведення торгів",
    icon: Scale,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <ul className="list-disc pl-5 space-y-2">
          <li>Ставка є офіційним зобов'язанням викупити лот.</li>
          <li>Скасувати ставку неможливо.</li>
          <li>Якщо ставка зроблена менш ніж за 5 хвилин до кінця аукціону, час завершення автоматично продовжується на 5 хвилин (Anti-Sniper).</li>
          <li>У разі відмови від викупу лоту переможцем, він отримує штраф, а лот переходить до попереднього учасника.</li>
        </ul>
      </div>
    )
  },
  "fees": {
    title: "Тарифи та комісії майданчика",
    icon: Scale,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>KRAM.UA стягує комісію виключно за успішні продажі.</p>
        <ul className="list-disc pl-5 space-y-2 text-emerald-400">
          <li><strong>Публікація лоту:</strong> Безкоштовно</li>
          <li><strong>Базова комісія продажу:</strong> 2.5% від фінальної суми угоди</li>
          <li><strong>Преміум просування:</strong> від 100 UAH</li>
        </ul>
      </div>
    )
  },
  "support": {
    title: "Служба підтримки (24/7)",
    icon: AlertCircle,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>Якщо у вас виникли проблеми з платформою, оплатою або шахраями, зверніться до нашої служби підтримки.</p>
        <p className="font-bold text-emerald-400">Email: support@kram.ua</p>
        <p className="font-bold text-sky-400">Telegram: @kram_support</p>
      </div>
    )
  },
};

export default function InfoPage({ params }: { params: { slug: string } }) {
  const contentData = CONTENT_MAP[params.slug];

  if (!contentData) {
    notFound();
  }

  const Icon = contentData.icon;

  return (
    <div className="flex flex-col min-h-screen bg-[#030712]">
      <Navbar />
      
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 flex flex-col">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors mb-8 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          На головну
        </Link>
        
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl">
          {/* Декоративний фон */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
              <div className="bg-slate-900 border border-white/10 p-3 rounded-2xl">
                <Icon className="h-8 w-8 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-black text-white font-display tracking-tight">
                {contentData.title}
              </h1>
            </div>
            
            <div className="prose prose-invert prose-emerald max-w-none">
              {contentData.content}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
