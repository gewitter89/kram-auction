import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Scale, Truck, AlertCircle, ArrowLeft } from "lucide-react";

const DIRECT_NOTICE = (
  <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-200">
    KRAM.UA — безкоштовна інформаційна платформа. Ми не приймаємо оплату, не утримуємо кошти, не є продавцем, покупцем, escrow-сервісом, банком, брокером або платіжним/фінансовим посередником.
  </p>
);

const CONTENT_MAP: Record<string, { title: string; icon: any; content: React.ReactNode }> = {
  "security": {
    title: "Правила безпечної домовленості",
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        {DIRECT_NOTICE}
        <p><strong>Безпечна домовленість</strong> на KRAM — це прозорий контакт між покупцем і продавцем без платежів через платформу.</p>
        <ul className="list-disc pl-5 space-y-2 text-emerald-400">
          <li>Обговорюйте умови в чаті KRAM, щоб зберегти історію домовленостей.</li>
          <li>Перевіряйте товар до оплати, користуйтеся післяплатою або оглядом у відділенні перевізника.</li>
          <li>Не надсилайте передоплату незнайомим користувачам, якщо не впевнені у ризиках.</li>
          <li>Поскаржтеся на підозрілий профіль — ми можемо обмежити доступ до платформи.</li>
        </ul>
      </div>
    )
  },
  "moderation": {
    title: "Чат-модерація контактів",
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>Чат KRAM допомагає зберігати контекст домовленостей та зменшує ризик шахрайства.</p>
        <p>Ми можемо попереджати про підозрілі повідомлення, фішингові посилання або спроби тиску на користувача.</p>
        <p className="text-amber-400 font-bold">Не переходьте за підозрілими посиланнями і не передавайте коди банку, CVV або паролі.</p>
      </div>
    )
  },
  "verified-sellers": {
    title: "Перевірені профілі",
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>Верифікація профілю — це сигнал довіри для інших користувачів, а не фінансова гарантія від KRAM.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Підтвердження email або облікового запису Google.</li>
          <li>Історія активності на платформі.</li>
          <li>Можливість швидше реагувати на скарги та спірні ситуації.</li>
        </ul>
      </div>
    )
  },
  "escrow": {
    title: "Без платежів через KRAM",
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        {DIRECT_NOTICE}
        <p>На старті KRAM працює як безкоштовна beta-платформа для оголошень, ставок і прямих домовленостей.</p>
        <p>Кнопки “домовитися” або “ставка” не списують гроші, не блокують кошти і не створюють платіжного зобов’язання перед KRAM.</p>
        <p>Оплату, доставку, повернення та передачу товару покупець і продавець погоджують самостійно.</p>
      </div>
    )
  },
  "nova-poshta": {
    title: "Нова Пошта",
    icon: Truck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>KRAM може допомагати зберігати інформацію про бажаний спосіб доставки, але не є стороною доставки.</p>
        <p>Умови відправлення, післяплати, огляду товару та оплати послуг перевізника сторони погоджують напряму.</p>
      </div>
    )
  },
  "ukrposhta": {
    title: "Укрпошта Експрес",
    icon: Truck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>Укрпошта може використовуватись для економних відправлень та міжнародних пересилок.</p>
        <p>Перед відправленням погодьте з іншою стороною оплату доставки, огляд і порядок повернення.</p>
      </div>
    )
  },
  "meest": {
    title: "Meest ПОШТА",
    icon: Truck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>Альтернативний оператор доставки з мережею поштоматів та міні-відділень.</p>
      </div>
    )
  },
  "pickup": {
    title: "Самовивіз",
    icon: Truck,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>Для габаритних товарів або локальних угод сторони можуть домовитися про самовивіз.</p>
        <p>Обирайте безпечне місце зустрічі, перевіряйте товар до оплати та не передавайте зайву персональну інформацію.</p>
      </div>
    )
  },
  "terms": {
    title: "Угода користувача",
    icon: Scale,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        {DIRECT_NOTICE}
        <p>Користувачі самостійно відповідають за достовірність оголошень, законність товарів, домовленості, оплату, доставку та виконання своїх зобов’язань.</p>
        <p>KRAM може модерувати контент, обмежувати доступ порушників і допомагати з комунікацією, але не гарантує результат угоди.</p>
        <p>Заборонено розміщувати нелегальні товари, вводити інших користувачів в оману або використовувати платформу для шахрайства.</p>
      </div>
    )
  },
  "bidding": {
    title: "Правила ставок",
    icon: Scale,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>Ставка на KRAM — це публічний намір домовитися щодо лота за вказаною ціною. Вона не блокує гроші і не проводить платіж через KRAM.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Ставте лише тоді, коли реально готові обговорювати покупку.</li>
          <li>Фінальні умови оплати та доставки підтверджуйте з продавцем напряму.</li>
          <li>Уникайте передоплат без перевірки товару та продавця.</li>
        </ul>
      </div>
    )
  },
  "fees": {
    title: "Безкоштовна beta",
    icon: Scale,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>KRAM.UA зараз працює безкоштовно для покупців і продавців.</p>
        <ul className="list-disc pl-5 space-y-2 text-emerald-400">
          <li><strong>Публікація лоту:</strong> 0 UAH</li>
          <li><strong>Ставки та домовленості:</strong> 0 UAH</li>
          <li><strong>Комісія KRAM з продажу:</strong> 0%</li>
        </ul>
        <p>Якщо правила монетизації колись зміняться, вони мають бути прямо описані до запуску будь-яких платних функцій.</p>
      </div>
    )
  },
  "support": {
    title: "Служба підтримки",
    icon: AlertCircle,
    content: (
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>Якщо у вас виникли проблеми з профілем, оголошенням або підозрілою поведінкою іншого користувача, зверніться до підтримки.</p>
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
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors mb-8 w-fit">
          <ArrowLeft className="h-4 w-4" />
          На головну
        </Link>
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
              <div className="bg-slate-900 border border-white/10 p-3 rounded-2xl">
                <Icon className="h-8 w-8 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-black text-white font-display tracking-tight">{contentData.title}</h1>
            </div>
            <div className="prose prose-invert prose-emerald max-w-none">{contentData.content}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
