'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { ArrowRight, BadgeCheck, Bell, Camera, CheckCircle2, ExternalLink, Gavel, MessageSquare, ShieldCheck, Store, UploadCloud } from 'lucide-react'

const launchCategories = ['Телефони', 'Ноутбуки', 'Ігрові консолі', 'Аксесуари Apple', 'Комплектуючі ПК', 'Фото/відео']

export default function SellersPage() {
  const [form, setForm] = useState({ name: '', email: '', telegram: '', category: '', lotsCount: '', note: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [olxUrl, setOlxUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importedLotId, setImportedLotId] = useState('')

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.email.includes('@')) {
      setError('Вкажіть коректний email')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          type: 'seller',
          source: 'seller_launch_application',
          meta: form,
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Не вдалося відправити заявку')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Помилка мережі. Спробуйте пізніше')
    } finally {
      setLoading(false)
    }
  }


  async function importOlxLot(e: React.FormEvent) {
    e.preventDefault()
    setImportError('')
    setImportedLotId('')
    if (!olxUrl.includes('olx.ua')) {
      setImportError('Вставте посилання на OLX-оголошення')
      return
    }
    setImporting(true)
    try {
      const res = await fetch('/api/lots/import-olx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ olxUrl })
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/auth/login?callbackUrl=/sellers?importOlx=1`
          return
        }
        setImportError(data.error || 'Не вдалося імпортувати оголошення')
        return
      }
      setImportedLotId(data.id)
    } catch {
      setImportError('Помилка мережі. Спробуйте пізніше')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-white">
        <div className="absolute inset-0 gradient-mesh opacity-60 pointer-events-none" />
        <div className="relative max-w-[1320px] mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 h-8 px-3.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-[12px] font-bold text-[#2563EB] mb-6">
              <Store className="w-4 h-4" /> Перші продавці KRAM
            </div>
            <h1 className="text-[36px] md:text-[54px] font-black text-[#0B1220] tracking-[-0.04em] leading-[1.05] mb-6">
              Запустіть свої лоти з прозорими ставками без комісії
            </h1>
            <p className="text-[16px] text-[#475569] leading-relaxed max-w-[620px] mb-8">
              KRAM зараз збирає перших продавців техніки, гаджетів та ігрових товарів. Ми не приймаємо оплату і не утримуємо кошти — платформа фіксує лот, ставки, переписку та статус домовленості.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <a href="#seller-application" className="h-12 px-7 bg-[#2563EB] text-white rounded-xl text-[14.5px] font-bold hover:bg-[#1D4ED8] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#2563EB]/15">
                Подати заявку продавця <ArrowRight className="w-4 h-4" />
              </a>
              <Link href="/sell" className="h-12 px-7 bg-white text-[#0B1220] border border-[#E2E8F0] rounded-xl text-[14.5px] font-bold hover:bg-[#F8FAFC] transition-all flex items-center justify-center">
                Створити лот
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 max-w-2xl">
              <div className="p-4 bg-white border border-[#E2E8F0] rounded-2xl">
                <Gavel className="w-5 h-5 text-[#2563EB] mb-2" />
                <p className="text-[13px] font-bold text-[#0B1220]">Прозора ціна</p>
                <p className="text-[12px] text-[#64748B] mt-1">Покупці бачать історію ставок і крок ціни.</p>
              </div>
              <div className="p-4 bg-white border border-[#E2E8F0] rounded-2xl">
                <Bell className="w-5 h-5 text-[#F59E0B] mb-2" />
                <p className="text-[13px] font-bold text-[#0B1220]">Telegram-канал</p>
                <p className="text-[12px] text-[#64748B] mt-1">Перші лоти можна просувати у спільноті KRAM.</p>
              </div>
              <div className="p-4 bg-white border border-[#E2E8F0] rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-[#10B981] mb-2" />
                <p className="text-[13px] font-bold text-[#0B1220]">0% на старті</p>
                <p className="text-[12px] text-[#64748B] mt-1">Без комісії за публікацію та ставки у beta.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0B1220] text-white rounded-[2rem] p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center">
                <BadgeCheck className="w-6 h-6 text-[#10B981]" />
              </div>
              <div>
                <p className="text-[15px] font-bold">Що отримує перший продавець</p>
                <p className="text-[12px] text-slate-400">Фокус на реальних лотах, не demo-базі</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                'окрема сторінка продавця з історією лотів',
                'модерація першого лота перед публікацією',
                'посилання на лот для Telegram/Instagram/OLX',
                'статуси домовленості: узгодження, ТТН, отримання',
                'відгуки тільки після завершених домовленостей',
              ].map(item => (
                <div key={item} className="flex items-start gap-3 text-[13px] text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-7 p-4 bg-white/5 border border-white/10 rounded-2xl text-[12px] text-slate-400 leading-relaxed">
              <strong className="text-white">Важливо:</strong> KRAM не приймає передоплати й не гарантує оплату. Ми допомагаємо прозоро зафіксувати ставку, домовленість і докази переписки.
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1320px] mx-auto px-4 py-16 grid lg:grid-cols-[0.9fr_1.1fr] gap-10">
        <div>
          <div className="inline-flex items-center gap-2 h-7 px-3 bg-white border border-[#E2E8F0] rounded-full text-[11px] font-bold text-[#64748B] uppercase tracking-wide mb-4">
            <Camera className="w-3.5 h-3.5" /> Якість лота
          </div>
          <h2 className="text-[28px] md:text-[36px] font-black text-[#0B1220] tracking-tight mb-4">Які лоти ми хочемо бачити першими</h2>
          <p className="text-[14px] text-[#64748B] leading-relaxed mb-6">
            На старті KRAM краще мати 20 реальних сильних лотів, ніж 200 випадкових оголошень. Тому ми фокусуємось на техніці, гаджетах та ігрових товарах.
          </p>
          <div className="flex flex-wrap gap-2">
            {launchCategories.map(cat => (
              <span key={cat} className="h-8 px-3 bg-white border border-[#E2E8F0] rounded-full text-[12px] font-semibold text-[#475569]">{cat}</span>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ['2–8 реальних фото', 'Фото мають показувати саме ваш товар, не тільки картинку з інтернету.'],
            ['Чесний опис стану', 'Подряпини, батарея, комплект, дефекти — краще написати одразу.'],
            ['Адекватна стартова ціна', 'Занадто низька ціна на дорогий товар від нового продавця піде на модерацію.'],
            ['Без зовнішніх оплат', 'Не додавайте у опис картки, платіжні посилання або прохання про передоплату.'],
          ].map(([title, desc]) => (
            <div key={title} className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
              <UploadCloud className="w-5 h-5 text-[#2563EB] mb-3" />
              <h3 className="text-[15px] font-bold text-[#0B1220] mb-2">{title}</h3>
              <p className="text-[13px] text-[#64748B] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>


      <section className="max-w-[900px] mx-auto px-4 pb-10">
        <div className="bg-[#0B1220] text-white rounded-[2rem] p-6 md:p-8 shadow-sm">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <ExternalLink className="w-6 h-6 text-[#60A5FA]" />
            </div>
            <div>
              <h2 className="text-[22px] font-black tracking-tight mb-2">Імпорт лота з OLX</h2>
              <p className="text-[13px] text-slate-300 leading-relaxed">
                Вставте посилання на своє OLX-оголошення — KRAM підтягне назву, опис, ціну та фото. Для підтверджених продавців лот публікується одразу; нові продавці проходять модерацію.
              </p>
            </div>
          </div>

          {importedLotId ? (
            <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 mt-0.5" />
                <div>
                  <p className="text-[14px] font-bold text-white">Лот імпортовано та відправлено на модерацію</p>
                  <p className="text-[12px] text-emerald-100 mt-1">Якщо профіль продавця підтверджено, лот уже доступний у каталозі. Для нового продавця він зʼявиться після модерації.</p>
                  <Link href={`/lot/${importedLotId}`} className="inline-flex mt-3 text-[12px] font-bold text-emerald-200 hover:text-white underline">
                    Переглянути сторінку лота
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={importOlxLot} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={olxUrl}
                  onChange={e => setOlxUrl(e.target.value)}
                  placeholder="https://www.olx.ua/d/uk/obyavlenie/..."
                  className="flex-1 h-12 px-4 bg-white/10 border border-white/15 rounded-xl text-[14px] text-white placeholder:text-slate-500 outline-none focus:border-[#60A5FA]"
                />
                <button disabled={importing} className="h-12 px-6 bg-white text-[#0B1220] rounded-xl text-[14px] font-black hover:bg-slate-100 disabled:opacity-60 transition-all">
                  {importing ? 'Імпортуємо...' : 'Імпортувати'}
                </button>
              </div>
              {importError && <p className="text-[12px] text-red-300">{importError}</p>}
              <p className="text-[11px] text-slate-500">Потрібен вхід в акаунт. Підтверджені продавці публікують імпортовані лоти одразу.</p>
            </form>
          )}
        </div>
      </section>

      <section id="seller-application" className="max-w-[900px] mx-auto px-4 pb-20">
        <div className="bg-white border border-[#E2E8F0] rounded-[2rem] p-6 md:p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-[#ECFDF5] rounded-3xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
              </div>
              <h2 className="text-[24px] font-black text-[#0B1220] mb-2">Заявку отримано</h2>
              <p className="text-[14px] text-[#64748B] max-w-md mx-auto">Ми збережемо заявку продавця і повернемось із наступними кроками запуску.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-[24px] font-black text-[#0B1220] mb-2">Подати заявку продавця</h2>
                <p className="text-[14px] text-[#64748B]">Розкажіть, що ви продаєте. Це допоможе нам запускати перші категорії не порожніми.</p>
              </div>
              {error && <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[13px] text-[#EF4444]">{error}</div>}
              <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
                <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Ваше імʼя / магазин" className="h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB]" />
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="Email для звʼязку" className="h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB]" />
                <input value={form.telegram} onChange={e => update('telegram', e.target.value)} placeholder="Telegram / Instagram (необовʼязково)" className="h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB]" />
                <input value={form.lotsCount} onChange={e => update('lotsCount', e.target.value)} placeholder="Скільки лотів можете додати?" className="h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB]" />
                <select value={form.category} onChange={e => update('category', e.target.value)} className="h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB]">
                  <option value="">Що продаєте?</option>
                  {launchCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="other">Інше</option>
                </select>
                <textarea value={form.note} onChange={e => update('note', e.target.value)} placeholder="Коротко про товари / умови / місто" className="md:col-span-2 min-h-[110px] p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB] resize-none" />
                <button disabled={loading} className="md:col-span-2 h-12 bg-[#2563EB] text-white rounded-xl text-[15px] font-bold hover:bg-[#1D4ED8] disabled:opacity-60 transition-all">
                  {loading ? 'Надсилаємо...' : 'Надіслати заявку'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
