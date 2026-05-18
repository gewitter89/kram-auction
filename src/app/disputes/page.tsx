import { Footer } from '@/components/layout/Footer'
import { AlertTriangle, Shield, CheckCircle, MessageSquare } from 'lucide-react'

export const metadata = {
  title: 'Вирішення спорів | KRAM',
  description: 'Порядок врегулювання розбіжностей та подання скарг на інформаційній beta-платформі KRAM.',
}

export default function DisputesPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[800px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full mb-4">
            <AlertTriangle className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[12px] font-medium text-[#2563EB]">Beta-режим платформи</span>
          </div>
          <h1 className="text-[32px] font-bold text-[#0B1220] mb-4">Скарги та врегулювання суперечок</h1>
          <p className="text-[#64748B]">
            Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}
          </p>
        </div>

        {/* Dispute Engine Overview */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white border border-[#BFDBFE] rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="font-bold text-[#1E40AF] mb-2">Наш пріоритет — чесність торгів</h3>
              <p className="text-[#1E40AF]/90 text-[15px] leading-relaxed">
                KRAM є виключно інформаційним посередником і не бере участі в розрахунках між користувачами. Ми не приймаємо кошти і не можемо робити грошових повернень. Будь-які суперечки щодо оплати та якості товару вирішуються покупцем і продавцем самостійно. Проте ми жорстко боремося з порушниками за допомогою системи скарг.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[20px] font-bold text-[#0B1220]">Порядок подання скарги на KRAM</h2>
            </div>
            <div className="text-[#475569] leading-relaxed space-y-4">
              <p>
                Якщо ви зіткнулися з недобросовісною поведінкою іншого користувача (відмова надсилати виграний лот, невідповідність опису, шахрайські пропозиції), дотримуйтесь цього алгоритму:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-white border border-[#E2E8F0] rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-[14px]">Фіксація порушення</h4>
                    <p className="text-[#64748B] text-[13px] mt-1">Збережіть знімки екрана чату KRAM, деталі лота, квитанції про відправку або будь-які інші підтвердження домовленостей.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white border border-[#E2E8F0] rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-[14px]">Надсилання скарги</h4>
                    <p className="text-[#64748B] text-[13px] mt-1">Скористайтеся кнопкою скарги на сторінці відповідного лота чи профілю або надішліть листа до нашої служби підтримки.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white border border-[#E2E8F0] rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-[14px]">Модерація та блокування</h4>
                    <p className="text-[#64748B] text-[13px] mt-1">Команда модерації розглядає скаргу протягом 24 годин. У разі підтвердження порушення правил платформи акаунт зловмисника буде назавжди заблоковано.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[20px] font-bold text-[#0B1220]">Контакти підтримки</h2>
            </div>
            <div className="text-[#475569] leading-relaxed">
              <p>
                З будь-яких питань щодо активних суперечок звертайтеся безпосередньо до нашого офіційного каналу підтримки:
              </p>
              <div className="mt-4 flex gap-4">
                <a 
                  href="https://t.me/kram_support" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex h-11 px-5 items-center bg-[#2563EB] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1D4ED8] transition-colors"
                >
                  Чат у Telegram
                </a>
                <a 
                  href="mailto:support@kram.ua" 
                  className="inline-flex h-11 px-5 items-center border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl text-[13px] font-semibold transition-colors"
                >
                  support@kram.ua
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
