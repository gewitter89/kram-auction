'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Users, Package, Gavel, AlertCircle, TrendingUp, ShieldCheck, HandCoins, Scale, CheckCircle2, XCircle, Wrench } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [readiness, setReadiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [ensuringCategories, setEnsuringCategories] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin')
      return
    }
    if (status === 'authenticated') {
      // Check if admin
      fetch('/api/admin/stats').then(r => {
        if (r.status === 403) {
          router.push('/')
          return null
        }
        return r.json()
      }).then(d => {
        if (d) {
          setData(d)
          setLoading(false)
          fetch('/api/admin/readiness').then(r => r.ok ? r.json() : null).then(setReadiness).catch(() => {})
        }
      })
    }
  }, [status, router])

  if (loading) {
    return <div className="max-w-[1320px] mx-auto px-4 py-8"><div className="text-[14px] text-[#64748B]">Завантаження...</div></div>
  }

  if (!data) return null


  async function ensureCategories() {
    setEnsuringCategories(true)
    try {
      await fetch('/api/admin/categories/ensure', { method: 'POST' })
      const res = await fetch('/api/admin/readiness')
      if (res.ok) setReadiness(await res.json())
    } finally {
      setEnsuringCategories(false)
    }
  }

  const cards = [
    { icon: Users, label: 'Користувачів', value: data.users, color: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]' },
    { icon: Package, label: 'Активних лотів', value: data.activeLots, color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]' },
    { icon: Gavel, label: 'Ставок сьогодні', value: data.bidsToday, color: 'text-[#F59E0B]', bg: 'bg-[#FFFBEB]' },
    { icon: TrendingUp, label: 'Завершено угод', value: data.completedDeals, color: 'text-[#0B1220]', bg: 'bg-[#F1F5F9]' },
  ]

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="w-5 h-5 text-[#10B981]" />
        <span className="text-[12px] font-semibold text-[#10B981] uppercase tracking-wider">Admin Panel</span>
      </div>
      <h1 className="text-[24px] font-bold text-[#0B1220] mb-6">Дашборд</h1>


      {/* Production readiness */}
      {readiness && (
        <div className={`mb-8 rounded-2xl border p-5 ${readiness.ready ? 'bg-[#ECFDF5] border-[#10B981]/25' : 'bg-white border-[#E2E8F0]'}`}>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {readiness.ready ? <CheckCircle2 className="w-5 h-5 text-[#10B981]" /> : <AlertCircle className="w-5 h-5 text-[#F59E0B]" />}
                <h2 className="text-[16px] font-bold text-[#0B1220]">Production readiness</h2>
              </div>
              <p className="text-[13px] text-[#64748B] max-w-2xl">
                Контрольний список перед публічним запуском: фото-сховище, категорії, cron, auth, модерація та прострочені аукціони.
              </p>
            </div>
            <button
              onClick={ensureCategories}
              disabled={ensuringCategories}
              className="h-10 px-4 bg-[#0B1220] text-white rounded-xl text-[13px] font-bold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              {ensuringCategories ? 'Перевіряємо...' : 'Створити базові категорії'}
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {readiness.checks.map((check: any) => (
              <div key={check.key} className="bg-white border border-[#E2E8F0] rounded-xl p-3 flex items-start gap-2">
                {check.ok ? <CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />}
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[#0F172A] leading-snug">{check.label}</p>
                  {typeof check.value !== 'undefined' && <p className="text-[11px] text-[#64748B] mt-0.5">Значення: {check.value}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => {
          const Icon = c.icon
          return (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
              <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <p className="text-[24px] font-bold text-[#0B1220]">{c.value.toLocaleString('uk-UA')}</p>
              <p className="text-[12px] text-[#64748B]">{c.label}</p>
            </div>
          )
        })}
      </div>

      {/* Sections */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Link href="/admin/users" className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#2563EB]/40 transition-colors">
          <Users className="w-7 h-7 text-[#2563EB] mb-3" />
          <h3 className="text-[15px] font-bold text-[#0B1220] mb-1">Користувачі</h3>
          <p className="text-[13px] text-[#64748B]">Управління акаунтами, верифікація</p>
        </Link>
        <Link href="/admin/lots" className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#2563EB]/40 transition-colors">
          <Package className="w-7 h-7 text-[#10B981] mb-3" />
          <h3 className="text-[15px] font-bold text-[#0B1220] mb-1">Лоти</h3>
          <p className="text-[13px] text-[#64748B]">Модерація, видалення лотів</p>
        </Link>
        <Link href="/admin/reports" className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#2563EB]/40 transition-colors">
          <AlertCircle className="w-7 h-7 text-[#EF4444] mb-3" />
          <h3 className="text-[15px] font-bold text-[#0B1220] mb-1">Скарги</h3>
          <p className="text-[13px] text-[#64748B]">{data.pendingReports} нових скарг</p>
        </Link>
        <Link href="/admin/payouts" className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#2563EB]/40 transition-colors">
          <HandCoins className="w-7 h-7 text-[#F59E0B] mb-3" />
          <h3 className="text-[15px] font-bold text-[#0B1220] mb-1">Виплати (Payouts)</h3>
          <p className="text-[13px] text-[#64748B]">Управління виплатами продавцям</p>
        </Link>
        <Link href="/admin/disputes" className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#2563EB]/40 transition-colors">
          <Scale className="w-7 h-7 text-[#8B5CF6] mb-3" />
          <h3 className="text-[15px] font-bold text-[#0B1220] mb-1">Арбітраж (Disputes)</h3>
          <p className="text-[13px] text-[#64748B]">Вирішення суперечок по угодах</p>
        </Link>
      </div>

      {/* Recent users */}
      <div className="mt-8 bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <h2 className="text-[16px] font-bold text-[#0B1220] mb-4">Останні користувачі</h2>
        <div className="space-y-2">
          {(data.recentUsers || []).map((u: any) => (
            <div key={u.id} className="flex items-center justify-between p-3 border border-[#F1F5F9] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#F1F5F9] rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#94A3B8]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#0F172A]">{u.name}</p>
                  <p className="text-[11px] text-[#64748B]">{u.email}</p>
                </div>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                u.role === 'admin' ? 'bg-[#FEF3C7] text-[#92400E]' :
                u.role === 'seller' ? 'bg-[#EFF6FF] text-[#2563EB]' :
                'bg-[#F1F5F9] text-[#64748B]'
              }`}>
                {u.role === 'admin' ? 'Адмін' : u.role === 'seller' ? 'Продавець' : 'Покупець'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
