'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Bell, Gavel, Trophy, MessageCircle, Truck, Clock } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/notifications')
      return
    }
    if (status === 'authenticated') {
      load()
    }
  }, [status, router])

  function load() {
    fetch('/api/notifications').then(r => r.json()).then(d => {
      setNotifications(d.notifications || [])
      setLoading(false)
    })
  }

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true })
    })
    load()
  }

  async function markRead(id: string) {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function getIcon(type: string) {
    if (type === 'outbid') return <Gavel className="w-4 h-4 text-[#EF4444]" />
    if (type === 'won') return <Trophy className="w-4 h-4 text-[#10B981]" />
    if (type === 'sold') return <Trophy className="w-4 h-4 text-[#10B981]" />
    if (type === 'message') return <MessageCircle className="w-4 h-4 text-[#2563EB]" />
    if (type === 'shipped') return <Truck className="w-4 h-4 text-[#2563EB]" />
    if (type === 'ending_soon') return <Clock className="w-4 h-4 text-[#F59E0B]" />
    return <Bell className="w-4 h-4 text-[#64748B]" />
  }

  if (status === 'loading' || loading) {
    return <div className="max-w-[800px] mx-auto px-4 py-8"><div className="text-[14px] text-[#64748B]">Завантаження...</div></div>
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="max-w-[800px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#0B1220]">Сповіщення</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-[13px] text-[#2563EB] hover:underline">
            Прочитати всі ({unreadCount})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-[#F8FAFC] rounded-2xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-[#94A3B8]" />
          </div>
          <p className="text-[16px] font-medium text-[#0F172A] mb-2">Немає сповіщень</p>
          <p className="text-[13px] text-[#64748B]">Тут зʼявляться сповіщення про ваші ставки, лоти та повідомлення</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                n.read ? 'bg-white border-[#E2E8F0]' : 'bg-[#EFF6FF] border-[#2563EB]/20 hover:border-[#2563EB]/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-[#E2E8F0]">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-[14px] font-semibold text-[#0F172A]">{n.title}</h3>
                    <span className="text-[11px] text-[#94A3B8] flex-shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-[13px] text-[#64748B]">{n.message}</p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-[#2563EB] rounded-full flex-shrink-0 mt-2" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
