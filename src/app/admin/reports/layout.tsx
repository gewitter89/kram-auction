import { auth } from '@/lib/auth-config'
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default async function AdminReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
  
  return <>{children}</>
}
