'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Star, Package, TrendingUp, Clock, User, MessageSquare, Flag, X, CheckCircle2, Info } from 'lucide-react'
import { formatPrice, timeAgo } from '@/lib/utils'
import { ReviewModal } from './ReviewModal'

interface Props {
  seller: {
    id: string
    name: string | null
    avatar: string | null
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
  const router = useRouter()
  const memberSince = new Date(seller.createdAt).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })
  const [activeTab, setActiveTab] = useState<'lots' | 'reviews'>('lots')
  const [showReviewModal, setShowReviewModal] = useState(false)
  
  // Report User modal states
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('Невиконання умов торгів')
  const [reportComment, setReportComment] = useState('')
  const [reportSuccess, setReportSuccess] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [toast, setToast] = useState('')

  async function submitReport() {
    if (reporting) return
    setReporting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: seller.id,
          reason: reportReason,
          comment: reportComment.trim() || undefined,
        })
      })

      if (res.ok) {
        setReportSuccess(true)
        setTimeout(() => {
          setShowReportModal(false)
          setReportSuccess(false)
          setReportComment('')
        }, 3000)
      } else {
        const errData = await res.json()
        setToast(errData.error || 'Помилка при надсиланні скарги')
        setTimeout(() => setToast(''), 3000)
      }
    } catch (e) {
      setToast('Помилка зʼєднання з сервером')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setReporting(false)
    }
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8">
      {toast && (
        <div className="fixed top-20 right-4 z-50 px-4 py-3 bg-[#0B1220] text-white text-[14px] font-medium rounded-xl shadow-premium animate-fade-in">
          {toast}
        </div>
      )}

      {/* Profile card */}
      <div className="bg-white border border-[#E2E8F0] rounded-[1.75rem] p-6 shadow-sm hover:shadow-md transition-all mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] flex items-center justify-center flex-shrink-0 shadow-inner border border-blue-50/50">
            {seller.avatar
              ? <img src={seller.avatar} alt="" className="w-full h-full object-cover" />
              : <User className="w-10 h-10 text-[#2563EB]" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-[24px] font-extrabold text-[#0B1220] tracking-tight">{seller.name || 'Продавець'}</h1>
              {seller.verified && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 bg-[#ECFDF5] border border-[#10B981]/10 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[11px] font-bold text-[#10B981]">Підтверджений профіль</span>
                </div>
              )}
              {seller.soldCount === 0 && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 bg-[#FFFBEB] border border-[#D97706]/10 rounded-full">
                  <span className="text-[11px] font-bold text-[#D97706]">Новий продавець</span>
                </div>
              )}
            </div>
            <p className="text-[13px] text-[#64748B] mb-4">На KRAM з <strong>{memberSince}</strong></p>
            
            <div className="flex flex-wrap items-center gap-4 text-[13px] mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl font-medium text-[#475569]">
                <Package className="w-4 h-4 text-[#2563EB]" />
                <span>{seller._count.listings} всього лотів</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl font-medium text-[#475569]">
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
                <span>{seller.soldCount} завершених домовленостей</span>
              </div>
            </div>

            {/* Premium Rating Block */}
            <div className="mb-4">
              {seller.reviewsCount > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4.5 h-4.5 ${star <= Math.round(seller.rating) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'fill-[#E2E8F0] text-[#E2E8F0]'}`} />
                    ))}
                  </div>
                  <span className="text-[15px] font-extrabold text-[#0F172A]">{seller.rating.toFixed(1)}</span>
                  <span className="text-[12px] text-[#64748B]">({seller.reviewsCount} відгуків)</span>
                </div>
              ) : (
                <p className="text-[12px] text-[#64748B] bg-[#F8FAFC] inline-block px-3 py-2 rounded-xl border border-dashed border-[#E2E8F0] italic">
                  ⭐ Рейтинг зʼявиться після перших завершених домовленостей.
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              {session?.user?.id !== seller.id && (
                <>
                  <button 
                    onClick={() => {
                      if (!session) { router.push(`/auth/login?callbackUrl=/user/${seller.id}`); return }
                      router.push('/cabinet?tab=purchases')
                    }}
                    title="Відгук можна залишити у кабінеті після завершеної домовленості за конкретним лотом"
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-[13px] font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Відгук після угоди
                  </button>

                  <button 
                    onClick={() => setShowReportModal(true)}
                    className="h-10 px-4 bg-transparent hover:bg-rose-50 border border-[#E2E8F0] hover:border-rose-100 text-[#64748B] hover:text-rose-600 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Flag className="w-4 h-4" />
                    Поскаржитись на користувача
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Trust explanation */}
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <p className="text-[13px] font-bold text-[#0B1220]">Що означає перевірка</p>
          </div>
          <p className="text-[12px] text-[#64748B] leading-relaxed">
            Бейдж означає базову перевірку профілю модератором KRAM. Це не гарантія оплати, доставки або стану товару.
          </p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#2563EB]" />
            <p className="text-[13px] font-bold text-[#0B1220]">Історія угод</p>
          </div>
          <p className="text-[12px] text-[#64748B] leading-relaxed">
            Рейтинг зʼявляється тільки після завершених домовленостей. Новим продавцям довіра набирається поступово.
          </p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-[#F97316]" />
            <p className="text-[13px] font-bold text-[#0B1220]">Як купувати обережно</p>
          </div>
          <p className="text-[12px] text-[#64748B] leading-relaxed">
            Не надсилайте передоплату. Використовуйте післяплату та перевіряйте товар у відділенні перед оплатою.
          </p>
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
                          {isActive ? 'активний' : 'завершено'}
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
              <p className="text-[15px] font-semibold text-[#0F172A]">Відгуків ще немає</p>
              <p className="text-[13px] text-[#64748B]">Перші відгуки зʼявляться тільки після завершених домовленостей</p>
            </div>
          ) : (
            seller.reviewsReceived?.map((review: any) => (
              <div key={review.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F1F5F9] rounded-full overflow-hidden flex items-center justify-center">
                      {review.reviewer.avatar ? (
                        <img src={review.reviewer.avatar} alt="" className="w-full h-full object-cover" />
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

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowReportModal(false)}></div>
          
          <div className="relative bg-white rounded-3xl w-full max-w-[420px] p-6 shadow-2xl animate-fade-in border border-[#E2E8F0] z-50">
            <button onClick={() => setShowReportModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC]">
              <X className="w-5 h-5 text-[#64748B]" />
            </button>

            {reportSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-[20px] font-bold text-[#0B1220] mb-2">Скаргу прийнято</h3>
                <p className="text-[13px] text-[#64748B] max-w-[280px] mx-auto leading-relaxed">
                  Дякуємо. Ми перевіримо діяльність цього користувача найближчим часом.
                </p>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mb-4">
                  <Flag className="w-6 h-6" />
                </div>

                <h2 className="text-[20px] font-bold text-[#0B1220] mb-1">Поскаржитись на користувача</h2>
                <p className="text-[13px] text-[#64748B] mb-5">
                  Оберіть причину скарги на користувача <strong>{seller.name || 'Продавець'}</strong>.
                </p>

                <div className="space-y-2 mb-4">
                  {[
                    'Невиконання умов торгів',
                    'Шахрайство / Обман',
                    'Підозріла поведінка',
                    'Образи / Спам у чаті',
                    'Інше'
                  ].map((reason) => {
                    const isSelected = reportReason === reason
                    return (
                      <button
                        key={reason}
                        onClick={() => setReportReason(reason)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl border text-[13px] font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                            : 'border-[#E2E8F0] hover:border-[#CBD5E1] text-[#475569] bg-white'
                        }`}
                      >
                        <span>{reason}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />}
                      </button>
                    )
                  })}
                </div>

                <div className="mb-5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                    Деталі скарги (необов'язково)
                  </label>
                  <textarea
                    value={reportComment}
                    onChange={(e) => setReportComment(e.target.value)}
                    placeholder="Вкажіть деталі порушення (наприклад, номер телефону, скриншоти домовленостей)..."
                    maxLength={500}
                    className="w-full min-h-[80px] p-3 text-[13px] border border-[#E2E8F0] rounded-xl focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/40 outline-none resize-none placeholder:text-[#94A3B8]"
                  />
                  <div className="text-right text-[10px] text-[#94A3B8] mt-1">
                    {reportComment.length}/500
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={submitReport}
                    disabled={reporting}
                    className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 disabled:bg-[#CBD5E1] text-white text-[13px] font-bold rounded-xl transition-all flex items-center justify-center"
                  >
                    {reporting ? 'Надсилання...' : 'Надіслати скаргу'}
                  </button>
                  <button
                    onClick={() => setShowReportModal(false)}
                    disabled={reporting}
                    className="px-4 h-11 bg-transparent hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] text-[13px] font-semibold rounded-xl transition-colors border border-transparent hover:border-[#E2E8F0]"
                  >
                    Скасувати
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

