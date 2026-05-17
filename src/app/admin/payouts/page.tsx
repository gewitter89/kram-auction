'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, RefreshCw, HandCoins } from 'lucide-react'

type Payout = {
  id: string
  amount: number
  currency: string
  availableAt: string
  transaction: {
    id: string
    listing: { title: string }
    seller: { name: string; email: string }
  }
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPayouts()
  }, [])

  async function fetchPayouts() {
    try {
      const res = await fetch('/api/admin/payouts')
      const data = await res.json()
      if (res.ok) {
        setPayouts(data.releases)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Помилка завантаження виплат')
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkPaid(id: string) {
    if (!confirm('Ви впевнені, що перевели кошти продавцю?')) return

    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/payouts/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerReference: 'MANUAL_BANK_TRANSFER' })
      })
      if (res.ok) {
        setPayouts(prev => prev.filter(p => p.id !== id))
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
            <HandCoins className="w-6 h-6 text-[#10B981]" />
            Центр виплат (Payouts)
          </h1>
          <p className="text-[#64748B] text-[14px] mt-1">Очікують ручної виплати продавцям після підтвердження угод</p>
        </div>
        <button onClick={fetchPayouts} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[14px] font-semibold hover:bg-[#F8FAFC]">
          <RefreshCw className="w-4 h-4" /> Оновити
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#EF4444] flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {payouts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E2E8F0] rounded-2xl">
          <CheckCircle className="w-12 h-12 text-[#10B981] mx-auto mb-3" />
          <h3 className="text-[18px] font-bold text-[#0F172A]">Усі виплати проведено</h3>
          <p className="text-[#64748B]">Наразі немає угод, які очікують на переказ коштів.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[13px] text-[#64748B] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Продавець</th>
                <th className="px-6 py-4 font-semibold">Лот / Угода</th>
                <th className="px-6 py-4 font-semibold">Сума</th>
                <th className="px-6 py-4 font-semibold text-right">Дія</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {payouts.map(payout => (
                <tr key={payout.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[#0F172A]">{payout.transaction.seller.name}</div>
                    <div className="text-[13px] text-[#64748B]">{payout.transaction.seller.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[#0F172A] max-w-[250px] truncate" title={payout.transaction.listing.title}>
                      {payout.transaction.listing.title}
                    </div>
                    <div className="text-[12px] text-[#94A3B8] mt-0.5">ID: {payout.transaction.id.slice(-6)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#10B981]">{payout.amount.toLocaleString('uk-UA')} {payout.currency}</div>
                    <div className="text-[12px] text-[#64748B]">Очікує з {new Date(payout.availableAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleMarkPaid(payout.id)}
                      disabled={processingId === payout.id}
                      className="inline-flex items-center px-4 py-2 bg-[#10B981] text-white rounded-lg text-[13px] font-bold hover:bg-[#059669] transition-colors disabled:opacity-50"
                    >
                      {processingId === payout.id ? 'Обробка...' : 'Підтвердити виплату'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
