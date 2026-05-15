'use client'

import { useEffect, useState } from 'react'
import { Gavel, Trophy, Heart } from 'lucide-react'

const events = [
  { type: 'bid', icon: Gavel, color: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]', text: 'нова ставка', name: 'iPhone 14 Pro', amount: '+500₴', user: 'user***73' },
  { type: 'won', icon: Trophy, color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]', text: 'виграно лот', name: 'MacBook Air M2', amount: '32 000₴', user: 'tech***02' },
  { type: 'fav', icon: Heart, color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]', text: 'додано в обране', name: 'PlayStation 5', amount: '', user: 'buyer***45' },
  { type: 'bid', icon: Gavel, color: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]', text: 'нова ставка', name: 'Dyson V15', amount: '+250₴', user: 'pro***88' },
  { type: 'bid', icon: Gavel, color: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]', text: 'нова ставка', name: 'Samsung S24 Ultra', amount: '+1000₴', user: 'user***19' },
  { type: 'won', icon: Trophy, color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]', text: 'виграно лот', name: 'AirPods Pro 2', amount: '5 800₴', user: 'mac***fan' },
]

export function LiveActivityFeed() {
  const [feed, setFeed] = useState(events.slice(0, 4))

  useEffect(() => {
    const sse = new EventSource('/api/events?channel=global')

    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'bid' || data.type === 'won' || data.type === 'fav') {
          const iconMap: Record<string, any> = { bid: Gavel, won: Trophy, fav: Heart }
          const colorMap: Record<string, string> = { bid: 'text-[#2563EB]', won: 'text-[#10B981]', fav: 'text-[#EF4444]' }
          const bgMap: Record<string, string> = { bid: 'bg-[#EFF6FF]', won: 'bg-[#ECFDF5]', fav: 'bg-[#FEF2F2]' }
          const textMap: Record<string, string> = { bid: 'нова ставка', won: 'виграно лот', fav: 'додано в обране' }

          const newEvent = {
            type: data.type,
            icon: iconMap[data.type],
            color: colorMap[data.type],
            bg: bgMap[data.type],
            text: textMap[data.type],
            name: data.name,
            amount: data.amount || '',
            user: data.user
          }

          setFeed(prev => [newEvent, ...prev].slice(0, 4))
        }
      } catch (err) {}
    }

    return () => sse.close()
  }, [])

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {feed.map((event, i) => {
          const Icon = event.icon
          return (
            <div
              key={`${event.user}-${i}-${event.name}`}
              className="bg-white border border-[#E2E8F0] rounded-xl p-3 animate-slide-in-right hover:shadow-card-hover transition-shadow"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 ${event.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${event.color}`} />
                </div>
                <span className="text-[11px] text-[#64748B]">{event.text}</span>
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
    </section>
  )
}
