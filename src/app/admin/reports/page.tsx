'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Package, User, Clock } from 'lucide-react'
import Link from 'next/link'
import { timeAgo } from '@/lib/utils'

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    const res = await fetch('/api/admin/reports')
    if (res.ok) {
      const data = await res.json()
      setReports(data)
    }
    setLoading(false)
  }

  async function handleStatus(reportId: string, status: string) {
    setProcessing(reportId)
    const res = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, status })
    })
    if (res.ok) {
      loadReports()
    }
    setProcessing(null)
  }

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[#0B1220]">Скарги користувачів</h1>
        <p className="text-[14px] text-[#64748B]">Розгляд повідомлень про порушення</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-[#94A3B8]">Завантаження...</div>
        ) : reports.length === 0 ? (
          <div className="py-20 text-center text-[#94A3B8]">Скарг немає</div>
        ) : (
          reports.map(report => (
            <div key={report.id} className={`bg-white border rounded-2xl p-6 transition-all ${
              report.status === 'pending' ? 'border-[#EF4444]/20 shadow-sm' : 'border-[#E2E8F0]'
            }`}>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      report.status === 'pending' ? 'bg-[#FEE2E2] text-[#EF4444]' : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}>
                      {report.status}
                    </span>
                    <span className="text-[12px] text-[#94A3B8]">{timeAgo(report.createdAt)}</span>
                  </div>
                  
                  <h3 className="text-[15px] font-bold text-[#0F172A] mb-2">Причина: {report.reason}</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                      <p className="text-[11px] font-bold text-[#64748B] uppercase mb-2">Відправник</p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#2563EB]" />
                        <span className="text-[13px] font-semibold text-[#0F172A]">{report.user.name}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-1">{report.user.email}</p>
                    </div>
                    
                    <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                      <p className="text-[11px] font-bold text-[#64748B] uppercase mb-2">На лот</p>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#10B981]" />
                        <Link href={`/lot/${report.listing.id}`} target="_blank" className="text-[13px] font-semibold text-[#2563EB] hover:underline line-clamp-1">
                          {report.listing.title}
                        </Link>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-1">Продавець: {report.listing.seller.name}</p>
                    </div>
                  </div>
                </div>

                <div className="lg:w-48 flex lg:flex-col gap-2 justify-end lg:justify-start">
                  {report.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatus(report.id, 'reviewed')}
                        disabled={processing === report.id}
                        className="flex-1 lg:flex-none h-10 bg-[#EFF6FF] text-[#2563EB] rounded-xl text-[13px] font-bold hover:bg-[#DBEAFE] transition-colors"
                      >
                        Переглянуто
                      </button>
                      <button
                        onClick={() => handleStatus(report.id, 'resolved')}
                        disabled={processing === report.id}
                        className="flex-1 lg:flex-none h-10 bg-[#ECFDF5] text-[#10B981] rounded-xl text-[13px] font-bold hover:bg-[#D1FAE5] transition-colors"
                      >
                        Вирішено
                      </button>
                    </>
                  )}
                  {report.status !== 'pending' && (
                     <button
                        onClick={() => handleStatus(report.id, 'pending')}
                        disabled={processing === report.id}
                        className="flex-1 lg:flex-none h-10 bg-[#F1F5F9] text-[#64748B] rounded-xl text-[13px] font-bold hover:bg-[#E2E8F0] transition-colors"
                      >
                        Повернути в очікування
                      </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
