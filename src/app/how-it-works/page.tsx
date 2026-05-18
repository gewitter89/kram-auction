import { Footer } from '@/components/layout/Footer'
import { AlertTriangle, Gavel, PlusCircle, ShieldAlert, Truck } from 'lucide-react'

export const metadata = {
  title: 'Як це працює | KRAM',
  description: 'Дізнайтеся, як безпечно купувати, продавати та брати участь в аукціонах KRAM.',
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[800px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FEF3C7] border border-[#F59E0B]/20 rounded-full mb-4">
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
            <span className="text-[12px] font-medium text-[#D97706]">Beta-версія платформи</span>
          </div>
          <h1 className="text-[32px] font-bold text-[#0B1220] mb-4">Як це працює</h1>
          <p className="text-[#64748B]">
            Покроковий посібник для продавців та покупців маркетплейсу KRAM.
          </p>
        </div>

        {/* Honest Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10 text-amber-900 text-[15px] leading-relaxed">
          <strong>Чесний бета-запуск:</strong> Наша мета — створити прозорі та безпечні онлайн-торги в Україні. Зараз ми проводимо бета-тестування інтерфейсу та сповіщень. Реальна платіжна модель із заморожуванням коштів (Escrow) підключається окремим етапом. Усі транзакції на даному етапі координуються статусами та ручними підтвердженнями сторін.
        </div>

        <div className="space-y-12">
          {/* Sellers */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <PlusCircle className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[22px] font-bold text-[#0B1220]">Для продавців</h2>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[13px] font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-[#0F172A] text-[15px] mb-1">Створіть лот безкоштовно</h4>
                  <p className="text-[#64748B] text-[14px]">Додайте фотографії, детальний опис, виберіть стартову ціну та тривалість аукціону. Для перших лотів діє акція — 0% комісії.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[13px] font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-[#0F172A] text-[15px] mb-1">Отримуйте живі ставки</h4>
                  <p className="text-[#64748B] text-[14px]">Покупці торгуються в прямому ефірі. Ви та лідери ставок миттєво отримуєте Telegram-сповіщення при зміні ціни.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[13px] font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-[#0F172A] text-[15px] mb-1">Додайте ТТН після підтвердження</h4>
                  <p className="text-[#64748B] text-[14px]">Після завершення торгів та підтвердження отримання оплати покупцем надішліть товар через Нову Пошту та вкажіть трекінг-код у системі.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Buyers */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Gavel className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[22px] font-bold text-[#0B1220]">Для покупців</h2>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[13px] font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-[#0F172A] text-[15px] mb-1">Робіть ставки</h4>
                  <p className="text-[#64748B] text-[14px]">Знайдіть потрібний товар у каталозі та зробіть ставку або скористайтеся кнопкою швидкої покупки. Кожна ставка є остаточною та зобов'язуючою.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[13px] font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-[#0F172A] text-[15px] mb-1">Сплатіть лот у разі перемоги</h4>
                  <p className="text-[#64748B] text-[14px]">Після закінчення аукціону переможець погоджує доставку та підтверджує безпечний платіж.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[13px] font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-[#0F172A] text-[15px] mb-1">Перевірте та заберіть товар</h4>
                  <p className="text-[#64748B] text-[14px]">При отриманні посилки у відділенні Нової Пошти огляньте товар. Якщо все в порядку, підтвердьте завершення угоди. У разі проблем — відкрийте спір.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Safety rules */}
          <section className="bg-slate-50 border border-[#E2E8F0] rounded-2xl p-6">
            <h3 className="font-bold text-[#0F172A] text-[16px] flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-amber-500" /> Основні правила безпеки
            </h3>
            <ul className="list-disc pl-5 text-[14px] text-[#475569] space-y-2">
              <li>Ніколи не переходьте за сторонніми посиланнями для оплати. Усі статуси угод відображаються виключно у вашому кабінеті KRAM.</li>
              <li>Спілкуйтеся лише у вбудованому чаті KRAM, щоб у разі спірних ситуацій підтримка могла захистити ваші інтереси.</li>
              <li>Оглядайте дорогі посилки (особливо техніку) безпосередньо у відділенні пошти.</li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
