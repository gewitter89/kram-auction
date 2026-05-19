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
  const [infoAlert, setInfoAlert] = useState('')

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfoAlert('')
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
            KRAM запускає чесні онлайн-аукціони для продавців і покупців з України. Перші продавці отримують 0% комісії.
          </p>
          <div className="space-y-4">
            {['Прозора історія ставок і повідомлень', 'Профілі продавців, рейтинг і скарги', 'Доставка за домовленістю сторін'].map((text, i) => (
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
            Увійдіть через Google або Email. Якщо у вас ще немає акаунта, створіть його через форму реєстрації.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[13px] text-[#EF4444]">
              {error}
            </div>
          )}

          {infoAlert && (
            <div className="mb-4 p-3 bg-[#F0F9FF] border border-[#B9E6FE] rounded-xl text-[13px] text-[#0284C7] flex items-center gap-2">
              <span>ℹ️</span> {infoAlert}
            </div>
          )}

          {/* Google */}
          {/* Social Logins (100% Free) */}
          <div className="space-y-2.5 mb-6">
            <a
              href={`/auth/google?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              onClick={(e) => {
                e.preventDefault()
                setError('')
                setInfoAlert('')
                signIn('google', { callbackUrl })
              }}
              className="w-full h-11 flex items-center justify-center gap-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[14px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-colors"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Продовжити з Google
            </a>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`/auth/facebook?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                onClick={(e) => {
                  e.preventDefault()
                  setError('')
                  setInfoAlert('')
                  signIn('facebook', { callbackUrl })
                }}
                className="h-11 flex items-center justify-center gap-2 bg-white border border-[#E2E8F0] rounded-xl text-[13px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-colors"
              >
                <svg className="w-[18px] h-[18px]" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>

              <a
                href={`/auth/github?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                onClick={(e) => {
                  e.preventDefault()
                  setError('')
                  setInfoAlert('')
                  signIn('github', { callbackUrl })
                }}
                className="h-11 flex items-center justify-center gap-2 bg-white border border-[#E2E8F0] rounded-xl text-[13px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-colors"
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                GitHub
              </a>
            </div>
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

          {/* Demo Accounts for Testing - only in dev/demo mode */}
          {process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === 'true' && (
            <div className="mt-8 p-4 bg-[#F0F9FF] border border-[#0EA5E9]/20 rounded-xl">
              <p className="text-[12px] font-bold text-[#0EA5E9] mb-3 flex items-center gap-2">
                <span>🧪</span> Тестові акаунти для демо
                <span className="ml-2 text-[10px] bg-[#F59E0B]/20 text-[#D97706] px-1.5 py-0.5 rounded">Demo only</span>
              </p>
              <div className="space-y-2 text-[12px]">
                <div 
                  className="flex items-center justify-between p-2 bg-white rounded-lg cursor-pointer hover:shadow-sm transition-all"
                  onClick={() => { setEmail('demo-seller@kram.ua'); setPassword('demo123'); }}
                >
                  <div>
                    <span className="font-medium text-[#0F172A]">Продавець:</span>
                    <span className="text-[#64748B] ml-1">demo-seller@kram.ua</span>
                  </div>
                  <span className="text-[10px] bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded">клікніть</span>
                </div>
                <div 
                  className="flex items-center justify-between p-2 bg-white rounded-lg cursor-pointer hover:shadow-sm transition-all"
                  onClick={() => { setEmail('demo-buyer@kram.ua'); setPassword('demo123'); }}
                >
                  <div>
                    <span className="font-medium text-[#0F172A]">Покупець:</span>
                    <span className="text-[#64748B] ml-1">demo-buyer@kram.ua</span>
                  </div>
                  <span className="text-[10px] bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded">клікніть</span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-[#94A3B8]">
                Пароль для всіх тестових акаунтів: <span className="font-mono text-[#0F172A]">demo123</span>
              </p>
            </div>
          )}

          <p className="mt-6 text-center text-[13px] text-[#94A3B8]">
            Продовжуючи, ви погоджуєтесь з <Link href="/terms" className="text-[#2563EB] hover:underline">умовами сервісу</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
