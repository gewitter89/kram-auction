import { Suspense } from 'react'
import LoginContent from '@/components/auth/LoginContent'

export const metadata = {
  title: 'KRAM — вхід до кабінету',
  description: 'Вхід до особистого кабінету української beta-платформи торгів KRAM.',
}

function LoginSSRShell() {
  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Left Brand Panel Skeleton */}
      <div className="hidden lg:flex lg:w-[480px] bg-[#0B1220] flex-col justify-center px-16 border-r border-white/5 animate-pulse">
        <div className="w-32 h-8 bg-white/10 rounded-lg mb-10" />
        <div className="h-7 bg-white/20 rounded-md w-3/4 mb-4" />
        <div className="h-4 bg-white/10 rounded w-5/6 mb-3" />
        <div className="h-4 bg-white/10 rounded w-2/3 mb-12" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/5 rounded-lg shrink-0" />
              <div className="h-3.5 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Skeleton */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F8FAFC]">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="space-y-3">
            {/* Logo skeleton for mobile */}
            <div className="lg:hidden w-32 h-8 bg-slate-200 rounded-lg mb-8 animate-pulse" />
            <div className="h-7 bg-slate-200 rounded-md w-1/2 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse" />
          </div>

          {/* Social Logins Skeleton */}
          <div className="space-y-2.5 animate-pulse">
            <div className="h-11 w-full bg-slate-200 rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-11 bg-slate-200 rounded-xl" />
              <div className="h-11 bg-slate-200 rounded-xl" />
            </div>
          </div>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E2E8F0]"></div></div>
            <div className="relative flex justify-center"><span className="bg-[#F8FAFC] px-3 text-[12px] text-slate-300">або</span></div>
          </div>

          {/* Email Form Skeleton */}
          <div className="space-y-4 animate-pulse">
            <div>
              <div className="h-3.5 bg-slate-200 rounded w-1/4 mb-1.5" />
              <div className="h-11 bg-white border border-slate-200 rounded-xl" />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <div className="h-3.5 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
              </div>
              <div className="h-11 bg-white border border-slate-200 rounded-xl" />
            </div>
            <div className="h-11 bg-slate-200 rounded-xl" />
          </div>
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
