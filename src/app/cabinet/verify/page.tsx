'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ShieldCheck, Phone, KeyRound, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Suspense } from 'react'

function VerifyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, update } = useSession()
  const redirectUrl = searchParams?.get('redirect') || '/cabinet'

  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('+380')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (session?.user?.verified) {
    return (
      <div className="max-w-[480px] mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-[#ECFDF5] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#A7F3D0]">
          <CheckCircle className="w-8 h-8 text-[#10B981]" />
        </div>
        <h1 className="text-[22px] font-bold text-[#0B1220] mb-2">Акаунт верифіковано</h1>
        <p className="text-[14px] text-[#64748B] mb-6">Ви вже пройшли перевірку і можете створювати лоти.</p>
        <Link href={redirectUrl} className="inline-flex items-center h-12 px-8 bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] transition-colors">
          Продовжити
        </Link>
      </div>
    )
  }

  async function handleSendCode() {
    if (phone.length < 13) {
      setError('Введіть коректний номер у форматі +380XXXXXXXXX')
      return
    }
    setError('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/user/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Помилка відправки SMS')
        setLoading(false)
        return
      }
      
      setLoading(false)
      setStep(2)
    } catch (e) {
      setError('Помилка сервера. Спробуйте пізніше.')
      setLoading(false)
    }
  }

  async function handleVerify() {
    if (code.length < 4) {
      setError('Введіть 4-значний код')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/user/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Помилка верифікації')
        setLoading(false)
        return
      }

      // Update session locally to reflect verified status
      await update({ verified: true })
      
      setStep(3) // Success
    } catch (e) {
      setError('Помилка сервера. Спробуйте пізніше.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href={redirectUrl} className="inline-flex items-center gap-2 text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад
        </Link>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 md:p-8 shadow-sm">
        
        {step === 1 && (
          <>
            <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6 text-[#2563EB]" />
            </div>
            <h1 className="text-[20px] font-bold text-[#0F172A] mb-2">Верифікація продавця</h1>
            <p className="text-[14px] text-[#64748B] mb-6">Щоб продавати на KRAM та гарантувати безпеку покупцям, будь ласка, підтвердіть свій номер телефону.</p>
            
            {error && (
              <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[13px] text-[#EF4444] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">Номер телефону</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+380"
                  className="w-full h-12 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[15px] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full h-12 bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] transition-colors flex items-center justify-center"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Отримати код'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="w-12 h-12 bg-[#FFFBEB] rounded-xl flex items-center justify-center mb-5">
              <KeyRound className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <h1 className="text-[20px] font-bold text-[#0F172A] mb-2">Введіть код з SMS</h1>
            <p className="text-[14px] text-[#64748B] mb-6">
              Код надіслано на номер <span className="font-semibold text-[#0F172A]">{phone}</span>.{' '}
              <button onClick={() => setStep(1)} className="text-[#2563EB] hover:underline">Змінити</button>
            </p>

            <div className="p-3 mb-6 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-[12px] text-[#1E3A8A]">
              💡 <b>Режим тестування:</b> введіть код <b>0000</b> для успішної перевірки.
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[13px] text-[#EF4444] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="mb-6">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="0000"
                className="w-full h-14 text-center tracking-[0.5em] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[24px] font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || code.length < 4}
              className="w-full h-12 bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Підтвердити'}
            </button>
          </>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-[#ECFDF5] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#A7F3D0]">
              <CheckCircle className="w-8 h-8 text-[#10B981]" />
            </div>
            <h1 className="text-[22px] font-bold text-[#0F172A] mb-2">Успішно!</h1>
            <p className="text-[14px] text-[#64748B] mb-8">Ваш акаунт верифіковано. Тепер ви можете створювати лоти та продавати на KRAM.</p>
            <Link
              href={redirectUrl}
              className="inline-flex w-full h-12 items-center justify-center bg-[#10B981] text-white rounded-xl text-[15px] font-semibold hover:bg-[#059669] transition-colors"
            >
              Продовжити
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
        <p className="text-[14px] text-[#64748B] font-medium">Завантаження верифікації...</p>
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  )
}
