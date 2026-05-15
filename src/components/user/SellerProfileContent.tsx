'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ShieldCheck, Star, Package, TrendingUp, Clock, User, MessageSquare } from 'lucide-react'
import { formatPrice, timeAgo } from '@/lib/utils'
import { ReviewModal } from './ReviewModal'

interface Props {
  seller: {
    id: string
    name: string | null
    image: string | null
    createdAt: Date
    rating: number
    verified: boolean
    soldCount: number
    activeCount: number
    reviewsCount: number
    reviewsReceived: any[]
    listings: any[]
    _count: { listings: number, reviewsReceived: number }
  }
}

export function SellerProfileContent({ seller }: Props) {
  const { data: session } = useSession()
  const memberSince = new Date(seller.createdAt).getFullYear()
  const [activeTab, setActiveTab] = useState<'lots' | 'reviews'>('lots')
  const [showReviewModal, setShowReviewModal] = useState(false)

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8">
      {/* Profile card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
            {seller.image
              ? <img src={seller.image} alt="" className="w-full h-full object-cover" />
              : <User className="w-9 h-9 text-[#2563EB]" />
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[22px] font-bold text-[#0B1220]">{seller.name || 'Продавець'}</h1>
              {seller.verified && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-[#ECFDF5] rounded-full">
                  <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                  <span className="text-[11px] font-semibold text-[#10B981]">Верифікований</span>
                </div>
              )}
            </div>
            <p className="text-[13px] text-[#64748B] mb-3">Учасник з {memberSince} року</p>
            <div className="flex items-center gap-4 text-[13px]">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                <span className="font-semibold text-[#0F172A]">{seller.rating > 0 ? seller.rating.toFixed(1) : 'Новий'}</span>
              </div>
              <div className="flex items-center gap-1 text-[#64748B]">
                <Package className="w-4 h-4" />
                <span>{seller._count.listings} лотів</span>
              </div>
              <div className="flex items-center gap-1 text-[#64748B]">
                <TrendingUp className="w-4 h-4" />
                <span>{seller.soldCount} продажів</span>
              </div>
            </div>
            {session && session.user.id !== seller.id && (
              <div className="mt-4">
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[13px] font-semibold text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
                >
                  Залишити відгук
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E2E8F0] mb-6">
        <button
          onClick={() => setActiveTab('lots')}
          className={`pb-3 text-[15px] font-bold border-b-2 transition-colors ${
            activeTab === 'lots' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Лоти продавця
          {seller.activeCount > 0 && <span className="ml-2 px-2 py-0.5 bg-[#EFF6FF] text-[#2563EB] rounded-full text-[11px]">{seller.activeCount}</span>}
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 text-[15px] font-bold border-b-2 transition-colors ${
            activeTab === 'reviews' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Відгуки
          {seller.reviewsCount > 0 && <span className="ml-2 px-2 py-0.5 bg-[#F8FAFC] text-[#64748B] rounded-full text-[11px]">{seller.reviewsCount}</span>}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'lots' && (
        <div>
          {seller.listings.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center">
              <Package className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
              <p className="text-[15px] font-semibold text-[#0F172A]">Лотів поки немає</p>
              <p className="text-[13px] text-[#64748B]">Продавець ще не виставляв товари</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {seller.listings.map(lot => {
                let images: string[] = []
                try { images = JSON.parse(lot.images || '[]') } catch {}
                const isActive = lot.status === 'active'
                return (
                  <Link key={lot.id} href={`/lot/${lot.id}`}
                    className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:border-[#2563EB]/40 hover:shadow-md transition-all">
                    <div className="aspect-[4/3] bg-[#F1F5F9] overflow-hidden relative">
                      {images[0]
                        ? <img src={images[0]} alt={lot.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-[#CBD5E1]"><Package className="w-10 h-10" /></div>
                      }
                      {!isActive && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white font-semibold text-[12px] bg-black/60 px-3 py-1 rounded-full">
                            {lot.status === 'sold' ? '✅ Продано' : '⏹ Завершено'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-[13px] font-semibold text-[#0F172A] truncate mb-1">{lot.title}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-[15px] font-bold text-[#0B1220]">{formatPrice(lot.currentPrice)}</p>
                        <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
                          <Clock className="w-3 h-3" />
                          {isActive ? timeAgo(lot.endsAt) : timeAgo(lot.endsAt)}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {seller.reviewsReceived?.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center">
              <MessageSquare className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
              <p className="text-[15px] font-semibold text-[#0F172A]">Відгуків поки немає</p>
              <p className="text-[13px] text-[#64748B]">Цей продавець ще не отримував відгуків</p>
            </div>
          ) : (
            seller.reviewsReceived?.map((review: any) => (
              <div key={review.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F1F5F9] rounded-full overflow-hidden flex items-center justify-center">
                      {review.reviewer.image ? (
                        <img src={review.reviewer.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-[#94A3B8]" />
                      )}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#0F172A]">{review.reviewer.name}</p>
                      <p className="text-[11px] text-[#94A3B8]">{timeAgo(review.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'fill-[#E2E8F0] text-[#E2E8F0]'}`} />
                    ))}
                  </div>
                </div>
                {review.text && (
                  <p className="text-[14px] text-[#475569] leading-relaxed mb-3">{review.text}</p>
                )}
                {review.listing && (
                  <div className="flex items-center gap-2 p-2 bg-[#F8FAFC] rounded-lg">
                    <Package className="w-4 h-4 text-[#94A3B8]" />
                    <Link href={`/lot/${review.listing.id}`} className="text-[12px] font-medium text-[#2563EB] hover:underline line-clamp-1">
                      Лот: {review.listing.title}
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showReviewModal && (
        <ReviewModal
          sellerId={seller.id}
          sellerName={seller.name || 'Продавець'}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
