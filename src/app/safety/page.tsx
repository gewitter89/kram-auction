import { Footer } from '@/components/layout/Footer'
import { ShieldCheck, AlertTriangle, MessageCircle, XCircle, Truck, Info, Phone } from 'lucide-react'

export const metadata = {
  title: 'Безпека на KRAM | KRAM',
  description: 'Поради та правила безпечних прямих угод на українській beta-платформі KRAM',
}

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[800px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full mb-4">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[12px] font-medium text-[#2563EB]">Ваша безпека — наш пріоритет</span>
          </div>
          <h1 className="text-[32px] font-bold text-[#0B1220] mb-4">Посібник з безпечних домовленостей KRAM</h1>
          <p className="text-[#64748B] text-lg">
            Як захистити себе та здійснити успішну домовленість напряму
          </p>
        </div>

        {/* Safety Principles */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:shadow-card transition-all">
            <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center mb-4">
              <Info className="w-6 h-6 text-[#2563EB]" />
            </div>
            <h3 className="font-bold text-[#0B1220] mb-2 text-[15px]">Прямі розрахунки</h3>
            <p className="text-[13px] text-[#64748B] leading-relaxed">
              KRAM не приймає оплату та не зберігає кошти. Розрахунки здійснюються безпосередньо між сторонами.
            </p>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:shadow-card transition-all">
            <div className="w-12 h-12 bg-[#ECFDF5] rounded-xl flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-[#10B981]" />
            </div>
            <h3 className="font-bold text-[#0B1220] mb-2 text-[15px]">Тільки післяплата</h3>
            <p className="text-[13px] text-[#64748B] leading-relaxed">
              Наполегливо рекомендуємо оплату при отриманні на пошті (після огляду лота у відділенні).
            </p>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:shadow-card transition-all">
            <div className="w-12 h-12 bg-[#FFF7ED] rounded-xl flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-[#F97316]" />
            </div>
            <h3 className="font-bold text-[#0B1220] mb-2 text-[15px]">Чат на платформі</h3>
            <p className="text-[13px] text-[#64748B] leading-relaxed">
              Спілкуйтесь та узгоджуйте деталі у чаті KRAM для збереження історії переписки.
            </p>
          </div>
        </div>

        {/* Red Flags */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-900 mb-3 text-[15px]">Ознаки підозрілих пропозицій — будьте обережні!</h3>
              <ul className="space-y-2 text-red-800 text-[14px]">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                  <span>Вимагання повної передоплати на картку до відправлення товару.</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                  <span>Продавець наполегливо просить перейти у Telegram або Viber для обговорення.</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                  <span>Відмова надіслати посилку Новою Поштою з післяплатою (накладеним платежем).</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                  <span>Покупець пропонує сплатити за лот через сумнівні посилання або сторонні платіжні форми.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">Як правильно здійснити пряму угоду</h2>
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold shrink-0 text-[13px]">1</div>
                  <div>
                    <h4 className="font-bold text-[#0B1220] mb-1 text-[14px]">Оформлення запиту</h4>
                    <p className="text-[#64748B] text-[13px] leading-relaxed">
                      Вигравши аукціон, покупець створює запит на домовленість і вказує реквізити Нової Пошти для доставки.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold shrink-0 text-[13px]">2</div>
                  <div>
                    <h4 className="font-bold text-[#0B1220] mb-1 text-[14px]">Зв’язок та узгодження в чаті</h4>
                    <p className="text-[#64748B] text-[13px] leading-relaxed">
                      Сторони списуються у безпечному чаті KRAM, підтверджують параметри лота й погоджують відправку післяплатою.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold shrink-0 text-[13px]">3</div>
                  <div>
                    <h4 className="font-bold text-[#0B1220] mb-1 text-[14px]">Відправка продавцем</h4>
                    <p className="text-[#64748B] text-[13px] leading-relaxed">
                      Продавець надсилає лот обраним перевізником і додає номер ТТН у чаті або у деталях угоди.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold shrink-0 text-[13px]">4</div>
                  <div>
                    <h4 className="font-bold text-[#0B1220] mb-1 text-[14px]">Огляд посилки та оплата</h4>
                    <p className="text-[#64748B] text-[13px] leading-relaxed">
                      Покупець оглядає товар у відділенні пошти, переконується у відповідності опису та оплачує накладений платіж.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#10B981] text-white rounded-full flex items-center justify-center font-bold shrink-0 text-[13px]">5</div>
                  <div>
                    <h4 className="font-bold text-[#0B1220] mb-1 text-[14px]">Угода виконана</h4>
                    <p className="text-[#64748B] text-[13px] leading-relaxed">
                      Покупець позначає угоду як завершену у своєму кабінеті, підтверджуючи успішне отримання товару.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">Що робити, якщо виникли проблеми</h2>
            <div className="text-[#475569] leading-relaxed space-y-4 text-[14px]">
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
                <h4 className="font-bold text-amber-900 mb-1">Товар не відповідає опису або пошкоджений</h4>
                <p className="text-amber-800 leading-relaxed">
                  Не забирайте посилку та відмовтесь від отримання безпосередньо у відділенні перевізника. Повідомте продавця про проблему у чаті KRAM.
                </p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
                <h4 className="font-bold text-amber-900 mb-1">Користувач не виходить на зв'язок або порушує правила</h4>
                <p className="text-amber-800 leading-relaxed">
                  Будь ласка, зверніться до нашої служби модерації. Надішліть скаргу на лот або напишіть нашому модератору з додаванням доказів недобросовісної поведінки.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">Контакти модератора</h2>
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center text-[#2563EB]">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[#64748B] text-[13px]">Служба модерації KRAM</p>
                  <a href="mailto:support@kram.ua" className="text-[#2563EB] font-bold hover:underline text-[15px]">
                    support@kram.ua
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
