import { Footer } from '@/components/layout/Footer'
import { Shield, Lock, Eye, Database, Cookie } from 'lucide-react'

export const metadata = {
  title: 'Політика конфіденційності | KRAM',
  description: 'Політика конфіденційності та обробки даних української beta-платформи KRAM',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[800px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#DBEAFE] border border-[#2563EB]/20 rounded-full mb-4">
            <Shield className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[12px] font-medium text-[#2563EB]">Ваші дані під захистом</span>
          </div>
          <h1 className="text-[32px] font-bold text-[#0B1220] mb-2">Політика конфіденційності</h1>
          <p className="text-[#64748B] text-[13px]">
            Останнє оновлення: {new Date().toLocaleDateString('uk-UA')} (Beta-режим)
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[20px] font-bold text-[#0B1220]">1. Які дані ми збираємо</h2>
            </div>
            <div className="text-[#475569] leading-relaxed space-y-4 text-[14px]">
              <p>Для роботи інформаційної платформи KRAM ми збираємо наступні дані:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Облікові дані:</strong> ім'я, email, номер телефону (при реєстрації)</li>
                <li><strong>Профіль:</strong> аватар, місто, короткий опис (за бажанням)</li>
                <li><strong>Дані угод:</strong> історія ставок, додані лоти, вибране</li>
                <li><strong>Доставка:</strong> дані доставки, які користувач добровільно надає в чаті або деталях домовленості, наприклад номер відділення поштового оператора</li>
                <li><strong>Технічні дані:</strong> IP-адреса, тип браузера, cookies сесії</li>
                <li><strong>Telegram:</strong> chat ID (виключно для сповіщень про ставки за вашою згодою)</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[20px] font-bold text-[#0B1220]">2. Як ми використовуємо дані</h2>
            </div>
            <div className="text-[#475569] leading-relaxed space-y-4 text-[14px]">
              <ul className="list-disc pl-5 space-y-2">
                <li>Для створення облікового запису та координації прямого зв'язку</li>
                <li>Для фіксації ставок та відображення переможця аукціону</li>
                <li>Для надсилання сповіщень про перебиті ставки або завершення торгів</li>
                <li>Для безпеки користувачів та оперативного розгляду скарг модераторами</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[20px] font-bold text-[#0B1220]">3. Зберігання та захист даних</h2>
            </div>
            <div className="text-[#475569] leading-relaxed space-y-4 text-[14px]">
              <p>
                Ваші реєстраційні дані зберігаються на захищених хмарних серверах. Ми використовуємо:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Сучасне одностороннє шифрування паролів</li>
                <li>HTTPS протокол шифрування трафіку</li>
                <li>Регулярне оновлення безпекових сесій</li>
              </ul>
              
              <div className="bg-[#EFF6FF] border-l-4 border-[#2563EB] p-4 rounded-r-xl mt-4">
                <p className="text-[13px] text-[#1E40AF] leading-relaxed">
                  <strong>Платіжна безпека:</strong> KRAM не збирає та не зберігає дані платіжних карт. 
                  У beta-режимі KRAM взагалі не приймає платежі на платформі. Усі угоди оплачуються безпосередньо продавцю 
                  поза межами сайту (наприклад, післяплата Новою Поштою). Якщо платіжний провайдер буде підключено в майбутньому, 
                  платіжні дані оброблятимуться виключно на захищеній стороні цього сертифікованого провайдера.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[20px] font-bold text-[#0B1220]">4. Cookies та трекінг</h2>
            </div>
            <div className="text-[#475569] leading-relaxed space-y-4 text-[14px]">
              <p>Ми використовуємо cookies для збереження сеансу входу та налаштувань інтерфейсу.</p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">5. Передача даних третім особам</h2>
            <div className="text-[#475569] leading-relaxed space-y-4 text-[14px]">
              <p>Ми не продаємо та не передаємо ваші дані рекламним мережам. Передача можлива лише:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Контрагенту:</strong> контакти продавця або покупця стають доступними лише переможцю торгів для прямого узгодження відправки.</li>
                <li><strong>Вимога закону:</strong> при отриманні офіційного правового запиту відповідно до законодавства України.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">6. Ваші права</h2>
            <div className="text-[#475569] leading-relaxed space-y-4 text-[14px]">
              <p>Ви маєте повне право переглядати, оновлювати або видаляти свій обліковий запис у будь-який момент через налаштування кабінету або звернувшись до нашої підтримки: <a href="mailto:support@kram.ua" className="text-[#2563EB] hover:underline">support@kram.ua</a>.</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
