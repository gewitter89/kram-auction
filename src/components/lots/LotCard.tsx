'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart, Clock, MapPin, Star, Truck, ShieldCheck, TrendingUp } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface LotCardProps {
  lot: {
    id: string
    title: string
    currentPrice: number
    bids: number
    endsAt: string
    city: string
    seller: string
    sellerRating: number
    image: string
    condition: string
    type: string
    delivery: boolean
    verified?: boolean
    featured?: boolean
  }
  initialFavorite?: boolean
}

export function LotCard({ lot, initialFavorite = false }: LotCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState('')
  const [remainingMs, setRemainingMs] = useState<number | null>(null)
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [favLoading, setFavLoading] = useState(false)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const update = () => {
      const end = new Date(lot.endsAt).getTime()
      const diff = end - Date.now()
      setRemainingMs(Math.max(0, diff))
      if (diff <= 0) { setTimeLeft('Завершено'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      if (h > 24) {
        const d = Math.floor(h / 24)
        setTimeLeft(`${d}д ${h % 24}г`)
      } else {
        setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
      }
    }
    update()
    const i = setInterval(update, 1000)
    return () => clearInterval(i)
  }, [lot.endsAt])

  const isEnded = timeLeft === 'Завершено'
  const isEndingSoon = !isEnded && remainingMs !== null && remainingMs < 2 * 3600000
  const isUrgent = !isEnded && remainingMs !== null && remainingMs < 30 * 60000

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      router.push(`/auth/login?callbackUrl=/lot/${lot.id}`)
      return
    }
    if (favLoading) return
    setFavLoading(true)
    const wasFav = isFavorite
    setIsFavorite(!wasFav)
    try {
      await fetch('/api/favorites', {
        method: wasFav ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: lot.id })
      })
    } catch {
      setIsFavorite(wasFav)
    } finally {
      setFavLoading(false)
    }
  }

  const conditionLabel = {
    new: 'Новий',
    like_new: 'Як новий',
    used: 'Б/В',
    for_parts: 'На запч.',
  }[lot.condition] || ''

  return (
    <Link
      href={`/lot/${lot.id}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="group block bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-card hover:shadow-[0_12px_40px_rgba(37,99,235,0.12),_0_4px_12px_rgba(15,23,42,0.04)] hover:-translate-y-1.5 hover:border-[#2563EB]/40 transition-all duration-300 ease-out"
    >
      {/* Featured Border Gradient */}
      {lot.featured && (
        <div className="absolute inset-0 border-[3px] border-[#F59E0B]/50 rounded-2xl pointer-events-none z-10" />
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
        {lot.image ? (
          <img
            src={lot.image}
            alt={lot.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EFF6FF] via-white to-[#ECFDF5]">
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-center shadow-card backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563EB]">KRAM</p>
              <p className="text-[13px] font-semibold text-[#0B1220]">Лот без фото</p>
            </div>
          </div>
        )}

        {/* Gradient overlay on bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 gradient-card-bottom opacity-60" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          {lot.featured && (
            <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white shadow-md w-fit animate-pulse">
              🔥 VIP
            </span>
          )}
          <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-md shadow-sm ${
            lot.type === 'auction' ? 'bg-[#0B1220]/85 text-white' :
            lot.type === 'buy_now' ? 'bg-[#10B981] text-white' :
            'bg-[#2563EB] text-white'
          }`}>
            {lot.type === 'auction' ? 'Аукціон' : lot.type === 'buy_now' ? 'Купити' : 'Аукціон+'}
          </span>
          {conditionLabel && (
            <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold bg-white/95 backdrop-blur-md text-[#64748B] shadow-sm w-fit">
              {conditionLabel}
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={toggleFavorite}
          disabled={favLoading}
          className={`absolute top-3 right-3 w-9 h-9 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-card transition-all hover:scale-110 ${isFavorite ? 'shadow-glow-green' : ''}`}
          aria-label="Додати в обране"
        >
          <Heart className={`w-4 h-4 transition-all ${isFavorite ? 'fill-[#EF4444] text-[#EF4444]' : 'text-[#64748B]'}`} />
        </button>

        {/* Bottom badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          {lot.delivery && (
            <div className="inline-flex items-center gap-1 h-6 px-2 bg-white/95 backdrop-blur-md rounded-md shadow-sm">
              <Truck className="w-3 h-3 text-[#10B981]" />
              <span className="text-[10px] font-semibold text-[#10B981]">Нова Пошта</span>
            </div>
          )}
          {/* Live activity pulse on hover */}
          {hovering && lot.bids > 0 && !isEnded && (
            <div className="inline-flex items-center gap-1 h-6 px-2 bg-[#EF4444]/95 text-white rounded-md shadow-sm animate-fade-in">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
              <span className="text-[10px] font-bold">{lot.bids}</span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-[14px] font-semibold text-[#0F172A] leading-snug line-clamp-2 mb-3 group-hover:text-[#2563EB] transition-colors min-h-[40px]">
          {lot.title}
        </h3>

        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-0.5">
              Поточна ставка
            </p>
            <p className="text-[20px] font-bold text-[#0F172A] tracking-tight">{formatPrice(lot.currentPrice)}</p>
          </div>
          {!isEnded ? (
            <div className={`flex items-center gap-1 h-7 px-2.5 rounded-lg font-mono ${
              isUrgent ? 'bg-[#FEF2F2] text-[#EF4444] animate-urgent' :
              isEndingSoon ? 'bg-[#FEF2F2] text-[#EF4444]' :
              'bg-[#F8FAFC] text-[#64748B]'
            }`}>
              <Clock className="w-3 h-3" />
              <span className="text-[12px] font-bold">{timeLeft}</span>
            </div>
          ) : (
            <span className="text-[12px] text-[#94A3B8] font-medium">Завершено</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
          <div className="flex items-center gap-3 text-[12px] text-[#64748B]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />{lot.city}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />{lot.bids}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[12px]">
            {lot.verified && (
              <ShieldCheck className="w-3 h-3 text-[#2563EB]" />
            )}
            <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="text-[#64748B] font-medium">{lot.sellerRating}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
