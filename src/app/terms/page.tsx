import { Footer } from '@/components/layout/Footer'
import { ShieldCheck, AlertTriangle, Scale, FileText } from 'lucide-react'

export const metadata = {
  title: 'Умови використання | KRAM',
  description: 'Умови використання українського маркетплейсу безпечних угод KRAM',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[800px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FEF3C7] border border-[#F59E0B]/20 rounded-full mb-4">
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
            <span className="text-[12px] font-medium text-[#D97706]">Beta-версія платформи</span>
          </div>
          <h1 className="text-[32px] font-bold text-[#0B1220] mb-4">Умови використання KRAM</h1>
          <p className="text-[#64748B]">
            Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}
          </p>
        </div>

        {/* Beta Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Важлива інформація про Beta-режим</h3>
              <p className="text-amber-800 text-[15px] leading-relaxed">
                KRAM працює в режимі Beta. Ми тестуємо безпечні угоди, сповіщення та доставку. 
                Реальні платежі через LiqPay будуть активовані після фінального sandbox тестування. 
                До цього моменту підтвердження оплати може бути ручним (MVP режим).
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[20px] font-bold text-[#0B1220]">1. Загальні положення</h2>
            </div>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <p>
                KRAM — це український маркетплейс безпечних угод, що дозволяє користувачам купувати, 
                продавати та торгуватися з прозорим статусом угоди, доставкою та сповіщеннями.
              </p>
              <p>
                Користуючись нашим сервісом, ви погоджуєтесь з цими умовами використання. 
                Якщо ви не згодні з умовами, будь ласка, не використовуйте платформу.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[20px] font-bold text-[#0B1220]">2. Правила аукціонів та торгів</h2>
            </div>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <ul className="list-disc pl-5 space-y-2">
                <li>Всі ставки є зобов'язуючими. Якщо ви виграли аукціон, ви зобов'язані завершити покупку.</li>
                <li>Продавець зобов'язаний надати точний опис товару та реальні фотографії.</li>
                <li>Штучне накручування цін (шиллбідінг) заборонено та карається блокуванням.</li>
                <li>Платформа стягує комісію з успішних угод (розмір вказано при створенні лоту).</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[20px] font-bold text-[#0B1220]">3. Безпечна угода (Safe Deal)</h2>
            </div>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <p>
                KRAM надає систему безпечних угод з наступними статусами:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Очікує оплати</strong> — покупець повинен підтвердити оплату</li>
                <li><strong>Оплачено</strong> — оплату підтверджено, очікуємо відправлення</li>
                <li><strong>Відправлено</strong> — продавець додав номер відправлення</li>
                <li><strong>Завершено</strong> — покупець підтвердив отримання</li>
              </ol>
              <p className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                <strong>MVP режим:</strong> До активації реальних платежів LiqPay, підтвердження оплати 
                є ручним. Продавець не повинен відправляти товар до отримання реальної оплати.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">4. Відповідальність сторін</h2>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <p>
                <strong>KRAM</strong> надає платформу для з'єднання покупців та продавців, 
                але не є стороною угоди. Ми не гарантуємо якість товарів та не несемо 
                відповідальності за дії користувачів.
              </p>
              <p>
                <strong>Продавець</strong> несе повну відповідальність за достовірність 
                інформації про товар та його відправлення.
              </p>
              <p>
                <strong>Покупець</strong> зобов'язаний перевірити товар при отриманні 
                та підтвердити отримання або відкрити спір у разі проблем.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">5. Спори та повернення</h2>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <p>
                У разі виникнення спору між покупцем та продавцем, KRAM надає механізм 
                вирішення спорів. Адміністрація може вимагати докази (фото, відео, 
                трекінг) від обох сторін.
              </p>
              <p>
                Рішення адміністрації є остаточним. Кошти можуть бути повернені покупцю 
                або перераховані продавцю залежно від результату розгляду спору.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">6. Заборонена діяльність</h2>
            <div className="text-[#475569] leading-relaxed">
              <ul className="list-disc pl-5 space-y-2">
                <li>Продаж заборонених товарів (зброя, наркотики, підробки)</li>
                <li>Шахрайство, фішинг, обман інших користувачів</li>
                <li>Оплата поза платформою ("напряму продавцю")</li>
                <li>Створення фейкових акаунтів</li>
                <li>Маніпуляції з цінами та штучне накручування</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">7. Зміни до умов</h2>
            <div className="text-[#475569] leading-relaxed">
              <p>
                Ми залишаємо за собою право змінювати ці умови в будь-який час. 
                Про значні зміни ми повідомляємо через email або сповіщення на платформі. 
                Продовження використання KRAM після змін означає вашу згоду з новими умовами.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">8. Контакти</h2>
            <div className="text-[#475569] leading-relaxed">
              <p>
                З питаннями щодо умов використання звертайтесь:
              </p>
              <p className="mt-2">
                Email: <a href="mailto:support@kram.ua" className="text-[#2563EB] hover:underline">support@kram.ua</a>
              </p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
