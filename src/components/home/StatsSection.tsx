'use client'

import { useEffect, useState } from 'react'

export function StatsSection() {
  const [stats, setStats] = useState({ activeLots: 0, totalUsers: 0, bidsToday: 0 })

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  return (
    <section className="bg-white border-b border-[#E2E8F0]">
      <div className="max-w-[1320px] mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-[28px] md:text-[32px] font-bold text-[#0B1220]">{stats.activeLots.toLocaleString('uk-UA')}</p>
            <p className="text-[12px] md:text-[13px] text-[#64748B] mt-1">активних лотів</p>
          </div>
          <div className="text-center border-x border-[#E2E8F0]">
            <p className="text-[28px] md:text-[32px] font-bold text-[#0B1220]">{stats.totalUsers.toLocaleString('uk-UA')}</p>
            <p className="text-[12px] md:text-[13px] text-[#64748B] mt-1">користувачів</p>
          </div>
          <div className="text-center">
            <p className="text-[28px] md:text-[32px] font-bold text-[#0B1220]">{stats.bidsToday.toLocaleString('uk-UA')}</p>
            <p className="text-[12px] md:text-[13px] text-[#64748B] mt-1">ставок сьогодні</p>
          </div>
        </div>
      </div>
    </section>
  )
}
