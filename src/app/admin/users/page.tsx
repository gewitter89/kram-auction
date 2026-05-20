'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, User, Search, XCircle, CheckCircle, Clock, AlertCircle, Ban, Unlock, StickyNote, Trash2, RefreshCw } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const [qaUsers, setQaUsers] = useState<any[]>([])
  const [qaLoading, setQaLoading] = useState(false)
  const [qaMessage, setQaMessage] = useState('')

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


  async function loadQaUsers() {
    setQaLoading(true)
    setQaMessage('')
    const res = await fetch('/api/admin/qa-cleanup')
    if (res.ok) {
      const data = await res.json()
      setQaUsers(data.users || [])
    } else {
      setQaMessage((await res.json()).error || 'Не вдалося завантажити QA users')
    }
    setQaLoading(false)
  }

  async function cleanupQaUsers(emails: string[]) {
    if (emails.length === 0) return
    if (!confirm(`Видалити ${emails.length} QA/test/demo користувачів та їх артефакти? Адмінів endpoint не чіпає.`)) return
    setQaLoading(true)
    const res = await fetch('/api/admin/qa-cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails })
    })
    const data = await res.json().catch(() => ({}))
    setQaMessage(res.ok ? `Очищено: ${data.count || 0}` : (data.error || 'Помилка cleanup'))
    await loadQaUsers()
    await loadUsers()
    setQaLoading(false)
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

      <section className="mb-6 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-[16px] font-bold text-[#0B1220] flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#EF4444]" />
              QA/Test cleanup center
            </h2>
            <p className="text-[13px] text-[#64748B] mt-1">
              Безпечно знаходить лише явні QA/test/demo акаунти та чистить їхні ставки, угоди, повідомлення, скарги й saved searches. Admin users не видаляються.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={loadQaUsers}
              disabled={qaLoading}
              className="h-10 px-4 bg-white border border-[#E2E8F0] text-[#0B1220] rounded-xl text-[13px] font-bold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> {qaLoading ? 'Пошук...' : 'Preview QA users'}
            </button>
            <button
              onClick={() => cleanupQaUsers(qaUsers.map(user => user.email))}
              disabled={qaLoading || qaUsers.length === 0}
              className="h-10 px-4 bg-[#EF4444] text-white rounded-xl text-[13px] font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Cleanup all found
            </button>
          </div>
        </div>
        {qaMessage && <p className="mb-3 text-[12px] font-semibold text-[#2563EB]">{qaMessage}</p>}
        {qaUsers.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {qaUsers.map(user => (
              <div key={user.id} className="border border-[#FEE2E2] bg-[#FEF2F2] rounded-xl p-3">
                <p className="text-[13px] font-bold text-[#0F172A] truncate">{user.name}</p>
                <p className="text-[11px] text-[#64748B] truncate">{user.email}</p>
                <p className="text-[11px] text-[#991B1B] mt-1">
                  Лоти {user._count?.listings || 0} · Ставки {user._count?.bids || 0} · Угоди {(user._count?.purchases || 0) + (user._count?.sales || 0)} · Reports {user._count?.reports || 0}
                </p>
                <button
                  onClick={() => cleanupQaUsers([user.email])}
                  disabled={qaLoading}
                  className="mt-2 h-8 px-3 rounded-lg bg-white border border-[#FECACA] text-[#EF4444] text-[12px] font-bold hover:bg-[#FEE2E2]"
                >
                  Cleanup this user
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

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
                        {u.moderatorNotes?.[0] && (
                          <p className="mt-1 text-[11px] text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] rounded px-2 py-1 max-w-[260px] truncate">
                            📝 {u.moderatorNotes[0].comment}
                          </p>
                        )}
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
                      {u.restriction && (
                        <span className="flex items-center gap-1 text-[#EF4444] font-bold text-[11px] uppercase">
                          <Ban className="w-3.5 h-3.5" /> {u.restriction.level}
                        </span>
                      )}
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
                      <button
                        onClick={() => {
                          const note = prompt('Внутрішня нотатка модератора', '')
                          if (note) handleAction(u.id, 'addModeratorNote', { note })
                        }}
                        disabled={processing === u.id}
                        className="h-8 px-3 rounded-lg text-[12px] font-bold bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7] transition-all flex items-center gap-1"
                      >
                        <StickyNote className="w-3 h-3" /> Нотатка
                      </button>
                      {u.restriction ? (
                        <button
                          onClick={() => handleAction(u.id, 'clearRestriction', null)}
                          disabled={processing === u.id}
                          className="h-8 px-3 rounded-lg text-[12px] font-bold bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5] transition-all flex items-center gap-1"
                        >
                          <Unlock className="w-3 h-3" /> Розблокувати
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const level = prompt('Рівень: limited / blocked / banned', 'limited') || 'limited'
                            const reason = prompt('Причина обмеження', 'Порушення правил платформи') || 'Порушення правил платформи'
                            handleAction(u.id, 'setRestriction', { level, reason })
                          }}
                          disabled={processing === u.id}
                          className="h-8 px-3 rounded-lg text-[12px] font-bold bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] transition-all flex items-center gap-1"
                        >
                          <Ban className="w-3 h-3" /> Обмежити
                        </button>
                      )}
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
