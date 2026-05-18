'use client'

import { useEffect, useState } from 'react'
import { Package, Trash2, ExternalLink, Clock, User } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export default function AdminLotsPage() {
  const [lots, setLots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadLots()
  }, [])

  async function loadLots() {
    const res = await fetch('/api/admin/lots')
    if (res.ok) {
      const data = await res.json()
      setLots(data)
    }
    setLoading(false)
  }

  async function handleDelete(lotId: string) {
    if (!confirm('Ви впевнені, що хочете видалити цей лот?')) return
    setProcessing(lotId)
    const res = await fetch('/api/admin/lots', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lotId })
    })
    if (res.ok) {
      loadLots()
    }
    setProcessing(null)
  }

  async function handlePurgeFake() {
    if (!confirm('Ви впевнені, що хочете видалити всі фейкові/тестові лоти? Ця дія є незворотною.')) return
    setLoading(true)
    const res = await fetch('/api/admin/lots', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deleteAllFake: true })
    })
    if (res.ok) {
      loadLots()
    } else {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#0B1220]">Модерація лотів</h1>
          <p className="text-[14px] text-[#64748B]">Контроль за контентом та видалення порушень</p>
        </div>
        <button
          onClick={handlePurgeFake}
          className="h-10 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[13px] font-bold transition-all shadow-md shadow-amber-500/20 hover:scale-[1.02] flex items-center justify-center gap-1.5"
        >
          🧹 Видалити всі тестові лоти
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-20 text-center text-[#94A3B8]">Завантаження...</div>
        ) : lots.length === 0 ? (
          <div className="col-span-full py-20 text-center text-[#94A3B8]">Лотів немає</div>
        ) : (
          lots.map(lot => {
            let images = []
            try { images = JSON.parse(lot.images || '[]') } catch {}
            return (
              <div key={lot.id} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col">
                <div className="aspect-video bg-[#F1F5F9] relative overflow-hidden">
                  {images[0] && <img src={images[0]} alt="" className="w-full h-full object-cover" />}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      lot.status === 'active' ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}>
                      {lot.status}
                    </span>
                    {lot.featured && (
                      <span className="bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 rounded-full text-[10px] font-bold">VIP</span>
                    )}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-[14px] font-bold text-[#0F172A] mb-2 line-clamp-1">{lot.title}</h3>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
                      <User className="w-3.5 h-3.5" />
                      <span>{lot.seller.name || lot.seller.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(lot.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[16px] font-bold text-[#2563EB]">{formatPrice(lot.currentPrice)}</span>
                      <span className="text-[11px] text-[#94A3B8]">{lot._count.bids} ставок</span>
                    </div>
                  </div>
                  <div className="mt-auto flex gap-2">
                    <Link
                      href={`/lot/${lot.id}`}
                      target="_blank"
                      className="flex-1 h-9 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-center gap-2 text-[12px] font-bold text-[#64748B] hover:bg-[#F1F5F9]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Переглянути
                    </Link>
                    <button
                      onClick={() => handleDelete(lot.id)}
                      disabled={processing === lot.id}
                      className="w-9 h-9 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg flex items-center justify-center text-[#EF4444] hover:bg-[#FEE2E2]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
