'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart, Clock, MapPin, Star, Truck, ShieldCheck, Gavel } from 'lucide-react'
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
  const isUrgent = !isEnded && remainingMs !== null && remainingMs < 2 * 3600000

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
      className="group bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-card hover:border-[#2563EB]/25 hover:shadow-premium transition-all duration-300 flex flex-col h-full relative"
    >
      {/* Photo Area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0 border-b border-slate-100">
        {lot.image ? (
          <img
            src={lot.image}
            alt={lot.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#EFF6FF] to-white p-6">
            <span className="text-[12px] font-black text-[#2563EB] tracking-widest uppercase">KRAM</span>
            <span className="text-[11px] text-[#475569] mt-0.5">Демо-лот</span>
          </div>
        )}

        {/* Gradient shadow on image */}
        <div className="absolute inset-x-0 bottom-0 h-16 gradient-card-bottom opacity-40 pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
          <span className={`inline-flex items-center h-5 px-2 rounded-md text-[9.5px] font-bold uppercase tracking-wide backdrop-blur-sm ${
            lot.type === 'auction' ? 'bg-[#0B1220]/90 text-white' : 'bg-[#10B981]/90 text-white'
          }`}>
            {lot.type === 'auction' ? 'Аукціон' : 'Купити'}
          </span>
          
          {conditionLabel && (
            <span className="inline-flex items-center h-5 px-2 rounded-md text-[9.5px] font-semibold bg-white/95 text-[#475569] shadow-sm w-fit">
              {conditionLabel}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          disabled={favLoading}
          className="absolute top-3 right-3 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm transition-transform hover:scale-105"
          aria-label="Додати в обране"
        >
          <Heart className={`w-3.5 h-3.5 transition-all ${isFavorite ? 'fill-[#EF4444] text-[#EF4444]' : 'text-[#475569]'}`} />
        </button>

        {/* Delivery indicator */}
        {lot.delivery && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 h-5 px-2 bg-white/95 backdrop-blur-sm rounded-md shadow-sm">
            <Truck className="w-3 h-3 text-[#10B981]" />
            <span className="text-[9.5px] font-bold text-[#10B981] uppercase tracking-wide">Нова Пошта</span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4.5 flex flex-col flex-grow">
        <h3 className="text-[13.5px] font-bold text-[#0B1220] leading-snug line-clamp-2 mb-3.5 group-hover:text-[#2563EB] transition-colors min-h-[38px]">
          {lot.title}
        </h3>

        {/* Price & Bids Row */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-end justify-between mb-3.5">
          <div>
            <span className="text-[9.5px] text-[#94A3B8] uppercase tracking-wide block mb-0.5">Поточна ставка</span>
            <span className="text-[18px] font-extrabold text-[#0B1220] tracking-tight">{formatPrice(lot.currentPrice)}</span>
          </div>

          <div>
            {!isEnded ? (
              <div className={`flex items-center gap-1 h-6 px-2 rounded-md font-mono text-[11px] font-bold ${
                isUrgent ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-[#FAFBFD] border border-slate-100 text-[#475569]'
              }`}>
                <Clock className="w-3 h-3" />
                <span>{timeLeft}</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Завершено</span>
            )}
          </div>
        </div>

        {/* Footer Details */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[11.5px] text-[#475569]">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {lot.city}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Gavel className="w-3.5 h-3.5 text-slate-400" />
              {lot.bids}
            </span>
          </div>

          <div className="flex items-center gap-1" title={lot.verified ? "Верифікований користувач" : undefined}>
            {lot.verified && (
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
            )}
            <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-bold">{lot.sellerRating.toFixed(1)}</span>
          </div>
        </div>

      </div>
    </Link>
  )
}
