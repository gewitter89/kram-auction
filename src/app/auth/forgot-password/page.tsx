'use client'

import { useState } from 'react'
import Link from 'next/link'
import { KramLogo } from '@/components/brand/KramLogo'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-[400px]">
        <KramLogo variant="full" size={34} />

        {!sent ? (
          <>
            <h1 className="text-[24px] font-bold text-[#0B1220] mb-2">Відновити пароль</h1>
            <p className="text-[14px] text-[#64748B] mb-8">
              Введіть email, і ми надішлемо посилання для скидання пароля.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full h-11 px-4 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
                />
              </div>
              <button type="submit" className="w-full h-11 bg-[#2563EB] text-white rounded-xl text-[14px] font-semibold hover:bg-[#1D4ED8] transition-colors">
                Надіслати посилання
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-5 bg-[#ECFDF5] rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-[20px] font-bold text-[#0B1220] mb-2">Перевірте пошту</h2>
            <p className="text-[14px] text-[#64748B] mb-6">
              Ми надіслали посилання для скидання пароля на <strong>{email}</strong>
            </p>
          </div>
        )}

        <Link href="/auth/login" className="mt-6 flex items-center justify-center gap-2 text-[13px] text-[#64748B] hover:text-[#2563EB]">
          <ArrowLeft className="w-4 h-4" />
          Повернутись до входу
        </Link>
      </div>
    </div>
  )
}
