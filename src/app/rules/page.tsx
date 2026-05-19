import { Footer } from '@/components/layout/Footer'
import { ShieldAlert, CheckCircle, XCircle, FileText, Scale } from 'lucide-react'

export const metadata = {
  title: 'Правила та заборонені товари | KRAM',
  description: 'Перелік заборонених товарів та правила публікації лотів на українській платформі KRAM',
}

export default function RulesPage() {
  const prohibitedItems = [
    'Будь-які види зброї (вогнепальна, холодна, пневматична), боєприпаси, вибухові речовини та піротехніка.',
    'Наркотичні засоби, психотропні речовини, прекурсори, а також пристосування для їх вживання.',
    'Медичні препарати, рецептурні ліки, біологічно активні добавки (БАД) та медичне обладнання.',
    'Контрафактна продукція, копії та репліки брендів, що порушують права інтелектуальної власності.',
    'Особисті дані громадян, бази даних, приховані камери та спеціальні засоби стеження.',
    'Алкогольні напої, тютюнові вироби, електронні сигарети, рідини для заправки та кальяни.',
    'Державні нагороди, ордени, медалі (що заборонені законом до відкритого продажу).',
    'Тварини та рослини, занесені до Червоної книги, а також товари з їхніх частин (слонова кістка, хутро рідкісних звірів тощо).',
  ]

  const publishingRules = [
    {
      title: 'Реальні та якісні фотографії',
      desc: 'Заборонено завантажувати чужі фотографії з інтернету. Використовуйте власні знімки з різних ракурсів, що відображають реальний стан речей.'
    },
    {
      title: 'Детальний та чесний опис',
      desc: 'Детально опишіть усі недоліки, пошкодження та сліди використання лота. Покупець має право знати правду про купуєму річ.'
    },
    {
      title: 'Коректна категорія та теги',
      desc: 'Публікуйте лоти виключно у відповідних категоріях. Заборонено спамити нерелевантними тегами для штучного залучення аудиторії.'
    },
    {
      title: 'Адекватна стартова ціна',
      desc: 'Вказуйте реальну початкову ціну лота. Заборонено штучно завищувати мінімальний крок торгів або маніпулювати ціною через фіктивні акаунти.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[800px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FEF2F2] border border-[#EF4444]/20 rounded-full mb-4">
            <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
            <span className="text-[12px] font-medium text-[#EF4444]">Безпечне та законне середовище</span>
          </div>
          <h1 className="text-[32px] font-bold text-[#0B1220] mb-4">Правила KRAM та заборонені лоти</h1>
          <p className="text-[#64748B]">
            Обов’язковий регламент розміщення публікацій для забезпечення прозорості торгів
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] mb-2">Навіщо потрібні правила?</h3>
              <p className="text-[#64748B] text-[14.5px] leading-relaxed">
                KRAM є українською інформаційною платформою, яка прагне підтримувати культуру чесних і безпечних прямих домовленостей. Ми суворо дотримуємося законодавства України та вимагаємо цього від кожного нашого користувача. Порушення правил можуть призвести до попередження, видалення лота, тимчасового обмеження або блокування акаунта після перевірки модератором.
              </p>
            </div>
          </div>
        </div>

        {/* Prohibited items list */}
        <section className="mb-12">
          <h2 className="text-[20px] font-bold text-[#0B1220] mb-6 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-[#EF4444]" />
            Заборонені до публікації товари та послуги
          </h2>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <p className="text-[#64748B] text-[14px] mb-6">
              Наступні категорії товарів категорично заборонено розміщувати на платформі. Такі лоти можуть бути видалені модератором після перевірки:
            </p>
            <ul className="space-y-4">
              {prohibitedItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[14px] text-[#334155] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Publishing rules */}
        <section className="mb-12">
          <h2 className="text-[20px] font-bold text-[#0B1220] mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#10B981]" />
            Правила якісного оформлення лотів
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {publishingRules.map((rule, idx) => (
              <div key={idx} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:shadow-card transition-all">
                <h4 className="font-bold text-[#0F172A] text-[14.5px] mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#E8F5E9] text-[#10B981] text-[11px] font-bold rounded-lg flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {rule.title}
                </h4>
                <p className="text-[13px] text-[#64748B] leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Violations */}
        <section className="mb-12">
          <h2 className="text-[20px] font-bold text-[#0B1220] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2563EB]" />
            Порушення правил та санкції
          </h2>
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-6 text-[14px] text-[#1E40AF] leading-relaxed">
            <p className="mb-3 font-semibold">
              У разі виявлення порушень правил KRAM адміністрація має право застосувати такі заходи:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Попередження та видалення окремого лота.</li>
              <li>Призупинення можливості створювати нові лоти або робити ставки.</li>
              <li>Блокування облікового запису у разі серйозних або повторних порушень.</li>
            </ul>
            <p className="mt-4">
              Якщо ви помітили лот, який порушує ці правила, будь ласка, натисніть кнопку <strong>"Поскаржитись на лот"</strong> безпосередньо на сторінці детальної інформації про товар.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
