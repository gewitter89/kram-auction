'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, User, Search, XCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    const res = await fetch(`/api/admin/users${search ? `?q=${encodeURIComponent(search)}` : ''}`)
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
    setLoading(false)
  }

  async function handleAction(userId: string, action: string, value: any) {
    setProcessing(userId)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, value })
    })
    if (res.ok) {
      loadUsers()
    }
    setProcessing(null)
  }

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#0B1220]">Користувачі</h1>
          <p className="text-[14px] text-[#64748B]">Управління правами та верифікацією</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Пошук..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadUsers()}
            className="w-full h-10 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-[14px] focus:outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <th className="text-left py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Користувач</th>
              <th className="text-left py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Роль</th>
              <th className="text-left py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Статус</th>
              <th className="text-left py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Лоти/Ставки</th>
              <th className="text-right py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center text-[#94A3B8]">Завантаження...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center text-[#94A3B8]">Нікого не знайдено</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#F1F5F9] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#94A3B8]" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#0F172A]">{u.name}</p>
                        <p className="text-[12px] text-[#64748B]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={u.role}
                      onChange={e => handleAction(u.id, 'setRole', e.target.value)}
                      disabled={processing === u.id}
                      className="bg-white border border-[#E2E8F0] rounded-lg text-[13px] px-2 py-1 outline-none"
                    >
                      <option value="user">User</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      {getVerificationBadge(u.verificationStatus, u.emailVerified)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-[13px] text-[#64748B]">
                      <p>Лотів: <span className="font-bold text-[#0F172A]">{u._count.listings}</span></p>
                      <p>Ставок: <span className="font-bold text-[#0F172A]">{u._count.bids}</span></p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {(u.verificationStatus === 'NONE' || u.verificationStatus === 'EMAIL_ONLY' || u.verificationStatus === 'REJECTED') ? (
                        <button
                          onClick={() => handleAction(u.id, 'setVerificationStatus', 'VERIFIED')}
                          disabled={processing === u.id}
                          className="h-8 px-3 rounded-lg text-[12px] font-bold bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5] transition-all"
                        >
                          Перевірити
                        </button>
                      ) : null}
                      {u.verificationStatus === 'VERIFIED' ? (
                        <button
                          onClick={() => handleAction(u.id, 'setVerificationStatus', 'REJECTED')}
                          disabled={processing === u.id}
                          className="h-8 px-3 rounded-lg text-[12px] font-bold bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] transition-all"
                        >
                          Відхилити
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleAction(u.id, 'setVerificationStatus', 'NONE')}
                        disabled={processing === u.id}
                        className="h-8 px-3 rounded-lg text-[12px] font-bold bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] transition-all"
                      >
                        Скинути
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getVerificationBadge(status: string, emailVerified: boolean) {
  switch (status) {
    case 'VERIFIED':
      return (
        <span className="flex items-center gap-1 text-[#10B981] font-bold text-[11px] uppercase">
          <CheckCircle className="w-3.5 h-3.5" /> Верифікований
        </span>
      )
    case 'EMAIL_ONLY':
      return (
        <span className="flex items-center gap-1 text-[#2563EB] font-bold text-[11px] uppercase">
          <ShieldCheck className="w-3.5 h-3.5" /> Email підтверджено
        </span>
      )
    case 'MANUAL_REVIEW':
      return (
        <span className="flex items-center gap-1 text-[#D97706] font-bold text-[11px] uppercase">
          <Clock className="w-3.5 h-3.5" /> На перевірці
        </span>
      )
    case 'REJECTED':
      return (
        <span className="flex items-center gap-1 text-[#EF4444] font-bold text-[11px] uppercase">
          <XCircle className="w-3.5 h-3.5" /> Відхилено
        </span>
      )
    default:
      return emailVerified ? (
        <span className="flex items-center gap-1 text-[#2563EB] font-bold text-[11px] uppercase">
          <ShieldCheck className="w-3.5 h-3.5" /> Email підтверджено
        </span>
      ) : (
        <span className="flex items-center gap-1 text-[#94A3B8] font-bold text-[11px] uppercase">
          <AlertCircle className="w-3.5 h-3.5" /> Не підтверджено
        </span>
      )
  }
}
