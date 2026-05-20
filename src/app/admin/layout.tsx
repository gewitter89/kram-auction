import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { auth } from '@/lib/auth-config'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    return (
      <AdminAccessState
        tone="danger"
        title="Увійдіть, щоб відкрити адмінку"
        text="Цей розділ доступний лише адміністраторам KRAM."
        href="/auth/login?callbackUrl=/admin"
        label="Увійти"
      />
    )
  }

  if (session.user.role !== 'admin' && session.user.email !== 'admin@kram.ua') {
    return (
      <AdminAccessState
        tone="warning"
        title="Доступ лише для адміністратора"
        text="У вас недостатньо прав для перегляду цієї сторінки."
        href="/"
        label="На головну"
      />
    )
  }

  return <>{children}</>
}

function AdminAccessState({
  tone,
  title,
  text,
  href,
  label,
}: {
  tone: 'danger' | 'warning'
  title: string
  text: string
  href: string
  label: string
}) {
  return (
    <div className="max-w-[1320px] mx-auto px-4 py-20 text-center">
      <ShieldAlert className={`w-12 h-12 mx-auto mb-4 ${tone === 'danger' ? 'text-[#EF4444]' : 'text-[#D97706]'}`} />
      <h1 className="text-[22px] font-bold text-[#0B1220] mb-2">{title}</h1>
      <p className="text-[14px] text-[#64748B] mb-6">{text}</p>
      <Link href={href} className="inline-flex h-12 px-8 bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] transition-colors">
        {label}
      </Link>
    </div>
  )
}
