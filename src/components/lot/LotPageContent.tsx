'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Clock, MapPin, Star, Truck, ShieldCheck, Eye, User, MessageCircle, Heart, Share2, Flag, TrendingUp, Lock, BadgeCheck, ChevronRight, CheckCircle2 } from 'lucide-react'
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
    const sse = new EventSource(`/api/events?channel=lot_${lot.id}`)
    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'new_bid') {
          setCurrentPrice(data.amount)
          setBidCount((prev: number) => prev + 1)
          if (data.endsAt) setEndsAt(data.endsAt)
          if (data.bid) {
            setBidsHistory((prev: any) => [data.bid, ...prev])
          }
        }
      } catch (err) {}
    }
    return () => sse.close()
  }, [lot.id])

  const isEnded = new Date(endsAt).getTime() <= Date.now()
  const isUrgent = !isEnded && new Date(endsAt).getTime() - Date.now() < 30 * 60000
  const isOwner = session?.user?.id === lot.sellerId

  function handleBid() {
    if (!session) { router.push(`/auth/login?callbackUrl=/lot/${lot.id}&action=bid`); return }
    setShowBidModal(true)
  }

  async function handleBuyNow() {
    if (!session) { router.push(`/auth/login?callbackUrl=/lot/${lot.id}&action=buy`); return }
    
    if (!confirm(`Підтверджуєте покупку за ${formatPrice(lot.buyNowPrice)}?`)) return
    
    try {
      const res = await fetch('/api/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: lot.id })
      })
      const data = await res.json()
      
      if (!res.ok) {
        setToast(data.error || 'Помилка при покупці')
        setTimeout(() => setToast(''), 3000)
        return
      }

      setToast('✅ Лот успішно куплено! Переходимо в кабінет...')
      setTimeout(() => {
        router.push('/cabinet?tab=purchases')
      }, 1500)
    } catch (err) {
      setToast('Помилка сервера')
      setTimeout(() => setToast(''), 3000)
    }
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
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#94A3B8]">Ставка</p>
              <p className="text-[16px] font-bold text-[#0B1220]">{formatPrice(currentPrice)}</p>
            </div>
            <button onClick={handleBid} className="flex-1 h-11 bg-[#2563EB] text-white rounded-xl text-[14px] font-bold">
              Зробити ставку
            </button>
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
    </div>
  )
}
