'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRealtimeSubscription } from '@/lib/realtime-client'
import { Gavel, Trophy, Heart } from 'lucide-react'

export function LiveActivityFeed() {
  const [feed, setFeed] = useState<any[]>([])

  const iconMap = { bid: Gavel, won: Trophy, fav: Heart } as Record<string, any>
  const colorMap = { bid: 'text-[#2563EB]', won: 'text-[#10B981]', fav: 'text-[#EF4444]' } as Record<string, string>
  const bgMap = { bid: 'bg-[#EFF6FF]', won: 'bg-[#ECFDF5]', fav: 'bg-[#FEF2F2]' } as Record<string, string>
  const textMap = { bid: 'нова ставка', won: 'виграно лот', fav: 'додано в обране' } as Record<string, string>

  const mapRawEvent = useCallback((data: any) => {
    return {
      type: data.type,
      icon: iconMap[data.type] || Gavel,
      color: colorMap[data.type] || 'text-[#2563EB]',
      bg: bgMap[data.type] || 'bg-[#EFF6FF]',
      text: textMap[data.type] || 'активність',
      name: data.name,
      amount: data.amount || '',
      user: data.user || 'користувач'
    }
  }, [])

  const handleGlobalEvent = useCallback((data: any) => {
    if (data.type === 'bid' || data.type === 'won' || data.type === 'fav') {
      const newEvent = mapRawEvent(data)
      setFeed(prev => {
        // Deduplicate events by user & name if already exists in top 4
        const exists = prev.slice(0, 4).some(item => 
          item.user === newEvent.user && 
          item.name === newEvent.name && 
          item.amount === newEvent.amount
        )
        if (exists) return prev
        return [newEvent, ...prev].slice(0, 4)
      })
    }
  }, [mapRawEvent])

  useRealtimeSubscription('global', handleGlobalEvent)

  useEffect(() => {
    // 1. Fetch initial real data from database
    async function fetchInitialFeed() {
      try {
        const res = await fetch('/api/events/recent')
        if (res.ok) {
          const data = await res.json()
          if (data.events && data.events.length > 0) {
            const mapped = data.events.map((e: any) => mapRawEvent(e))
            setFeed(mapped)
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial feed:', err)
      }
    }

    fetchInitialFeed()

    // 2. Set up short-polling fallback
    const pollingInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/events/recent')
        if (res.ok) {
          const data = await res.json()
          if (data.events && data.events.length > 0) {
            const mapped = data.events.map((e: any) => mapRawEvent(e))
            setFeed(mapped)
          }
        }
      } catch (err) {}
    }, 5000)

    return () => {
      clearInterval(pollingInterval)
    }
  }, [mapRawEvent])

  return (
    <section className="max-w-[1320px] mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
        </span>
        <h2 className="text-[18px] font-bold text-[#0F172A]">Активність на платформі</h2>
        <span className="text-[12px] text-[#94A3B8]">в реальному часі</span>
      </div>

      {feed.length === 0 ? (
        <div className="bg-white border border-dashed border-[#CBD5E1] rounded-xl p-5 text-[13px] text-[#64748B]">
          Поки немає живої активності. Тут зʼявлятимуться реальні ставки, обрані лоти та завершені торги.
        </div>
      ) : (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {feed.slice(0, 4).map((event, i) => {
          const Icon = event.icon
          return (
            <div
              key={`${event.user}-${i}-${event.name}`}
              className="bg-white border border-[#E2E8F0] rounded-xl p-3 animate-slide-in-right hover:shadow-card-hover transition-shadow"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 ${event.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${event.color}`} />
                </div>
                <span className="text-[11px] text-[#64748B] truncate">{event.text}</span>
                <span className="text-[10px] text-[#94A3B8] ml-auto">щойно</span>
              </div>
              <p className="text-[13px] font-semibold text-[#0F172A] truncate">{event.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] text-[#94A3B8]">{event.user}</span>
                {event.amount && (
                  <span className={`text-[12px] font-bold ${event.type === 'won' ? 'text-[#10B981]' : 'text-[#2563EB]'}`}>
                    {event.amount}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      )}
    </section>
  )
}
