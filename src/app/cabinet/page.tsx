'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { CabinetContent } from '@/components/cabinet/CabinetContent'

export default function CabinetPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/cabinet')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="max-w-[1320px] mx-auto px-4 py-8 animate-pulse">
        {/* Profile Header Skeleton */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center gap-5">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-slate-200 rounded w-1/4" />
            <div className="h-3.5 bg-slate-100 rounded w-1/3" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Skeleton */}
          <div className="md:w-[240px] shrink-0 bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 py-1">
                <div className="w-4 h-4 bg-slate-100 rounded" />
                <div className="h-3.5 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <div className="h-5 bg-slate-200 rounded w-1/4 mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 items-center p-3 border border-[#E2E8F0] rounded-xl">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user) return null

  return <CabinetContent user={session.user} />
}
