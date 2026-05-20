'use client'

import { useState, useEffect } from 'react'
import { Scale, CheckCircle, AlertCircle, RefreshCw, XCircle } from 'lucide-react'
import Link from 'next/link'

type Dispute = {
  id: string
  status: string
  amount: number
  buyer: { name: string; email: string; phone: string }
  seller: { name: string; email: string; phone: string }
  listing: { title: string; id: string }
  updatedAt: string
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchDisputes()
  }, [])

  async function fetchDisputes() {
    try {
      const res = await fetch('/api/admin/disputes')
      const data = await res.json()
      if (res.ok) {
        setDisputes(data.disputes)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Помилка завантаження арбітражів')
    } finally {
      setLoading(false)
    }
  }

  async function handleResolve(id: string, action: 'CANCEL_FOR_BUYER' | 'COMPLETE_FOR_SELLER') {
    const actionText = action === 'CANCEL_FOR_BUYER' ? 'скасувати угоду на користь покупця' : 'завершити угоду на користь продавця'
    if (!confirm(`Ви впевнені, що хочете ${actionText}? KRAM лише фіксує рішення спору і не проводить оплату/повернення коштів.`)) return

    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/disputes/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution: action, notes: notes[id] || '' })
      })
      if (res.ok) {
        setDisputes(prev => prev.filter(d => d.id !== id))
        alert('Рішення успішно застосовано')
      } else {
        alert('Помилка при збереженні')
      }
    } catch {
      alert('Помилка мережі')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-[#64748B]">Завантаження...</div>
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-[#0F172A] flex items-center gap-2">
            <Scale className="w-6 h-6 text-[#8B5CF6]" />
            Модерація спорів
          </h1>
          <p className="text-[#64748B] text-[14px] mt-1">Фіксація рішень по проблемних прямих домовленостях. KRAM не проводить оплату чи повернення коштів.</p>
        </div>
        <button onClick={fetchDisputes} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[14px] font-semibold hover:bg-[#F8FAFC]">
          <RefreshCw className="w-4 h-4" /> Оновити
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#EF4444] flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {disputes.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E2E8F0] rounded-2xl">
          <CheckCircle className="w-12 h-12 text-[#10B981] mx-auto mb-3" />
          <h3 className="text-[18px] font-bold text-[#0F172A]">Все спокійно</h3>
          <p className="text-[#64748B]">Наразі немає відкритих спорів.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map(dispute => (
            <div key={dispute.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4 border-b border-[#F1F5F9] pb-4">
                <div>
                  <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">
                    Угода: <Link href={`/cabinet/transactions/${dispute.id}`} target="_blank" className="text-[#2563EB] hover:underline">{dispute.listing.title}</Link>
                  </h3>
                  <p className="text-[13px] text-[#64748B]">Сума: <span className="font-bold text-[#0F172A]">{dispute.amount.toLocaleString('uk-UA')} ₴</span> | Відкрито: {new Date(dispute.updatedAt).toLocaleString('uk-UA')}</p>
                </div>
                <div className="px-3 py-1 bg-[#FEF2F2] text-[#EF4444] rounded-lg text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Спір відкритий
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <h4 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">👤 Покупець</h4>
                  <p className="text-[14px] font-medium text-[#0F172A]">{dispute.buyer.name}</p>
                  <p className="text-[13px] text-[#64748B]">{dispute.buyer.email}</p>
                  <p className="text-[13px] text-[#64748B]">{dispute.buyer.phone || 'Телефон не вказано'}</p>
                </div>
                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <h4 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">📦 Продавець</h4>
                  <p className="text-[14px] font-medium text-[#0F172A]">{dispute.seller.name}</p>
                  <p className="text-[13px] text-[#64748B]">{dispute.seller.email}</p>
                  <p className="text-[13px] text-[#64748B]">{dispute.seller.phone || 'Телефон не вказано'}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">Коментар адміна (внутрішній)</label>
                <textarea
                  value={notes[dispute.id] || ''}
                  onChange={e => setNotes({ ...notes, [dispute.id]: e.target.value })}
                  placeholder="Опишіть причину рішення (наприклад: 'Продавець надав фото квитанції, товар забрано...')"
                  rows={2}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] focus:outline-none focus:border-[#8B5CF6] resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleResolve(dispute.id, 'CANCEL_FOR_BUYER')}
                  disabled={processingId === dispute.id}
                  className="flex-1 flex items-center justify-center gap-2 h-11 bg-white border-2 border-[#EF4444] text-[#EF4444] rounded-xl text-[14px] font-semibold hover:bg-[#FEF2F2] transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> Скасувати на користь покупця
                </button>
                <button
                  onClick={() => handleResolve(dispute.id, 'COMPLETE_FOR_SELLER')}
                  disabled={processingId === dispute.id}
                  className="flex-1 flex items-center justify-center gap-2 h-11 bg-white border-2 border-[#10B981] text-[#10B981] rounded-xl text-[14px] font-semibold hover:bg-[#ECFDF5] transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" /> Завершити на користь продавця
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
