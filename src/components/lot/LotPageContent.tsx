'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Clock, MapPin, Star, Truck, ShieldCheck, Eye, User, MessageCircle, Heart, Share2, Flag, TrendingUp, Lock, BadgeCheck, ChevronRight, CheckCircle2, Gavel, X } from 'lucide-react'
import { formatPrice, timeAgo } from '@/lib/utils'
import { BidModal } from '@/components/lot/BidModal'
import Link from 'next/link'

interface LotPageContentProps {
  lot: any
  similar: any[]
}

export function LotPageContent({ lot }: LotPageContentProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showBidModal, setShowBidModal] = useState(false)
  const [currentPrice, setCurrentPrice] = useState(lot.currentPrice)
  const [bidCount, setBidCount] = useState(lot.bids.length)
  const [bidsHistory, setBidsHistory] = useState(lot.bids)
  const [endsAt, setEndsAt] = useState(lot.endsAt)
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [toast, setToast] = useState(searchParams.get('published') === '1' ? '🎉 Лот успішно опубліковано!' : '')
  const [zoomActive, setZoomActive] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [isFavorite, setIsFavorite] = useState(lot.isFavorite || false)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [buying, setBuying] = useState(false)
  const [outbidAlert, setOutbidAlert] = useState<{ amount: number; lotTitle: string } | null>(null)

  const images: string[] = (() => { try { return JSON.parse(lot.images || '[]') } catch { return [] } })()
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); return }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const i = setInterval(update, 1000)
    return () => clearInterval(i)
  }, [endsAt])

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null
    let sse: EventSource | null = null

    function startPollingFallback() {
      if (pollingInterval) return
      pollingInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/listings/${lot.id}/price`)
          if (res.ok) {
            const data = await res.json()
            setCurrentPrice(data.currentPrice)
            setBidCount(data.bidCount)
            if (data.endsAt) setEndsAt(data.endsAt)
            if (data.bids) {
              setBidsHistory(data.bids)
            }
          }
        } catch (err) {}
      }, 4000)
    }

    try {
      sse = new EventSource(`/api/events?channel=lot_${lot.id}`)
      sse.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.type === 'new_bid') {
            setCurrentPrice(data.amount)
            setBidCount((prev: number) => prev + 1)
            if (data.endsAt) setEndsAt(data.endsAt)
            if (data.bid) {
              setBidsHistory((prev: any) => {
                const exists = prev.some((b: any) => b.id === data.bid.id)
                if (exists) return prev
                return [data.bid, ...prev]
              })
            }
            // Trigger visual live outbid alert if bid is from another user!
            if (session?.user && data.userId !== session.user.id) {
              setOutbidAlert({ amount: data.amount, lotTitle: lot.title })
              try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'sine'
                osc.frequency.setValueAtTime(550, ctx.currentTime)
                gain.gain.setValueAtTime(0.06, ctx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start()
                osc.stop(ctx.currentTime + 0.25)
              } catch (e) {}
            }
          }
        } catch (err) {}
      }

      sse.onerror = () => {
        if (sse) {
          sse.close()
          sse = null
        }
        startPollingFallback()
      }
    } catch (e) {
      startPollingFallback()
    }

    return () => {
      if (sse) sse.close()
      if (pollingInterval) clearInterval(pollingInterval)
    }
  }, [lot.id, session])

  const isEnded = new Date(endsAt).getTime() <= Date.now()
  const isUrgent = !isEnded && new Date(endsAt).getTime() - Date.now() < 30 * 60000
  const isOwner = session?.user?.id === lot.sellerId

  function handleBid() {
    if (!session) { router.push(`/auth/login?callbackUrl=/lot/${lot.id}&action=bid`); return }
    setShowBidModal(true)
  }

  async function handleBuyNow() {
    if (!session) { router.push(`/auth/login?callbackUrl=/lot/${lot.id}&action=buy`); return }
    setShowBuyModal(true)
  }

  function onBidSuccess(newPrice: number) {
    setCurrentPrice(newPrice)
    setBidCount((prev: number) => prev + 1)
    setShowBidModal(false)
    setToast('Ставку прийнято!')
    setTimeout(() => setToast(''), 3000)
  }

  async function toggleFavorite() {
    if (!session) { router.push(`/auth/login?callbackUrl=/lot/${lot.id}`); return }
    const wasFav = isFavorite
    setIsFavorite(!wasFav)
    await fetch('/api/favorites', {
      method: wasFav ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: lot.id })
    })
  }

  function handleZoom(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  // Generate SVG path coordinates for bidding trend visualization
  const getTrendChartPath = () => {
    if (bidsHistory.length < 2) return null
    // Chronological: oldest first
    const sortedBids = [...bidsHistory].reverse()
    const minVal = lot.startingPrice || sortedBids[0].amount * 0.9
    const maxVal = currentPrice
    const valRange = maxVal - minVal || 1

    const width = 500
    const height = 120
    const padding = 15

    const points = sortedBids.map((bid: any, i: number) => {
      const x = padding + (i / (sortedBids.length - 1)) * (width - padding * 2)
      const y = height - padding - ((bid.amount - minVal) / valRange) * (height - padding * 2)
      return { x, y, amount: bid.amount }
    })

    const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

    return { pathD, areaD, points }
  }
  const trend = getTrendChartPath()

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-6">
      {toast && (
        <div className="fixed top-20 right-4 z-50 px-4 py-3 bg-[#0B1220] text-white text-[14px] font-medium rounded-xl shadow-premium animate-fade-in">
          {toast}
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[12px] text-[#64748B] mb-5">
        <Link href="/" className="hover:text-[#2563EB]">Головна</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/catalog" className="hover:text-[#2563EB]">Каталог</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/catalog?category=${lot.category?.slug || ''}`} className="hover:text-[#2563EB]">{lot.category?.name}</Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-8">
        {/* LEFT: Gallery + Tabs */}
        <div>
          {/* Gallery */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden mb-6">
            <div
              className="relative aspect-[4/3] bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] cursor-zoom-in overflow-hidden"
              onMouseEnter={() => setZoomActive(true)}
              onMouseLeave={() => setZoomActive(false)}
              onMouseMove={handleZoom}
            >
              {images.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={lot.title}
                  className="w-full h-full object-contain transition-transform duration-300"
                  style={zoomActive ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: 'scale(2)',
                  } : {}}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#94A3B8]">
                  <p className="text-[14px]">Фото відсутнє</p>
                </div>
              )}
              {zoomActive && images.length > 0 && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 text-white text-[11px] rounded-md backdrop-blur-sm">
                  Збільшено 2x
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      i === activeImage ? 'border-[#2563EB] shadow-glow-blue' : 'border-transparent hover:border-[#CBD5E1]'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-6">
            <h2 className="text-[18px] font-bold text-[#0F172A] mb-4 tracking-tight">Опис лота</h2>
            <p className="text-[14px] text-[#475569] leading-relaxed whitespace-pre-wrap">
              {lot.description || 'Опис відсутній'}
            </p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-[#F1F5F9]">
              <div>
                <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider mb-1">Стан</p>
                <p className="text-[14px] font-semibold text-[#0F172A]">
                  {lot.condition === 'new' ? 'Новий' : lot.condition === 'like_new' ? 'Як новий' : 'Вживаний'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider mb-1">Категорія</p>
                <p className="text-[14px] font-semibold text-[#0F172A]">{lot.category?.name}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider mb-1">Розташування</p>
                <p className="text-[14px] font-semibold text-[#0F172A]">{lot.city || 'Україна'}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider mb-1">Доставка</p>
                <p className="text-[14px] font-semibold text-[#0F172A]">Нова Пошта</p>
              </div>
            </div>
          </div>

          {/* Bid History */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-[#0F172A] tracking-tight">Історія ставок</h2>
              <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#2563EB] text-[12px] font-bold rounded-full">{bidCount}</span>
            </div>

            {trend && (
              <div className="mb-6 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-3">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2563EB]"></span>
                    </span>
                    Графік росту ціни
                  </span>
                  <span>Початкова: {formatPrice(lot.startingPrice || trend.points[0].amount)}</span>
                </div>
                <div className="relative w-full h-[120px]">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="15" x2="500" y2="15" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="105" x2="500" y2="105" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                    <path d={trend.areaD} fill="url(#chartGrad)" />
                    <path d={trend.pathD} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {trend.points.map((p, idx) => (
                      <g key={idx} className="group/node cursor-pointer">
                        <circle cx={p.x} cy={p.y} r="4.5" className="fill-white stroke-[#2563EB] stroke-2 hover:r-6 hover:fill-[#2563EB] transition-all" />
                        <title>{formatPrice(p.amount)}</title>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            )}

            {bidsHistory.length > 0 ? (
              <div className="space-y-1">
                {bidsHistory.slice(0, 8).map((bid: any, i: number) => (
                  <div key={bid.id} className={`flex items-center justify-between p-3 rounded-lg ${i === 0 ? 'bg-[#ECFDF5] border border-[#10B981]/20' : 'hover:bg-[#F8FAFC]'} transition-colors`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 0 ? 'bg-[#10B981]' : 'bg-[#F1F5F9]'}`}>
                        {i === 0 ? <TrendingUp className="w-4 h-4 text-white" /> : <User className="w-3.5 h-3.5 text-[#64748B]" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#0F172A]">{bid.user.name.slice(0, 4)}***</p>
                        <p className="text-[11px] text-[#94A3B8]">{timeAgo(bid.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-bold text-[#0F172A]">{formatPrice(bid.amount)}</p>
                      {i === 0 && <p className="text-[10px] font-bold text-[#10B981] uppercase">Лідер</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[14px] text-[#94A3B8] py-8 text-center">Поки немає ставок. Будьте першим!</p>
            )}
          </div>

          {/* Trust */}
          <div className="bg-gradient-to-br from-[#EFF6FF] to-[#F0F9FF] border border-[#2563EB]/10 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#0B1220] mb-1">Безпечна угода KRAM</h3>
                <p className="text-[13px] text-[#475569] leading-relaxed mb-3">
                  KRAM показує статус оплати, доставки й підтвердження отримання. У beta-режимі підтвердження може бути ручним до production-підключення LiqPay.
                </p>
                <div className="flex items-center gap-4 text-[12px] text-[#64748B]">
                  <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-[#10B981]" />Контроль статусів</div>
                  <div className="flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5 text-[#2563EB]" />Спір до завершення</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Sticky Buy Panel */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sticky top-[80px] shadow-card">
            {/* Type badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-[#0B1220] text-white">
                {lot.type === 'auction' ? 'Аукціон' : lot.type === 'buy_now' ? 'Купити зараз' : 'Аукціон + Купити'}
              </span>
              <span className="text-[12px] text-[#64748B]">№ {lot.id.slice(-8).toUpperCase()}</span>
            </div>

            <h1 className="text-[20px] font-bold text-[#0B1220] leading-tight tracking-tight mb-5">{lot.title}</h1>

            {/* Price block */}
            <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-4 mb-4">
              <p className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold mb-1">Поточна ставка</p>
              <p className="text-[32px] font-bold text-[#0B1220] tracking-tight">{formatPrice(currentPrice)}</p>
              <div className="flex items-center gap-4 mt-2 text-[12px] text-[#64748B]">
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{bidCount} ставок</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{lot.views} переглядів</span>
              </div>
            </div>

            {/* Timer */}
            <div className={`mb-4 ${isUrgent ? 'animate-urgent' : ''} bg-[#FEF2F2] border border-[#EF4444]/20 rounded-xl p-3`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[#EF4444]" />
                <span className="text-[11px] font-bold text-[#EF4444] uppercase tracking-wider">
                  {isEnded ? 'Завершено' : isUrgent ? 'Завершується!' : 'До завершення'}
                </span>
              </div>
              {!isEnded && (
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { v: timeLeft.d, l: 'дн' },
                    { v: timeLeft.h, l: 'год' },
                    { v: timeLeft.m, l: 'хв' },
                    { v: timeLeft.s, l: 'сек' },
                  ].map((t, i) => (
                    <div key={i} className="bg-white rounded-lg p-2 text-center">
                      <p className="text-[18px] font-bold text-[#0B1220] font-mono">{String(t.v).padStart(2, '0')}</p>
                      <p className="text-[9px] text-[#94A3B8] uppercase">{t.l}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            {!isEnded && !isOwner && (
              <div className="space-y-2 mb-4">
                <button
                  onClick={handleBid}
                  className="w-full h-12 bg-[#2563EB] text-white rounded-xl text-[15px] font-bold hover:bg-[#1D4ED8] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#2563EB]/30"
                >
                  Зробити ставку
                </button>
                {lot.buyNowPrice && (
                  <button
                    onClick={handleBuyNow}
                    className="w-full h-12 bg-[#10B981] text-white rounded-xl text-[15px] font-bold hover:bg-[#059669] transition-all hover:-translate-y-0.5"
                  >
                    Купити за {formatPrice(lot.buyNowPrice)}
                  </button>
                )}
              </div>
            )}

            {isOwner && (
              <div className="p-3 bg-[#EFF6FF] border border-[#2563EB]/20 rounded-xl text-[13px] text-[#2563EB] text-center mb-4">
                Це ваш лот
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button onClick={toggleFavorite} className={`h-9 rounded-lg text-[12px] font-medium border transition-colors flex items-center justify-center gap-1 ${
                isFavorite ? 'bg-[#FEF2F2] border-[#EF4444]/30 text-[#EF4444]' : 'border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
              }`}>
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                <span>Обране</span>
              </button>
              {!isOwner && session && (
                <button onClick={() => router.push(`/messages?with=${lot.sellerId}`)}
                  className="h-9 rounded-lg text-[12px] font-medium border border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1] transition-colors flex items-center justify-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Написати</span>
                </button>
              )}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  setToast('🔗 Посилання скопійовано!')
                  setTimeout(() => setToast(''), 2500)
                }}
                className="h-9 rounded-lg text-[12px] font-medium border border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1] transition-colors flex items-center justify-center gap-1">
                <Share2 className="w-3.5 h-3.5" />
                <span>Поділитись</span>
              </button>
            </div>

            {/* Seller card */}
            <Link href={`/user/${lot.seller.id}`} className="block bg-gradient-to-br from-[#F8FAFC] to-white border border-[#E2E8F0] rounded-xl p-3 hover:border-[#2563EB]/20 transition-colors mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[14px] font-bold text-[#0F172A] truncate">{lot.seller.name}</span>
                    {lot.seller.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="font-semibold">{lot.seller.rating}</span>
                    </span>
                    <span>·</span>
                    <span>{lot.seller.reviewsCount || 0} відгуків</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
              </div>
            </Link>

            {/* Trust badges */}
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center gap-2 text-[#10B981]">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-medium">Безпечна угода KRAM</span>
              </div>
              <div className="flex items-center gap-2 text-[#2563EB]">
                <Truck className="w-4 h-4" />
                <span className="font-medium">Доставка Новою Поштою</span>
              </div>
              <div className="flex items-center gap-2 text-[#64748B]">
                <MapPin className="w-4 h-4" />
                <span>{lot.city || 'Україна'}</span>
              </div>
            </div>

            {/* Report */}
            <button className="w-full mt-4 pt-3 border-t border-[#F1F5F9] text-[11px] text-[#94A3B8] hover:text-[#EF4444] flex items-center justify-center gap-1 transition-colors">
              <Flag className="w-3 h-3" />
              <span>Поскаржитись на лот</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      {!isEnded && !isOwner && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] p-3 shadow-premium">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-shrink-0 min-w-[90px]">
              <p className="text-[9px] text-[#94A3B8] leading-none mb-0.5">Поточна ставка</p>
              <p className="text-[15px] font-bold text-[#0B1220] leading-none">{formatPrice(currentPrice)}</p>
            </div>
            <div className="flex-1 flex gap-2">
              <button onClick={handleBid} className="flex-1 h-11 bg-[#2563EB] text-white rounded-xl text-[13px] font-bold hover:bg-[#1D4ED8] transition-colors">
                Ставка
              </button>
              {lot.buyNowPrice && (
                <button onClick={handleBuyNow} className="flex-1 h-11 bg-[#10B981] text-white rounded-xl text-[13px] font-bold hover:bg-[#059669] transition-colors truncate">
                  Купити
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showBidModal && (
        <BidModal
          lotId={lot.id}
          currentPrice={currentPrice}
          minIncrement={lot.minIncrement}
          lotTitle={lot.title}
          onClose={() => setShowBidModal(false)}
          onSuccess={onBidSuccess}
        />
      )}

      {/* OUTBID WARNING RETALIATION MODAL */}
      {outbidAlert && (
        <div className="fixed top-20 right-4 z-50 max-w-[360px] bg-[#0F172A] border border-rose-500/30 rounded-2xl p-4 shadow-2xl text-white animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500 flex-shrink-0 animate-pulse text-[18px]">
              ⚔️
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[13px] text-rose-400">Вашу ставку перебито!</p>
              <p className="text-[11px] text-white/70 truncate mb-2">{outbidAlert.lotTitle}</p>
              <p className="text-[14px] font-bold mb-3">Нова ціна: {formatPrice(outbidAlert.amount)}</p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const nextBid = outbidAlert.amount + lot.minIncrement
                    try {
                      const res = await fetch('/api/bids', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ listingId: lot.id, amount: nextBid })
                      })
                      if (res.ok) {
                        setOutbidAlert(null)
                        onBidSuccess(nextBid)
                      }
                    } catch(e){}
                  }}
                  className="flex-1 h-9 bg-rose-500 hover:bg-rose-600 rounded-lg text-[12px] font-bold text-white transition-colors"
                >
                  Реванш (+{lot.minIncrement} ₴)
                </button>
                <button
                  onClick={() => setOutbidAlert(null)}
                  className="h-9 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-[12px] font-medium"
                >
                  Закрити
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM BANK SLIP BUY NOW MODAL */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBuyModal(false)}></div>
          
          <div className="relative bg-white rounded-2xl w-full max-w-[420px] p-6 shadow-2xl animate-fade-in border border-[#E2E8F0] z-50">
            <button onClick={() => setShowBuyModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC]">
              <X className="w-5 h-5 text-[#64748B]" />
            </button>

            <div className="w-12 h-12 bg-[#10B981]/15 border border-[#10B981]/30 rounded-2xl flex items-center justify-center text-[#10B981] mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h2 className="text-[20px] font-bold text-[#0B1220] mb-1">Підтвердження покупки</h2>
            <p className="text-[13px] text-[#64748B] mb-6">Ви купуєте цей лот в один клік за фіксованою ціною.</p>

            <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#F8FAFC] space-y-3 mb-6">
              <div className="flex justify-between items-start">
                <span className="text-[12px] text-[#64748B] font-medium">Товар:</span>
                <span className="text-[13px] font-bold text-[#0F172A] text-right line-clamp-1 max-w-[200px]">{lot.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[#64748B] font-medium">Вартість лота:</span>
                <span className="text-[14px] font-bold text-[#0F172A]">{formatPrice(lot.buyNowPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[#64748B] font-medium">Сервісний збір KRAM:</span>
                <span className="text-[12px] font-semibold text-[#10B981]">0 ₴ (Beta 0%)</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-[#E2E8F0]">
                <span className="text-[13px] font-bold text-[#0B1220]">Разом до сплати:</span>
                <span className="text-[18px] font-extrabold text-[#2563EB]">{formatPrice(lot.buyNowPrice)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-[#EFF6FF] border border-[#2563EB]/15 rounded-xl mb-6">
              <Lock className="w-4 h-4 text-[#2563EB] mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-[#475569] leading-relaxed">
                <strong>KRAM Secure Escrow:</strong> Кошти будуть зафіксовані в системі та виплачені продавцю тільки після того, як ви заберете та підтвердите посилку на Новій Пошті.
              </p>
            </div>

            <button
              onClick={async () => {
                setBuying(true)
                try {
                  const res = await fetch('/api/buy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ listingId: lot.id })
                  })
                  const data = await res.json()
                  
                  if (!res.ok) {
                    setToast(data.error || 'Помилка при покупці')
                    setShowBuyModal(false)
                    setBuying(false)
                    setTimeout(() => setToast(''), 3000)
                    return
                  }

                  setToast('✅ Лот успішно куплено! Переходимо в кабінет...')
                  setShowBuyModal(false)
                  setTimeout(() => {
                    router.push('/cabinet?tab=purchases')
                  }, 1500)
                } catch (err) {
                  setToast('Помилка сервера')
                  setShowBuyModal(false)
                  setBuying(false)
                  setTimeout(() => setToast(''), 3000)
                }
              }}
              disabled={buying}
              className="w-full h-12 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-[15px] font-bold transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {buying ? 'Оформлення...' : `Оплатити та отримати`}
            </button>

            <button
              onClick={() => setShowBuyModal(false)}
              disabled={buying}
              className="w-full h-10 bg-transparent text-[#64748B] hover:text-[#0F172A] rounded-xl text-[13px] font-semibold mt-2 transition-colors"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
