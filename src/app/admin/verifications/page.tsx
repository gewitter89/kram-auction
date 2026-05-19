'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, CheckCircle2, XCircle, Clock, User, Mail, Phone, MapPin, FileText } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

type VerificationRequest = {
  id: string
  status: string
  createdAt: string
  user: { id: string; name: string; email: string; verified: boolean; verificationStatus?: string | null }
  details: { email?: string; city?: string; phone?: string; goods?: string }
}

export default function AdminVerificationsPage() {
  const [items, setItems] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/verifications')
    if (res.ok) {
      const data = await res.json()
      setItems(data.requests || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function decide(id: string, decision: 'approve' | 'reject') {
    setProcessing(id)
    const res = await fetch('/api/admin/verifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: id, decision })
    })
    if (!res.ok) alert((await res.json()).error || 'Помилка')
    await load()
    setProcessing(null)
  }

  const pending = items.filter(item => item.status === 'pending').length

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
            <h1 className="text-[24px] font-bold text-[#0B1220]">Верифікація продавців</h1>
            {pending > 0 && <span className="inline-flex items-center h-5 min-w-[20px] px-1.5 bg-[#F59E0B] text-white text-[10px] font-bold rounded-full">{pending}</span>}
          </div>
          <p className="text-[14px] text-[#64748B]">Перевіряйте заявки продавців перед дозволом публікувати лоти.</p>
        </div>
        <Link href="/admin" className="h-10 px-4 inline-flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-semibold text-[#64748B] hover:bg-[#F8FAFC]">
          До адмінки
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#94A3B8]">Завантаження...</div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center bg-white border border-[#E2E8F0] rounded-2xl">
          <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto mb-3 opacity-50" />
          <p className="text-[#64748B] font-semibold">Заявок на верифікацію поки немає</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="w-11 h-11 bg-[#EFF6FF] rounded-xl flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-[#2563EB]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.status === 'pending' ? 'bg-[#FFFBEB] text-[#D97706]' : item.status === 'action_taken' ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                      {item.status === 'pending' ? 'Очікує перевірки' : item.status === 'action_taken' ? 'Підтверджено' : 'Відхилено'}
                    </span>
                    <span className="text-[12px] text-[#94A3B8] flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(item.createdAt)}</span>
                  </div>

                  <h2 className="text-[16px] font-bold text-[#0B1220]">{item.user.name}</h2>
                  <div className="mt-2 grid sm:grid-cols-2 gap-2 text-[13px] text-[#64748B]">
                    <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{item.user.email}</div>
                    {item.details.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{item.details.phone}</div>}
                    {item.details.city && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{item.details.city}</div>}
                  </div>

                  {item.details.goods && (
                    <div className="mt-4 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1 flex items-center gap-1"><FileText className="w-3 h-3" />Що планує продавати</p>
                      <p className="text-[13px] text-[#0F172A] leading-relaxed whitespace-pre-wrap">{item.details.goods}</p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/admin/users?q=${encodeURIComponent(item.user.email)}`} className="h-9 px-3 inline-flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[12px] font-bold text-[#64748B] hover:bg-[#F8FAFC]">
                      Профіль в адмінці
                    </Link>
                    {item.status === 'pending' && (
                      <>
                        <button disabled={processing === item.id} onClick={() => decide(item.id, 'approve')} className="h-9 px-4 inline-flex items-center gap-1.5 rounded-lg bg-[#10B981] text-white text-[12px] font-bold hover:bg-[#059669] disabled:opacity-60">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Підтвердити
                        </button>
                        <button disabled={processing === item.id} onClick={() => decide(item.id, 'reject')} className="h-9 px-4 inline-flex items-center gap-1.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] text-[12px] font-bold hover:bg-[#FEE2E2] disabled:opacity-60">
                          <XCircle className="w-3.5 h-3.5" /> Відхилити
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
