'use client'

import { useEffect, useState } from 'react'
import { Trash2, ExternalLink, Clock, User, EyeOff, RotateCcw, Star, CheckCircle2, XCircle, AlertTriangle, Edit3, Bot } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'


function parseModeration(comment: string) {
  try {
    const parsed = JSON.parse(comment)
    return {
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
      source: parsed.source,
      olxUrl: parsed.olxUrl,
      offerId: parsed.offerId,
      rejectionReason: parsed.rejectionReason,
      raw: comment,
    }
  } catch {
    return { reasons: [comment], raw: comment }
  }
}

export default function AdminLotsPage() {
  const [lots, setLots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [autopilotSummary, setAutopilotSummary] = useState<string>('')

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

  async function handleModerate(lotId: string, action: string) {
    const reason = action === 'reject'
      ? prompt('Причина відхилення для продавця:', 'Недостатньо інформації або фото. Оновіть лот і надішліть повторно.')
      : undefined
    if (action === 'reject' && !reason) return
    setProcessing(lotId)
    const res = await fetch('/api/admin/lots', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lotId, action, reason })
    })
    if (res.ok) loadLots()
    else alert((await res.json()).error || 'Помилка')
    setProcessing(null)
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


  async function handleAutopilot(lotId?: string, dryRun = true) {
    setProcessing(lotId || 'autopilot')
    setAutopilotSummary('')
    const res = await fetch('/api/admin/lots/autopilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lotId, dryRun, limit: 25 })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data.error || 'Помилка autopilot')
    } else {
      const details = (data.results || []).slice(0, 5).map((item: any) => `${item.title}: ${item.decision} (${item.riskLevel})`).join('\n')
      setAutopilotSummary(`Перевірено: ${data.total}. Auto approve: ${data.autoApproved}. Manual: ${data.manualReview}.${details ? `\n${details}` : ''}`)
      if (!dryRun) await loadLots()
    }
    setProcessing(null)
  }

  async function handlePurgeFake() {
    if (!confirm('Ви впевнені, що хочете видалити всі seed/test лоти? Ця дія є незворотною.')) return
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
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => handleAutopilot(undefined, true)}
            disabled={processing === 'autopilot'}
            className="h-10 px-5 bg-white border border-[#BFDBFE] text-[#2563EB] rounded-xl text-[13px] font-bold transition-all hover:bg-[#EFF6FF] flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            <Bot className="w-4 h-4" /> AI dry run
          </button>
          <button
            onClick={() => { if (confirm('Автоматично схвалити лише low-risk pending лоти? Сумнівні залишаться на ручну перевірку.')) handleAutopilot(undefined, false) }}
            disabled={processing === 'autopilot'}
            className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-[13px] font-bold transition-all shadow-md shadow-[#2563EB]/20 flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            <Bot className="w-4 h-4" /> Auto approve low-risk
          </button>
          <button
            onClick={handlePurgeFake}
            className="h-10 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[13px] font-bold transition-all shadow-md shadow-amber-500/20 hover:scale-[1.02] flex items-center justify-center gap-1.5"
          >
            🧹 Видалити seed/test лоти
          </button>
        </div>
      </div>

      {autopilotSummary && (
        <pre className="mb-4 whitespace-pre-wrap bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] rounded-2xl p-4 text-[12px] font-semibold">{autopilotSummary}</pre>
      )}

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
              <div key={lot.id} className={`bg-white border rounded-2xl overflow-hidden flex flex-col ${lot.status === 'pending_review' ? 'border-[#F59E0B] ring-2 ring-[#F59E0B]/20 animate-pulse' : 'border-[#E2E8F0]'}`}>
                <div className="aspect-video bg-[#F1F5F9] relative overflow-hidden">
                  {images[0] && <img src={images[0]} alt="" className="w-full h-full object-cover" />}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      lot.status === 'active' ? 'bg-[#ECFDF5] text-[#10B981]' : lot.status === 'pending_review' ? 'bg-[#FFFBEB] text-[#D97706]' : lot.status === 'rejected' ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-[#F1F5F9] text-[#64748B]'
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
                  {lot.reports?.[0]?.comment && (() => {
                    const moderation = parseModeration(lot.reports[0].comment)
                    return (
                      <div className="mb-3 p-2 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-[11px] text-[#92400E] space-y-2">
                        <div className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>{moderation.reasons.length ? moderation.reasons.join(' • ') : 'Потребує перевірки'}</span>
                        </div>
                        {moderation.olxUrl && (
                          <a href={moderation.olxUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#2563EB] font-bold hover:underline">
                            <ExternalLink className="w-3 h-3" /> Джерело OLX
                          </a>
                        )}
                      </div>
                    )
                  })()}
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
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <Link
                      href={`/lot/${lot.id}`}
                      target="_blank"
                      className="h-9 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-center gap-2 text-[12px] font-bold text-[#64748B] hover:bg-[#F1F5F9]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Переглянути
                    </Link>
                    <Link
                      href={`/lots/${lot.id}/edit`}
                      target="_blank"
                      className="h-9 bg-white border border-[#E2E8F0] rounded-lg flex items-center justify-center gap-2 text-[12px] font-bold text-[#64748B] hover:bg-[#F8FAFC]"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Редагувати
                    </Link>
                    {lot.status === 'pending_review' ? (
                      <>
                        <button onClick={() => handleAutopilot(lot.id, true)} disabled={processing === lot.id} className="h-9 bg-white border border-[#BFDBFE] rounded-lg flex items-center justify-center gap-1 text-[12px] font-bold text-[#2563EB] hover:bg-[#EFF6FF]">
                          <Bot className="w-3.5 h-3.5" /> AI check
                        </button>
                        <button onClick={() => handleModerate(lot.id, 'approve')} disabled={processing === lot.id} className="h-9 bg-[#10B981] rounded-lg flex items-center justify-center gap-1 text-[12px] font-bold text-white hover:bg-[#059669]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Схвалити
                        </button>
                        <button onClick={() => handleModerate(lot.id, 'reject')} disabled={processing === lot.id} className="h-9 bg-[#FEF2F2] border border-[#FECACA] rounded-lg flex items-center justify-center gap-1 text-[12px] font-bold text-[#EF4444] hover:bg-[#FEE2E2]">
                          <XCircle className="w-3.5 h-3.5" /> Відхилити
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleModerate(lot.id, lot.featured ? 'unfeature' : 'feature')}
                          disabled={processing === lot.id}
                          className="h-9 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg flex items-center justify-center gap-1 text-[12px] font-bold text-[#D97706] hover:bg-[#FEF3C7]"
                        >
                          <Star className="w-3.5 h-3.5" /> {lot.featured ? 'Зняти VIP' : 'VIP'}
                        </button>
                        <button
                          onClick={() => handleModerate(lot.id, lot.status === 'active' ? 'hide' : 'restore')}
                          disabled={processing === lot.id}
                          className="h-9 bg-white border border-[#E2E8F0] rounded-lg flex items-center justify-center gap-1 text-[12px] font-bold text-[#64748B] hover:bg-[#F8FAFC]"
                        >
                          {lot.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                          {lot.status === 'active' ? 'Сховати' : 'Відновити'}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(lot.id)}
                      disabled={processing === lot.id}
                      className="h-9 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg flex items-center justify-center gap-1 text-[12px] font-bold text-[#EF4444] hover:bg-[#FEE2E2]"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Видалити
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
