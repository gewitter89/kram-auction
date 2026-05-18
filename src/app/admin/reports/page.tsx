'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Package, User, Clock, XCircle, ShieldAlert, RotateCcw, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { timeAgo } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:      { label: 'Очікує',       bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]' },
  reviewed:     { label: 'Переглянуто',  bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]' },
  dismissed:    { label: 'Відхилено',    bg: 'bg-[#F1F5F9]', text: 'text-[#64748B]' },
  action_taken: { label: 'Вжито заходів', bg: 'bg-[#ECFDF5]', text: 'text-[#10B981]' },
  resolved:     { label: 'Вирішено',     bg: 'bg-[#ECFDF5]', text: 'text-[#10B981]' },
}

export default function AdminReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Client-side admin guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login?callbackUrl=/admin/reports')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      loadReports()
    }
  }, [status])

  async function loadReports() {
    setLoading(true)
    const res = await fetch('/api/admin/reports')
    if (res.status === 401) {
      router.replace('/auth/login?callbackUrl=/admin/reports')
      return
    }
    if (res.status === 403) {
      router.replace('/')
      return
    }
    if (res.ok) {
      const data = await res.json()
      setReports(data)
    }
    setLoading(false)
  }

  async function handleStatus(reportId: string, newStatus: string) {
    setProcessing(reportId)
    const res = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, status: newStatus })
    })
    if (res.ok) {
      await loadReports()
    }
    setProcessing(null)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
      </div>
    )
  }

  const filtered = filterStatus === 'all' ? reports : reports.filter(r => r.status === filterStatus)
  const pendingCount = reports.filter(r => r.status === 'pending').length

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
            <h1 className="text-[24px] font-bold text-[#0B1220]">Скарги користувачів</h1>
            {pendingCount > 0 && (
              <span className="inline-flex items-center h-5 min-w-[20px] px-1.5 bg-[#EF4444] text-white text-[10px] font-bold rounded-full">
                {pendingCount}
              </span>
            )}
          </div>
          <p className="text-[14px] text-[#64748B]">
            Розгляд повідомлень про порушення правил платформи
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          {['all', 'pending', 'reviewed', 'action_taken', 'dismissed'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`h-7 px-3 rounded-lg text-[11px] font-bold transition-all ${
                filterStatus === s
                  ? 'bg-white shadow-sm text-[#0B1220]'
                  : 'text-[#64748B] hover:text-[#0B1220]'
              }`}
            >
              {s === 'all' ? 'Усі' : STATUS_CONFIG[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-[#94A3B8]">Завантаження...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto mb-3 opacity-40" />
            <p className="text-[#94A3B8] font-semibold">
              {filterStatus === 'all' ? 'Скарг немає' : 'Немає скарг з цим статусом'}
            </p>
          </div>
        ) : (
          filtered.map(report => {
            const st = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending
            return (
              <div
                key={report.id}
                className={`bg-white border rounded-2xl p-6 transition-all ${
                  report.status === 'pending' ? 'border-[#EF4444]/25 shadow-sm' : 'border-[#E2E8F0]'
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${st.bg} ${st.text}`}>
                        {st.label}
                      </span>
                      <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(report.createdAt)}
                      </span>
                      <span className="text-[10px] text-[#CBD5E1] font-mono">#{report.id.slice(-8)}</span>
                    </div>

                    {/* Reason */}
                    <h3 className="text-[15px] font-bold text-[#0F172A] mb-2">
                      Причина: {report.reason}
                    </h3>

                    {/* Comment */}
                    {report.comment && (
                      <div className="mb-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-[#64748B] shrink-0 mt-0.5" />
                        <p className="text-[12px] text-[#475569] leading-relaxed italic">
                          &ldquo;{report.comment}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                        <p className="text-[11px] font-bold text-[#64748B] uppercase mb-2">Відправник</p>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#2563EB]" />
                          <span className="text-[13px] font-semibold text-[#0F172A]">{report.user.name}</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-1 truncate">
                          {report.user.email.replace(/(?<=.{3}).(?=[^@]*@)/g, '*')}
                        </p>
                      </div>

                      <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                        <p className="text-[11px] font-bold text-[#64748B] uppercase mb-2">Лот</p>
                        {report.listing ? (
                          <>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-[#10B981]" />
                              <Link
                                href={`/lot/${report.listing.id}`}
                                target="_blank"
                                className="text-[13px] font-semibold text-[#2563EB] hover:underline line-clamp-1"
                              >
                                {report.listing.title}
                              </Link>
                            </div>
                            <p className="text-[11px] text-[#64748B] mt-1">Продавець: {report.listing.seller?.name}</p>
                          </>
                        ) : (
                          <span className="text-[12px] text-[#94A3B8]">Лот видалено</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="lg:w-52 flex flex-row lg:flex-col gap-2 justify-end lg:justify-start lg:pt-8 shrink-0">
                    {report.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatus(report.id, 'reviewed')}
                          disabled={processing === report.id}
                          className="flex-1 lg:flex-none h-10 px-3 bg-[#EFF6FF] text-[#2563EB] rounded-xl text-[12px] font-bold hover:bg-[#DBEAFE] transition-colors disabled:opacity-50"
                        >
                          Переглянуто
                        </button>
                        <button
                          onClick={() => handleStatus(report.id, 'action_taken')}
                          disabled={processing === report.id}
                          className="flex-1 lg:flex-none h-10 px-3 bg-[#ECFDF5] text-[#10B981] rounded-xl text-[12px] font-bold hover:bg-[#D1FAE5] transition-colors disabled:opacity-50"
                        >
                          Вжити заходів
                        </button>
                        <button
                          onClick={() => handleStatus(report.id, 'dismissed')}
                          disabled={processing === report.id}
                          className="flex-1 lg:flex-none h-10 px-3 bg-[#FEF2F2] text-[#EF4444] rounded-xl text-[12px] font-bold hover:bg-[#FEE2E2] transition-colors disabled:opacity-50"
                        >
                          Відхилити
                        </button>
                      </>
                    )}
                    {report.status !== 'pending' && (
                      <button
                        onClick={() => handleStatus(report.id, 'pending')}
                        disabled={processing === report.id}
                        className="flex-1 lg:flex-none h-10 px-3 bg-[#F1F5F9] text-[#64748B] rounded-xl text-[12px] font-bold hover:bg-[#E2E8F0] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        В очікування
                      </button>
                    )}
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
