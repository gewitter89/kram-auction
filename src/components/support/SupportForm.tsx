'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Send } from 'lucide-react'

export function SupportForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('safe_deal')
  const [itemId, setItemId] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !message) {
      alert('Будь ласка, заповніть усі обов\'язкові поля.')
      return
    }

    setLoading(true)
    // Simulate API request to register ticket
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-[#EFF6FF] border border-[#2563EB]/10 rounded-2xl p-8 text-center animate-fade-in">
        <div className="w-14 h-14 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-[18px] font-bold text-[#0F172A] mb-2">Запит успішно надіслано!</h3>
        <p className="text-[14px] text-[#64748B] max-w-md mx-auto mb-6">
          Дякуємо за звернення. Менеджер підтримки KRAM уже переглядає вашу заявку та зв'яжеться з вами на пошту <strong>{email}</strong> найближчим часом.
        </p>
        <button
          onClick={() => {
            setSubmitted(false)
            setName('')
            setEmail('')
            setItemId('')
            setMessage('')
          }}
          className="h-10 px-5 bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl text-[13px] font-semibold hover:bg-[#F8FAFC] transition-colors"
        >
          Надіслати інший запит
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
            Ваше ім'я *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Іван Петренко"
            className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 focus:bg-white transition-all"
          />
        </div>
        
        <div>
          <label className="block text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
            Email для зв'язку *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
            Категорія запиту
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-11 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 focus:bg-white transition-all"
          >
            <option value="safe_deal">🔒 Безпечна угода</option>
            <option value="dispute">🚨 Спір за угодою</option>
            <option value="tech_issue">⚙️ Технічна помилка</option>
            <option value="general">💬 Загальне запитання</option>
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
            ID Угоди / Лота (необов'язково)
          </label>
          <input
            type="text"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            placeholder="Наприклад: tx-f89a24d"
            className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
          Детальний опис ситуації *
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Опишіть ваше питання детально. За потреби додайте інформацію про ТТН або способи оплати."
          className="w-full p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 focus:bg-white transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto h-11 px-8 bg-[#2563EB] text-white rounded-xl text-[14px] font-bold hover:bg-[#1D4ED8] disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Надсилання...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Надіслати звернення</span>
          </>
        )}
      </button>
    </form>
  )
}
