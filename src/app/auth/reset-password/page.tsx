'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { KramLogo } from '@/components/brand/KramLogo'

function ResetPasswordContent() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Помилка'); return }
    setDone(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-[400px]">
        <KramLogo variant="full" size={34} />
        <h1 className="text-[24px] font-bold text-[#0B1220] mb-2">Новий пароль</h1>
        {done ? (
          <div className="text-center bg-white border border-[#E2E8F0] rounded-2xl p-6">
            <p className="text-[14px] text-[#64748B] mb-5">Пароль успішно змінено.</p>
            <Link href="/auth/login" className="inline-flex h-11 px-6 items-center bg-[#2563EB] text-white rounded-xl text-[14px] font-bold">Увійти</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 bg-white border border-[#E2E8F0] rounded-2xl p-6">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required placeholder="Мінімум 8 символів" className="w-full h-11 px-4 border border-[#E2E8F0] rounded-xl text-[14px]" />
            {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
            <button disabled={loading || !token} className="w-full h-11 bg-[#2563EB] text-white rounded-xl text-[14px] font-bold disabled:opacity-60">{loading ? 'Збереження...' : 'Змінити пароль'}</button>
          </form>
        )}
      </div>
    </div>
  )
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#64748B]">Завантаження...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
