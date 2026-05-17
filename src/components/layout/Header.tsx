'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Search, Bell, Heart, MessageCircle, User, PlusCircle, LogIn } from 'lucide-react'
import { KramLogo } from '@/components/brand/KramLogo'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Poll unread counts every 30s when logged in
  useEffect(() => {
    if (!session?.user?.id) return
    const load = () => {
      fetch('/api/notifications?unreadCount=1').then(r => r.json()).then(d => {
        setUnreadNotifs(d.unread ?? 0)
      }).catch(() => {})
      fetch('/api/messages?unreadCount=1').then(r => r.json()).then(d => {
        setUnreadMessages(d.unread ?? 0)
      }).catch(() => {})
    }
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [session?.user?.id])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <header className={`sticky top-0 z-50 bg-white/85 backdrop-blur-lg transition-all ${scrolled ? 'border-b border-[#E2E8F0] shadow-card' : 'border-b border-transparent'}`}>
      <div className="max-w-[1320px] mx-auto px-4 h-[64px] flex items-center gap-5">
        <Link href="/" className="flex-shrink-0">
          <KramLogo variant="full" size={34} />
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-[560px] hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук лотів, брендів, категорій..."
              className="peer w-full pl-10 pr-4 h-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 focus:bg-white transition-all duration-300"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#94A3B8] peer-focus:text-[#2563EB] peer-focus:scale-110 peer-focus:rotate-12 transition-all duration-300 pointer-events-none" />
            {search && (
              <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-6 px-1.5 items-center bg-white border border-[#E2E8F0] rounded text-[10px] font-mono text-[#94A3B8]">↵</kbd>
            )}
          </div>
        </form>

        <Link
          href={session ? '/sell' : '/auth/login?callbackUrl=/sell'}
          className="group hidden md:flex items-center gap-1.5 h-10 px-5 bg-[#2563EB] text-white rounded-xl text-[14px] font-semibold hover:bg-[#1D4ED8] transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#2563EB]/30"
        >
          <PlusCircle className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180" />
          <span>Продати</span>
        </Link>

        {session ? (
          <nav className="hidden md:flex items-center gap-0.5">
            <Link href="/favorites" className="group w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F8FAFC] transition-colors" title="Обране">
              <Heart className="w-[20px] h-[20px] text-[#64748B] transition-all duration-300 group-hover:scale-115 group-hover:text-[#EF4444] group-hover:fill-[#EF4444]/15" />
            </Link>

            <Link href="/messages" className="group relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F8FAFC] transition-colors" title="Повідомлення">
              <MessageCircle className="w-[20px] h-[20px] text-[#64748B] transition-all duration-300 group-hover:animate-[messageBounce_0.5s_ease-in-out] group-hover:text-[#2563EB]" />
              {unreadMessages > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-[#2563EB] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </Link>

            <Link href="/notifications" className="group relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F8FAFC] transition-colors" title="Сповіщення">
              <Bell className="w-[20px] h-[20px] text-[#64748B] origin-top transition-all duration-300 group-hover:animate-[bellWiggle_0.6s_ease-in-out] group-hover:text-[#EF4444]" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadNotifs > 9 ? '9+' : unreadNotifs}
                </span>
              )}
            </Link>

            <Link href="/cabinet" className="ml-1 w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] hover:scale-105 transition-transform overflow-hidden" title="Кабінет">
              {session.user?.image ? (
                <img src={session.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-[#2563EB]" />
              )}
            </Link>
          </nav>
        ) : (
          <Link
            href="/auth/login"
            className="group hidden md:flex items-center gap-1.5 h-10 px-4 border border-[#E2E8F0] rounded-xl text-[14px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-colors"
          >
            <LogIn className="w-4 h-4 text-[#64748B] transition-transform duration-300 group-hover:translate-x-1" />
            <span>Увійти</span>
          </Link>
        )}
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук..."
              className="w-full pl-9 pr-4 h-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition-all"
            />
          </div>
        </form>
      </div>
    </header>
  )
}
