import { auth } from '@/lib/auth-config'
import Link from 'next/link'
import { ShieldAlert, CheckCircle2, Package, User } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import { prisma } from '@/lib/prisma'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:      { label: 'Очікує',       bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]' },
  reviewed:     { label: 'Переглянуто',  bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]' },
  dismissed:    { label: 'Відхилено',    bg: 'bg-[#F1F5F9]', text: 'text-[#64748B]' },
  action_taken: { label: 'Вжито заходів', bg: 'bg-[#ECFDF5]', text: 'text-[#10B981]' },
  resolved:     { label: 'Вирішено',     bg: 'bg-[#ECFDF5]', text: 'text-[#10B981]' },
}

export default async function AdminReportsPage() {
  const session = await auth()
  
  if (!session?.user) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-[#EF4444] mx-auto mb-4" />
        <h1 className="text-[22px] font-bold text-[#0B1220] mb-2">Увійдіть, щоб переглянути скарги</h1>
        <p className="text-[14px] text-[#64748B] mb-6">Цей розділ доступний лише адміністраторам KRAM.</p>
        <Link href="/auth/login?callbackUrl=/admin/reports" className="inline-flex h-12 px-8 bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] transition-colors">
          Увійти
        </Link>
      </div>
    )
  }
  
  if (session.user.role !== 'admin' && session.user.email !== 'admin@kram.ua') {
    return (
      <div className="max-w-[1320px] mx-auto px-4 py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-[#D97706] mx-auto mb-4" />
        <h1 className="text-[22px] font-bold text-[#0B1220] mb-2">Доступ лише для адміністратора</h1>
        <p className="text-[14px] text-[#64748B] mb-6">У вас недостатньо прав для перегляду цієї сторінки</p>
        <Link href="/" className="inline-flex h-12 px-8 bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] transition-colors">
          На головну
        </Link>
      </div>
    )
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
      listing: { select: { id: true, title: true } }
    }
  })

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
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="py-20 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto mb-3 opacity-40" />
            <p className="text-[#94A3B8] font-semibold">Скарг поки немає</p>
          </div>
        ) : (
          reports.map(r => {
            const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending
            return (
              <div key={r.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F8FAFC] rounded-xl flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                      <span className="text-[12px] text-[#94A3B8]">{timeAgo(r.createdAt)}</span>
                    </div>
                    <p className="text-[14px] font-semibold text-[#0B1220] mb-1">
                      {r.reason}
                    </p>
                    {r.comment && (
                      <p className="text-[13px] text-[#64748B] mb-3 leading-relaxed">
                        {r.comment}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-[12px] text-[#64748B] mb-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {r.user?.name?.slice(0, 2)}***{r.user?.name?.slice(-2)}
                      </span>
                      {r.listing && (
                        <Link href={`/lot/${r.listing.id}`} className="flex items-center gap-1 text-[#2563EB] hover:underline">
                          <Package className="w-3.5 h-3.5" />
                          {r.listing.title.slice(0, 30)}...
                        </Link>
                      )}
                    </div>
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
