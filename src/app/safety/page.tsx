import { Footer } from '@/components/layout/Footer'
import { ShieldCheck, AlertTriangle, Phone, MessageCircle, CheckCircle, XCircle, Truck, CreditCard } from 'lucide-react'

export const metadata = {
  title: 'Безпека на KRAM | KRAM',
  description: 'Правила безпечних угод на українському маркетплейсі KRAM',
}

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[800px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#DCFCE7] border border-[#10B981]/20 rounded-full mb-4">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span className="text-[12px] font-medium text-[#10B981]">Ваша безпека — наш пріоритет</span>
          </div>
          <h1 className="text-[32px] font-bold text-[#0B1220] mb-4">Безпечні угоди на KRAM</h1>
          <p className="text-[#64748B]">
            Як захистити себе при купівлі та продажу онлайн
          </p>
        </div>

        {/* Safety Principles */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
            <div className="w-12 h-12 bg-[#DBEAFE] rounded-xl flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-[#2563EB]" />
            </div>
            <h3 className="font-bold text-[#0B1220] mb-2">Оплата через платформу</h3>
            <p className="text-[14px] text-[#64748B]">
              Ніколи не переводьте гроші "напряму" продавцю. Використовуйте систему KRAM.
            </p>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
            <div className="w-12 h-12 bg-[#DCFCE7] rounded-xl flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-[#10B981]" />
            </div>
            <h3 className="font-bold text-[#0B1220] mb-2">Перевіряйте трекінг</h3>
            <p className="text-[14px] text-[#64748B]">
              Відстежуйте посилку на сайті Нової Пошти за номером ТТН.
            </p>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
            <div className="w-12 h-12 bg-[#FEF3C7] rounded-xl flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-[#D97706]" />
            </div>
            <h3 className="font-bold text-[#0B1220] mb-2">Спілкуйтесь на платформі</h3>
            <p className="text-[14px] text-[#64748B]">
              Не переходьте в Telegram/Viber для обговорення угоди.
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
              <h3 className="font-bold text-red-900 mb-3">Ознаки шахрайства — бути обережним!</h3>
              <ul className="space-y-2 text-red-800 text-[15px]">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Продавець просить оплату "на картку", "на телефон", "через друга"</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Ціна значно нижча за ринкову (підозріло дешевий iPhone, MacBook)</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Продавець поспішає, тисне "тільки сьогодні", "останній товар"</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Просить перейти в Telegram/Viber "для зручності"</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Відмовляється від доставки Новою Поштою з післяплатою</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">Як працює безпечна угода</h2>
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-[#0B1220] mb-1">Покупець оплачує або підтверджує оплату</h4>
                    <p className="text-[#64748B] text-[14px]">
                      Покупець натискає "Купити" або "Підтвердити оплату" в кабінеті. 
                      У разі LiqPay — оплачує через платіжну систему.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-[#0B1220] mb-1">Статус змінюється на "Оплачено"</h4>
                    <p className="text-[#64748B] text-[14px]">
                      Продавець бачить, що оплату підтверджено, і готує товар до відправлення.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-[#0B1220] mb-1">Продавець додає ТТН Нової Пошти</h4>
                    <p className="text-[#64748B] text-[14px]">
                      Продавець відправляє товар та додає номер накладної в систему KRAM.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <h4 className="font-bold text-[#0B1220] mb-1">Покупець отримує та перевіряє</h4>
                    <p className="text-[#64748B] text-[14px]">
                      На відділенні Нової Пошти покупець перевіряє товар перед оплатою 
                      (післяплата) або при отриманні (предоплата).
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-[#10B981] text-white rounded-full flex items-center justify-center font-bold shrink-0">5</div>
                  <div>
                    <h4 className="font-bold text-[#0B1220] mb-1">Підтвердження отримання</h4>
                    <p className="text-[#64748B] text-[14px]">
                      Якщо все гаразд — покупець натискає "Підтвердити отримання". 
                      Угода завершена!
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">Що робити, якщо щось пішло не так</h2>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <h4 className="font-bold text-amber-900 mb-2">Товар не відповідає опису</h4>
                <p className="text-amber-800">
                  Не підтверджуйте отримання! Відкрийте спір у кабінеті, опишіть проблему, 
                  додайте фото. Адміністрація розгляне спір та прийме рішення.
                </p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <h4 className="font-bold text-amber-900 mb-2">Продавець не відправляє товар</h4>
                <p className="text-amber-800">
                  Якщо продавець не додав ТТН протягом 3 днів після оплати — відкривайте спір. 
                  Для угод з післяплатою це не актуально (товар уже на відділенні).
                </p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <h4 className="font-bold text-amber-900 mb-2">Покупець не забирає товар</h4>
                <p className="text-amber-800">
                  Новая Пошта зберігає посилку 5 днів безкоштовно, потім — платно. 
                  Якщо покупець не забирає 14 днів — товар повертається продавцю.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">Перевірка продавця</h2>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <p>Перед покупкою перевірте профіль продавця:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Verified бейдж</strong> — продавець пройшов верифікацію</li>
                <li><strong>Рейтинг</strong> — середня оцінка від покупців</li>
                <li><strong>Кількість продажів</strong> — скільки успішних угод</li>
                <li><strong>Відгуки</strong> — читайте детальні відгуки інших покупців</li>
                <li><strong>Дата реєстрації</strong> — нові акаунти ризикованіші</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">Контакти підтримки</h2>
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#DBEAFE] rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-[#64748B] text-[14px]">Щоденна підтримка</p>
                  <a href="mailto:support@kram.ua" className="text-[#2563EB] font-bold hover:underline">
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
