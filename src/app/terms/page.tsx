import { Footer } from '@/components/layout/Footer'
import { ShieldCheck, AlertTriangle, Scale, FileText } from 'lucide-react'

export const metadata = {
  title: 'Умови використання | KRAM',
  description: 'Умови використання української інформаційної платформи торгів KRAM',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[800px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full mb-4">
            <AlertTriangle className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[12px] font-medium text-[#2563EB]">Режим прямих домовленостей</span>
          </div>
          <h1 className="text-[32px] font-bold text-[#0B1220] mb-4">Умови використання KRAM</h1>
          <p className="text-[#64748B]">
            Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}
          </p>
        </div>

        {/* Direct agreement notice */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white border border-[#BFDBFE] rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="font-bold text-[#1E40AF] mb-2">Важлива інформація про Режим прямих домовленостей</h3>
              <p className="text-[#1E40AF]/90 text-[15px] leading-relaxed">
                KRAM працює в режимі прямих домовленостей як інформаційна платформа для торгів та оголошень. Ми не є фінансовим посередником: KRAM не приймає онлайн-оплату, не утримує кошти та не проводить виплат. Усі угоди й розрахунки здійснюються покупцями та продавцями самостійно та під власну відповідальність.
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
                KRAM — це українська інформаційна платформа, яка допомагає користувачам створювати лоти, проводити інтерактивні торги, робити ставки та координувати діалог для прямої купівлі-продажу товарів.
              </p>
              <p>
                Користуючись нашим сервісом, ви погоджуєтесь з цими умовами використання. Якщо ви не згодні з умовами, будь ласка, припиніть використання платформи.
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
                <li>Всі ставки є зобов'язаннями покупця. Якщо ваша ставка виграла, ви зобов’язані вийти на зв'язок з продавцем для обговорення доставки.</li>
                <li>Продавець зобов'язаний надати точний опис товару, реальні фотографії та вказати чесні параметри торгів.</li>
                <li>Штучне накручування ставок (шиллбідінг) заборонено та карається блокуванням акаунту.</li>
                <li>У режимі прямих домовленостей комісія сервісу становить 0% для всіх продавців та покупців.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[20px] font-bold text-[#0B1220]">3. Оформлення прямих угод</h2>
            </div>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <p>
                KRAM надає кабінет та чат для зручної фіксації етапів прямих домовленостей:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Очікує узгодження умов</strong> — покупець створив запит та пропонує реквізити для відправки</li>
                <li><strong>Узгоджено</strong> — сторони підтвердили умови оплати й доставки в чаті</li>
                <li><strong>Відправлено</strong> — продавець надав номер ТТН перевізника покупцю</li>
                <li><strong>Завершено</strong> — покупець успішно отримав товар та підтвердив закриття угоди</li>
              </ol>
              <p className="bg-[#EFF6FF] border-l-4 border-[#2563EB] p-4 mt-4 text-[14px]">
                <strong>Важливо:</strong> Розрахунки здійснюються напряму між користувачами. Платформа наполегливо радить використовувати післяплату при отриманні на пошті, щоб особисто оглянути лот перед передачею коштів.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">4. Відповідальність сторін</h2>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <p>
                <strong>KRAM</strong> є інформаційним майданчиком для з'єднання користувачів і фіксації торгів/домовленостей. Ми не є стороною угод, не зберігаємо товари та не приймаємо платежі. Водночас KRAM може модерувати лоти, обмежувати порушників і допомагати сторонам зберігати докази переписки.
              </p>
              <p>
                <strong>Продавець</strong> несе особисту та повну відповідальність за достовірність інформації про лот, якість товару та виконання обіцянок щодо його відправки.
              </p>
              <p>
                <strong>Покупець</strong> несе особисту відповідальність за виконання ставок та самостійну перевірку товару при отриманні.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">5. Спірні питання</h2>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <p>
                Оскільки KRAM не утримує кошти користувачів, платформа не може здійснювати грошові повернення. Будь-які спори вирішуються покупцем і продавцем самостійно.
              </p>
              <p>
                У разі виявлення фактів шахрайства, обману чи відмови від надсилання виграного лота, адміністрація KRAM проводить внутрішню модерацію та може заблокувати профіль порушника на основі наданих доказів.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">6. Заборонена діяльність</h2>
            <div className="text-[#475569] leading-relaxed">
              <ul className="list-disc pl-5 space-y-2">
                <li>Продаж заборонених українським законодавством товарів (зброя, наркотичні речовини, неліцензійні копії)</li>
                <li>Вимагання небезпечних передоплат на картку до огляду товару</li>
                <li>Шахрайство, фішинг, використання чужих платіжних реквізитів</li>
                <li>Створення штучних акаунтів для маніпуляцій цінами лотів</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">7. Зміни до умов</h2>
            <div className="text-[#475569] leading-relaxed">
              <p>
                Ми залишаємо за собою право коригувати ці умови в будь-який час для відповідності статусу сервісу. Продовження використання KRAM після оновлення умов означає вашу згоду з ними.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-4">8. Контакти</h2>
            <div className="text-[#475569] leading-relaxed">
              <p>
                З питань роботи платформи та скарг на порушення правил звертайтесь:
              </p>
              <p className="mt-2 font-medium">
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
