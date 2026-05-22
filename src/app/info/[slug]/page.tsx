import React from 'react';
import { notFound } from 'next/navigation';
import { Gem, ShieldCheck, Truck, Scale, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const pageContent: Record<string, { title: string; icon: React.ReactNode; content: React.ReactNode }> = {
  'security': {
    title: 'Безпечна угода KRAM',
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    content: (
      <div className="space-y-4 text-slate-300">
        <p>KRAM забезпечує найвищий рівень безпеки для кожної транзакції завдяки інтеграції з передовими платіжними шлюзами та власному антифрод-модулю.</p>
        <h3 className="text-lg font-bold text-white mt-6 mb-2">Як це працює:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Гроші покупця резервуються на транзитному рахунку.</li>
          <li>Продавець відправляє товар.</li>
          <li>Покупець оглядає товар у відділенні пошти.</li>
          <li>Тільки після успішного огляду кошти зараховуються продавцю.</li>
        </ul>
        <p className="mt-4">У разі відмови від товару, кошти миттєво повертаються на картку покупця, а товар відправляється назад.</p>
      </div>
    )
  },
  'moderation': {
    title: 'Чат-модерація контактів',
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    content: (
      <div className="space-y-4 text-slate-300">
        <p>Для захисту від шахрайства наша система автоматично модерує всі повідомлення в чатах.</p>
        <p>Спроби передати зовнішні посилання на фішингові сайти оплати, номери телефонів для обходу платформи або інші підозрілі дані миттєво блокуються.</p>
      </div>
    )
  },
  'verified-sellers': {
    title: 'Перевірені продавці',
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    content: (
      <div className="space-y-4 text-slate-300">
        <p>Усі продавці на платформі KRAM проходять обов'язкову верифікацію особи через BankID або Дію.</p>
        <p>Це гарантує, що ви укладаєте угоду з реальною людиною, а історія її торгів та відгуки є достовірними.</p>
      </div>
    )
  },
  'escrow': {
    title: 'Депонування коштів',
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    content: (
      <div className="space-y-4 text-slate-300">
        <p>Депонування коштів — це механізм утримання платежу до моменту виконання зобов'язань обома сторонами.</p>
        <p>Ваші гроші знаходяться у повній безпеці на рахунках фінансового партнера KRAM до моменту успішного завершення угоди.</p>
      </div>
    )
  },
  'nova-poshta': {
    title: 'Нова Пошта (Авто-ТТН)',
    icon: <Truck className="w-6 h-6 text-emerald-400" />,
    content: (
      <div className="space-y-4 text-slate-300">
        <p>KRAM повністю інтегрований з API Нової Пошти.</p>
        <p>Після оплати лота автоматично генерується ЕТН (Електронна Товарно-Транспортна Накладна), яку продавець відразу бачить у своєму кабінеті.</p>
        <p>Статус доставки оновлюється в реальному часі.</p>
      </div>
    )
  },
  'ukrposhta': {
    title: 'Укрпошта Експрес',
    icon: <Truck className="w-6 h-6 text-emerald-400" />,
    content: (
      <div className="space-y-4 text-slate-300">
        <p>Доставка Укрпоштою — це доступний та надійний спосіб отримати свій лот у будь-якому куточку країни.</p>
        <p>Терміни доставки складають від 2 до 5 робочих днів залежно від регіону.</p>
      </div>
    )
  },
  'meest': {
    title: 'Meest ПОШТА',
    icon: <Truck className="w-6 h-6 text-emerald-400" />,
    content: (
      <div className="space-y-4 text-slate-300">
        <p>Отримуйте відправлення швидко та зручно у поштоматах та відділеннях Meest по всій Україні.</p>
      </div>
    )
  },
  'pickup': {
    title: 'Пункти самовивозу',
    icon: <Truck className="w-6 h-6 text-emerald-400" />,
    content: (
      <div className="space-y-4 text-slate-300">
        <p>Для габаритних лотів або лотів у вашому місті доступна опція самовивозу за попередньою домовленістю сторін.</p>
        <p>Зверніть увагу: при самовивозі рекомендуємо ретельно оглядати товар перед підтвердженням завершення угоди в системі.</p>
      </div>
    )
  },
  'terms': {
    title: 'Угода користувача',
    icon: <Scale className="w-6 h-6 text-emerald-400" />,
    content: (
      <div className="space-y-4 text-slate-300">
        <p>Використовуючи платформу KRAM, ви погоджуєтесь з цими умовами надання послуг.</p>
        <p>Платформа надає послуги проведення електронних аукціонів та гарантування безпеки угод між користувачами.</p>
      </div>
    )
  },
  'bidding': {
    title: 'Правила проведення торгів',
    icon: <Scale className="w-6 h-6 text-emerald-400" />,
    content: (
      <div className="space-y-4 text-slate-300">
        <p>Усі ставки на платформі KRAM є остаточними та не підлягають скасуванню.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Переможцем аукціону стає учасник, який запропонував найвищу ціну на момент завершення торгів.</li>
          <li>Переможець зобов'язаний оплатити лот протягом 24 годин.</li>
          <li>У разі неоплати акаунт переможця може бути заблокований, а лот передається попередньому учаснику.</li>
        </ul>
      </div>
    )
  },
  'fees': {
    title: 'Тарифи та комісії майданчика',
    icon: <Scale className="w-6 h-6 text-emerald-400" />,
    content: (
      <div className="space-y-4 text-slate-300">
        <p>KRAM працює за прозорою моделлю монетизації.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Реєстрація та участь в аукціонах — <strong>безкоштовно</strong>.</li>
          <li>Публікація лотів на етапі Beta-тестування — <strong>0% комісії</strong>.</li>
          <li>Комісія платіжного шлюзу (LiqPay) сплачується покупцем при переказі коштів згідно з тарифами банку.</li>
        </ul>
      </div>
    )
  },
  'support': {
    title: 'Служба підтримки (24/7)',
    icon: <Scale className="w-6 h-6 text-emerald-400" />,
    content: (
      <div className="space-y-4 text-slate-300">
        <p>Наша служба підтримки працює цілодобово, щоб допомогти вам вирішити будь-які питання.</p>
        <p>Ви можете звернутися до нас через Telegram-бота @kram_auction_bot або написати на електронну пошту support@kram.ua.</p>
      </div>
    )
  }
};

export default function InfoPage({ params }: { params: { slug: string } }) {
  const data = pageContent[params.slug];

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0B1220] py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-8 font-mono">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Головна</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-400">Інформація</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-emerald-500">{data.title}</span>
        </div>

        {/* Content Box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              {data.icon}
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
              {data.title}
            </h1>
          </div>

          <div className="prose prose-invert prose-emerald max-w-none">
            {data.content}
          </div>
        </div>

        {/* Return Button */}
        <div className="mt-8">
          <Link href="/" className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all">
            Повернутися на головну
          </Link>
        </div>
      </div>
    </div>
  );
}
