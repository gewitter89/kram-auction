'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Search, Bell, Heart, MessageCircle, User, PlusCircle, LogIn, Loader2 } from 'lucide-react'
import { KramLogo } from '@/components/brand/KramLogo'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  // Autocomplete states
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  // Autocomplete search suggestions fetch
  useEffect(() => {
    if (search.trim().length < 2) {
      setSuggestions([])
      return
    }
    const delayDebounce = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/lots/search?q=${encodeURIComponent(search)}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.lots || [])
        }
      } catch (err) {
        console.error('Autocomplete fetch error:', err)
      } finally {
        setSearching(false)
      }
    }, 250) // 250ms debounce

    return () => clearTimeout(delayDebounce)
  }, [search])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      setIsOpen(false)
      router.push(`/catalog?search=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <header className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md transition-all ${scrolled ? 'border-b border-[#E2E8F0]/80 shadow-card' : 'border-b border-[#E2E8F0]/40'}`}>
      <div className="max-w-[1320px] mx-auto px-4 h-[64px] flex items-center gap-5">
        <Link href="/" className="flex-shrink-0">
          <KramLogo variant="full" size={34} />
        </Link>

        <div ref={dropdownRef} className="flex-1 max-w-[520px] hidden md:block relative">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={search}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setIsOpen(true)
                }}
                placeholder="Пошук товарів, брендів..."
                className="peer w-full pl-10 pr-4 h-10 bg-[#F1F5F9]/60 border border-[#E2E8F0] rounded-xl text-[13.5px] text-[#0B1220] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/8 focus:bg-white transition-all duration-200"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#94A3B8] peer-focus:text-[#2563EB] transition-colors pointer-events-none" />
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {isOpen && search.trim().length >= 2 && (
            <div className="absolute top-12 left-0 right-0 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {searching ? (
                <div className="p-5 text-center text-[13px] text-[#64748B] flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                  <span>Шукаємо лоти...</span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-5 text-center text-[13px] text-[#64748B]">
                  Нічого не знайдено за запитом <span className="font-semibold">"{search}"</span>
                </div>
              ) : (
                <div className="p-2 space-y-0.5">
                  <div className="px-3 py-2 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Знайдені лоти</div>
                  {suggestions.map((lot: any) => (
                    <button
                      key={lot.id}
                      type="button"
                      onClick={() => {
                        router.push(`/lot/${lot.id}`)
                        setSearch('')
                        setIsOpen(false)
                      }}
                      className="w-full text-left p-2 hover:bg-[#F1F5F9] rounded-xl flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-[#F1F5F9] rounded-lg overflow-hidden flex-shrink-0 border border-slate-100 relative">
                        {lot.image ? (
                          <img src={lot.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-[14px]">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors">
                          {lot.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[12px] font-bold text-[#2563EB]">{formatPrice(lot.currentPrice)}</span>
                          <span className="text-[10px] text-[#94A3B8]">• {lot.bidsCount} ставок</span>
                        </div>
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-[#F1F5F9] mt-2 pt-2 px-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        handleSearch(e)
                      }}
                      className="w-full text-center py-2 text-[12px] font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-all duration-300 shadow-md shadow-[#2563EB]/15 hover:shadow-lg hover:shadow-[#2563EB]/25"
                    >
                      Показати всі результати для "{search}"
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <Link href="/sellers" className="hidden lg:flex items-center h-10 px-3 text-[13px] font-semibold text-[#475569] hover:text-[#2563EB] transition-colors">
          Продавцям
        </Link>

        <Link
          href={session ? '/sell' : '/auth/login?callbackUrl=/sell'}
          className="group hidden md:flex items-center gap-1.5 h-10 px-5 bg-[#2563EB] text-white rounded-xl text-[14px] font-semibold hover:bg-[#1D4ED8] transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#2563EB]/30"
        >
          <PlusCircle className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180" />
          <span>Створити лот</span>
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

            <Link href="/cabinet" className="ml-1 w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] hover:scale-105 transition-transform overflow-hidden relative" title="Кабінет">
              {session.user?.image && session.user.image.trim() !== '' ? (
                <img 
                  src={session.user.image} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const initialSpan = document.createElement('span');
                      initialSpan.className = 'text-[13px] font-bold text-[#2563EB]';
                      initialSpan.innerText = (session.user?.name || session.user?.email || 'U').charAt(0).toUpperCase();
                      parent.appendChild(initialSpan);
                    }
                  }}
                />
              ) : (
                <span className="text-[13px] font-bold text-[#2563EB]">
                  {(session.user?.name || session.user?.email || 'U').charAt(0).toUpperCase()}
                </span>
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
