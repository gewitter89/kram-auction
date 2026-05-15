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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[14px] text-[#64748B]">Завантаження...</div>
      </div>
    )
  }

  if (!session?.user) return null

  return <CabinetContent user={session.user} />
}
