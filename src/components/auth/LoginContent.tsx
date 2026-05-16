'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { KramLogo } from '@/components/brand/KramLogo'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/cabinet'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Невірний email або пароль')
        setLoading(false)
      } else {
        router.push(callbackUrl)
      }
    } catch {
      setError('Помилка зʼєднання')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-[#0B1220] flex-col justify-center px-16">
        <div>
          <div className="mb-10">
            <KramLogo variant="dark" />
          </div>
          <h2 className="text-[28px] font-bold text-white leading-tight mb-4">Чесні торги України</h2>
          <p className="text-[16px] text-[#94A3B8] leading-relaxed mb-12">
            Купуйте, продавайте та вигравайте безпечно. Тисячі лотів щодня від перевірених продавців.
          </p>
          <div className="space-y-4">
            {['Безпечна угода з гарантією', 'Перевірені продавці з рейтингом', 'Доставка Новою Поштою по всій Україні'].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-[14px] text-[#94A3B8]">
                <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-[#10B981] text-xs font-bold">{i + 1}</span>
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F8FAFC]">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-8">
            <KramLogo variant="full" />
          </div>

          <h1 className="text-[24px] font-bold text-[#0B1220] mb-2">Швидкий вхід</h1>
          <p className="text-[14px] text-[#64748B] mb-8">
            Реєстрація не потрібна — просто увійдіть через Google або Email. Система автоматично створить акаунт, якщо ви у нас вперше.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[13px] text-[#EF4444]">
              {error}
            </div>
          )}

          {/* Google */}
          <a
            href={`/auth/google?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="w-full h-11 flex items-center justify-center gap-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[14px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-colors mb-3"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Продовжити з Google
          </a>

          {/* Apple disabled */}
          <div className="w-full h-11 flex items-center justify-center gap-2.5 bg-[#0B1220] rounded-xl text-[14px] font-medium text-white/50 mb-6">
            <svg className="w-[18px] h-[18px] opacity-50" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            Продовжити з Apple
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">скоро</span>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E2E8F0]"></div></div>
            <div className="relative flex justify-center"><span className="bg-[#F8FAFC] px-3 text-[12px] text-[#94A3B8]">або з email</span></div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
                className="w-full h-11 px-4 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-medium text-[#0F172A]">Пароль</label>
                <Link href="/auth/forgot-password" className="text-[12px] text-[#2563EB] hover:underline">Забули пароль?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введіть пароль"
                  required
                  autoComplete="current-password"
                  className="w-full h-11 px-4 pr-11 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#2563EB] text-white rounded-xl text-[14px] font-semibold hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Входимо...' : 'Увійти з email'}
            </button>
          </form>

          <p className="mt-8 text-center text-[13px] text-[#94A3B8]">
            Продовжуючи, ви погоджуєтесь з <Link href="/terms" className="text-[#2563EB] hover:underline">умовами сервісу</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
