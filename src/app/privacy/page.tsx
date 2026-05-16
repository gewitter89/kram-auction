import { Footer } from '@/components/layout/Footer'
import { Shield, Lock, Eye, Database, Cookie } from 'lucide-react'

export const metadata = {
  title: 'Політика конфіденційності | KRAM',
  description: 'Політика конфіденційності та обробки даних українського маркетплейсу KRAM',
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
          <h1 className="text-[32px] font-bold text-[#0B1220] mb-4">Політика конфіденційності</h1>
          <p className="text-[#64748B]">
            Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[20px] font-bold text-[#0B1220]">1. Які дані ми збираємо</h2>
            </div>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <p>Для роботи платформи KRAM ми збираємо наступні дані:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Облікові дані:</strong> ім'я, email, телефон (при реєстрації)</li>
                <li><strong>Профіль:</strong> аватар, місто, біографія (за бажанням)</li>
                <li><strong>Дані угод:</strong> історія покупок, продажів, ставки</li>
                <li><strong>Доставка:</strong> адреси доставки, номери відділень Нової Пошти</li>
                <li><strong>Технічні дані:</strong> IP-адреса, User-Agent, cookies</li>
                <li><strong>Telegram:</strong> chat ID (якщо підключено сповіщення)</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[20px] font-bold text-[#0B1220]">2. Як ми використовуємо дані</h2>
            </div>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <ul className="list-disc pl-5 space-y-2">
                <li>Для створення та управління вашим акаунтом</li>
                <li>Для обробки угод, платежів та доставки</li>
                <li>Для надсилання сповіщень про ставки, перемоги, статуси угод</li>
                <li>Для покращення роботи платформи та аналітики</li>
                <li>Для запобігання шахрайству та забезпечення безпеки</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[20px] font-bold text-[#0B1220]">3. Зберігання та захист даних</h2>
            </div>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <p>
                Ваші дані зберігаються на захищених серверах. Ми використовуємо:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Шифрування паролів (bcrypt)</li>
                <li>HTTPS для всіх з'єднань</li>
                <li>Безпечні сесії з обмеженим терміном дії</li>
                <li>Регулярні резервні копії</li>
              </ul>
              <p className="bg-green-50 border-l-4 border-green-400 p-4 mt-4">
                <strong>Важливо:</strong> Ми не зберігаємо дані платіжних карт. 
                Всі платежі обробляються через LiqPay безпосередньо на їхньому захищеному сервері.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[20px] font-bold text-[#0B1220]">4. Cookies та трекінг</h2>
            </div>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <p>Ми використовуємо cookies для:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Автентифікації та підтримки сесії</li>
                <li>Збереження налаштувань користувача</li>
                <li>Аналітики використання платформи</li>
              </ul>
              <p>
                Ви можете вимкнути cookies в налаштуваннях браузера, але це може обмежити 
                функціональність платформи.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">5. Передача даних третім особам</h2>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <p>Ми не продаємо ваші дані. Передача можлива лише:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Продавцю/покупцю:</strong> необхідні дані для угоди (контакти, адреса доставки)</li>
                <li><strong>LiqPay:</strong> для обробки платежів</li>
                <li><strong>Nova Poshta:</strong> для оформлення доставки</li>
                <li><strong>За вимогою закону:</strong> при отриманні офіційного запиту</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">6. Ваші права</h2>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <p>Ви маєте право:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Отримати копію ваших даних</li>
                <li>Виправити неточності в даних</li>
                <li>Видалити акаунт та пов'язані дані</li>
                <li>Відмовитись від маркетингових сповіщень</li>
                <li>Обмежити обробку даних</li>
              </ul>
              <p className="mt-4">
                Для реалізації прав звертайтесь:{' '}
                <a href="mailto:privacy@kram.ua" className="text-[#2563EB] hover:underline">
                  privacy@kram.ua
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">7. Термін зберігання</h2>
            <div className="text-[#475569] leading-relaxed">
              <p>
                Дані зберігаються протягом дії вашого акаунту та 2 роки після його видалення 
                (для виконання податкових та правових зобов'язань). Деталі угод зберігаються 
                для захисту прав користувачів при спорах.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">8. Зміни до політики</h2>
            <div className="text-[#475569] leading-relaxed">
              <p>
                Ми можемо оновлювати цю політику. Про значні зміни ми повідомимо через email 
                або сповіщення на платформі за 30 днів до набуття чинності.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">9. Контакти</h2>
            <div className="text-[#475569] leading-relaxed">
              <p>З питань конфіденційності:</p>
              <p className="mt-2">
                Email: <a href="mailto:privacy@kram.ua" className="text-[#2563EB] hover:underline">privacy@kram.ua</a>
              </p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
