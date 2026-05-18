import { Suspense } from 'react'
import LoginContent from '@/components/auth/LoginContent'

function LoginSSRShell() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-[#E2E8F0] p-8 rounded-3xl shadow-sm">
        
        {/* Title */}
        <div className="text-center">
          <div className="w-12 h-12 bg-[#2563EB]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black text-[#2563EB]">
            K
          </div>
          <h1 className="text-[24px] font-extrabold text-[#0B1220] tracking-tight">
            Вхід до кабінету KRAM
          </h1>
          <p className="mt-2 text-[13px] text-[#475569]">
            Керуйте вашими ставками, листуванням та лотами в реальному часі.
          </p>
        </div>

        {/* Input skeletons */}
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Email</span>
            <div className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Пароль</span>
            <div className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
        </div>

        {/* Login Button Skeleton */}
        <div className="h-11 bg-slate-100 rounded-xl flex items-center justify-center text-[13px] font-bold text-slate-400">
          Завантаження форми...
        </div>

        {/* Honest Beta Alert */}
        <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl">
          <p className="text-[11.5px] text-[#1E40AF] leading-relaxed text-center font-medium">
            📢 <strong>Beta-режим:</strong> KRAM працює як безкоштовна classified-платформа. Ми не приймаємо платежі та не зберігаємо дані платіжних карт. Усі угоди вирішуються учасниками безпосередньо.
          </p>
        </div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSSRShell />}>
      <LoginContent />
    </Suspense>
  )
}
