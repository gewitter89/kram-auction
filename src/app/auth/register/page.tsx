'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { KramLogo } from '@/components/brand/KramLogo'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [agreed, setAgreed] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Паролі не співпадають')
      return
    }
    if (form.password.length < 8) {
      setError('Пароль має бути мінімум 8 символів')
      return
    }
    if (!agreed) {
      setError('Прийміть правила KRAM')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Помилка реєстрації')
        setLoading(false)
        return
      }

      // Auto-login after registration
      const { signIn } = await import('next-auth/react')
      await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      router.push('/cabinet')
    } catch {
      setError('Помилка зʼєднання з сервером')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Brand */}
      <div className="hidden lg:flex lg:w-[480px] bg-[#0B1220] flex-col justify-center px-16">
        <KramLogo variant="dark" size={36} />
        <h2 className="text-[28px] font-bold text-white leading-tight mb-4">
          Приєднуйтесь до KRAM
        </h2>
        <p className="text-[16px] text-[#94A3B8] leading-relaxed">
          Створіть акаунт та станьте першим серед продавців чи покупців на чесних торгах в Україні.
        </p>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F8FAFC]">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-8">
            <KramLogo variant="full" size={34} />
          </div>

          <h1 className="text-[24px] font-bold text-[#0B1220] mb-2">Створити акаунт</h1>
          <p className="text-[14px] text-[#64748B] mb-8">Заповніть дані для реєстрації</p>

          {error && (
            <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[13px] text-[#EF4444]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">Імʼя</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Ваше імʼя"
                required
                className="w-full h-11 px-4 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full h-11 px-4 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">Телефон</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+380 XX XXX XX XX"
                className="w-full h-11 px-4 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">Пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Мінімум 8 символів"
                  required
                  minLength={8}
                  className="w-full h-11 px-4 pr-11 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">Підтвердити пароль</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                placeholder="Повторіть пароль"
                required
                className="w-full h-11 px-4 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]/20" />
              <span className="text-[13px] text-[#64748B]">
                Я погоджуюсь з{' '}
                <Link href="/terms" className="text-[#2563EB] hover:underline">правилами KRAM</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#2563EB] text-white rounded-xl text-[14px] font-semibold hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Створюємо...' : 'Створити акаунт'}
            </button>
          </form>

          <p className="mt-8 text-center text-[13px] text-[#64748B]">
            Вже є акаунт?{' '}
            <Link href="/auth/login" className="text-[#2563EB] font-medium hover:underline">
              Увійти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
