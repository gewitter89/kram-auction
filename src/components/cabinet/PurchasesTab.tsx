'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Package, Truck, CheckCircle, AlertCircle, Clock, CreditCard, MessageSquare, ShieldCheck, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatPrice, timeAgo } from '@/lib/utils'
import { DisputeModal } from '@/components/cabinet/DisputeModal'
import { ReviewModal } from '@/components/user/ReviewModal'

interface Transaction {
  id: string
  listing: {
    id: string
    title: string
    images: string
  }
  seller: {
    id: string
    name: string
    avatar: string | null
  }
  amount: number
  status: string
  paymentStatus: string
  deliveryStatus: string
  trackingNumber: string | null
  deliveryProvider: string | null
  createdAt: string
  sellerShippedAt: string | null
  completedAt: string | null
}

const statusLabels: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  PENDING_PAYMENT: { label: 'Очікує узгодження умов', color: 'bg-amber-100 text-amber-700', icon: Clock },
  TERMS_AGREED: { label: 'Узгоджено — очікує відправлення', color: 'bg-blue-100 text-blue-700', icon: Package },
  PAID_HELD: { label: 'Узгоджено — очікує відправлення', color: 'bg-blue-100 text-blue-700', icon: Package },
  SELLER_SHIPPED: { label: 'Відправлено — очікує підтвердження отримання', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  BUYER_RECEIVED: { label: 'Отримано покупцем', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  COMPLETED: { label: 'Угоду завершено', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  DISPUTED: { label: 'Відкрито спір', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  CANCELLED: { label: 'Угоду скасовано', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
  REFUNDED: { label: 'Угоду скасовано продавцем', color: 'bg-purple-100 text-purple-700', icon: CreditCard },
}

function getNextAction(transaction: Transaction): { text: string; action?: string } {
  switch (transaction.status) {
    case 'PENDING_PAYMENT':
      return { text: 'Узгодьте спосіб оплати та доставки з продавцем у чаті' }
    case 'TERMS_AGREED':
    case 'PAID_HELD':
      return { text: 'Очікуємо відправлення лота від продавця' }
    case 'SELLER_SHIPPED':
      return { text: 'Отримайте та перевірте посилку, після чого підтвердіть отримання' }
    case 'DISPUTED':
      return { text: 'Виникли розбіжності. Будь ласка, вирішуйте їх у чаті або зверніться до модератора.' }
    case 'COMPLETED':
      return { text: 'Угоду успішно завершено!' }
    case 'CANCELLED':
      return { text: 'Угоду скасовано' }
    case 'REFUNDED':
      return { text: 'Угоду скасовано / відхилено продавцем' }
    default:
      return { text: '' }
  }
}

export function PurchasesTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [disputeTxId, setDisputeTxId] = useState<string | null>(null)
  const [reviewTx, setReviewTx] = useState<Transaction | null>(null)

  const load = () => {
    fetch('/api/transactions?role=buyer')
      .then(r => r.json())
      .then(d => {
        setTransactions(d.transactions || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function markPaid(id: string) {
    setProcessing(id)
    try {
      const res = await fetch(`/api/transactions/${id}/mark-paid`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        // Optimistic update: immediately update the transaction in state
        if (data.transaction) {
          setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...data.transaction, listing: tx.listing, seller: tx.seller } : tx))
        }
        // Then reload to ensure sync with server
        setTimeout(() => load(), 100)
      } else {
        const data = await res.json()
        alert(data.error || 'Помилка')
        load()
      }
    } catch (err) {
      alert('Помилка мережі')
      load()
    } finally {
      setProcessing(null)
    }
  }

  async function confirmReceived(id: string) {
    if (!confirm('Підтвердити отримання товару? Переконайтесь, що все в порядку.')) return
    setProcessing(id)
    try {
      const res = await fetch(`/api/transactions/${id}/confirm-received`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        // Optimistic update: immediately update the transaction in state
        if (data.transaction) {
          setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...data.transaction, listing: tx.listing, seller: tx.seller } : tx))
        }
        // Then reload to ensure sync with server
        setTimeout(() => load(), 100)
      } else {
        const data = await res.json()
        alert(data.error || 'Помилка')
        load() // Refresh on error to get correct state
      }
    } catch (err) {
      alert('Помилка мережі')
      load()
    } finally {
      setProcessing(null)
    }
  }

  async function cancelAgreement(id: string) {
    if (!confirm('Скасувати домовленість? Лот знову стане доступним у каталозі.')) return
    setProcessing(id)
    try {
      const res = await fetch(`/api/transactions/${id}/cancel`, { method: 'POST' })
      if (res.ok) {
        load()
      } else {
        const data = await res.json()
        alert(data.error || 'Помилка')
      }
    } finally {
      setProcessing(null)
    }
  }

  async function openDispute(id: string, reason: string) {
    setProcessing(id)
    try {
      const res = await fetch(`/api/transactions/${id}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      if (res.ok) {
        load()
      } else {
        const data = await res.json()
        alert(data.error || 'Помилка')
      }
    } finally {
      setProcessing(null)
    }
  }

  if (loading) return <SkeletonList />

  if (transactions.length === 0) {
    return (
      <EmptyState 
        icon={ShoppingBag} 
        title="Покупки" 
        text="У вас ще немає покупок. Знайдіть щось цікаве в каталозі." 
        cta={{ href: '/catalog', label: 'Переглянути каталог' }} 
      />
    )
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h2 className="text-[18px] font-bold text-[#0B1220]">Мої покупки</h2>
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-[12px] font-semibold text-[#1E40AF]">
          <ShieldCheck className="w-4 h-4" />
          Оплата напряму з продавцем, рекомендовано післяплатою
        </div>
      </div>
      <div className="space-y-4">
        {transactions.map(tx => {
          let images: string[] = []
          try { images = JSON.parse(tx.listing.images || '[]') } catch {}
          
          const statusInfo = statusLabels[tx.status] || { label: tx.status, color: 'bg-gray-100', icon: Package }
          const StatusIcon = statusInfo.icon
          const nextAction = getNextAction(tx)

          return (
            <article key={tx.id} className="group bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:border-[#2563EB]/40 hover:shadow-card transition-all">
              {/* Header */}
              <div className="p-4 border-b border-[#F1F5F9] flex items-center justify-between bg-white group-hover:bg-[#F8FAFC]">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold ${statusInfo.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusInfo.label}
                  </span>
                  <span className="text-[12px] text-[#94A3B8]">{timeAgo(tx.createdAt)}</span>
                </div>
                <p className="text-[16px] font-bold text-[#0B1220]">{formatPrice(tx.amount)}</p>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <Link href={`/lot/${tx.listing.id}`} className="w-20 h-20 bg-[#F1F5F9] rounded-xl overflow-hidden flex-shrink-0">
                    {images[0] && <img src={images[0]} alt="" className="w-full h-full object-cover" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/lot/${tx.listing.id}`} className="text-[15px] font-semibold text-[#0F172A] hover:text-[#2563EB] line-clamp-2">
                      {tx.listing.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[13px] text-[#64748B]">Продавець:</span>
                      <Link href={`/user/${tx.seller.id}`} className="text-[13px] font-medium text-[#2563EB] hover:underline">
                        {tx.seller.name}
                      </Link>
                    </div>
                    
                    {/* Tracking info */}
                    {tx.trackingNumber && (
                      <div className="mt-3 p-3 bg-[#F8FAFC] rounded-xl">
                        <p className="text-[12px] text-[#64748B] mb-1">Номер накладної:</p>
                        <p className="text-[14px] font-semibold text-[#0F172A]">{tx.trackingNumber}</p>
                        <p className="text-[12px] text-[#94A3B8]">{tx.deliveryProvider}</p>
                      </div>
                    )}

                    {/* Next action hint */}
                    {nextAction.text && (
                      <p className="mt-3 text-[13px] text-[#64748B]">
                        <span className="font-medium">Що далі:</span> {nextAction.text}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {tx.status === 'PENDING_PAYMENT' && (
                    <div className="w-full sm:w-auto">
                      <button
                        onClick={() => markPaid(tx.id)}
                        disabled={processing === tx.id}
                        className="h-10 px-5 bg-[#10B981] text-white rounded-xl text-[13px] font-semibold hover:bg-[#059669] disabled:opacity-50 transition-all"
                      >
                        {processing === tx.id ? 'Надсилання...' : (
                          <>
                            <CheckCircle className="w-4 h-4 inline mr-1" aria-hidden="true" />
                            Підтвердити домовленість
                          </>
                        )}
                      </button>
                      <p className="mt-1 text-[11px] text-[#64748B]">
                        Натисніть після того, як узгодили з продавцем спосіб оплати та доставки.
                      </p>
                    </div>
                  )}
                  
                  {tx.status === 'SELLER_SHIPPED' && (
                    <button
                      onClick={() => confirmReceived(tx.id)}
                      disabled={processing === tx.id}
                      className="h-10 px-5 bg-[#2563EB] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1D4ED8] disabled:opacity-50 transition-all"
                    >
                      {processing === tx.id ? 'Обробка...' : (
                          <>
                            <CheckCircle className="w-4 h-4 inline mr-1" aria-hidden="true" />
                            Підтвердити отримання
                          </>
                        )}
                    </button>
                  )}
                  
                  {(tx.status === 'PENDING_PAYMENT' || tx.status === 'TERMS_AGREED' || tx.status === 'PAID_HELD') && (
                    <button
                      onClick={() => cancelAgreement(tx.id)}
                      disabled={processing === tx.id}
                      className="h-10 px-5 bg-white border border-[#CBD5E1] text-[#64748B] rounded-xl text-[13px] font-semibold hover:bg-[#F8FAFC] disabled:opacity-50 transition-all"
                    >
                      Скасувати домовленість
                    </button>
                  )}

                  {(tx.status === 'TERMS_AGREED' || tx.status === 'PAID_HELD' || tx.status === 'SELLER_SHIPPED') && (
                    <button
                      onClick={() => setDisputeTxId(tx.id)}
                      disabled={processing === tx.id}
                      className="h-10 px-5 bg-white border border-[#EF4444] text-[#EF4444] rounded-xl text-[13px] font-semibold hover:bg-[#FEF2F2] disabled:opacity-50 transition-all"
                    >
                      Відкрити спір
                    </button>
                  )}
                  
                  <Link
                    href={`/cabinet/transactions/${tx.id}`}
                    className="h-10 px-5 bg-[#0B1220] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1E293B] transition-all flex items-center"
                  >
                    Деталі угоди
                  </Link>

                  <Link
                    href={`/lot/${tx.listing.id}`}
                    className="h-10 px-5 bg-[#F8FAFC] text-[#64748B] rounded-xl text-[13px] font-medium hover:bg-[#F1F5F9] transition-all flex items-center"
                  >
                    Переглянути лот
                  </Link>
                  
                  {tx.status === 'COMPLETED' && (
                    <button
                      onClick={() => setReviewTx(tx)}
                      className="h-10 px-5 bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] rounded-xl text-[13px] font-bold hover:bg-[#FEF3C7] transition-all flex items-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      Залишити відгук
                    </button>
                  )}

                  <Link
                    href={`/messages?user=${tx.seller.id}&listing=${tx.listing.id}`}
                    className="h-10 px-5 bg-[#F8FAFC] text-[#64748B] rounded-xl text-[13px] font-medium hover:bg-[#F1F5F9] transition-all flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Написати продавцю
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
      {reviewTx && (
        <ReviewModal
          sellerId={reviewTx.seller.id}
          sellerName={reviewTx.seller.name}
          listingId={reviewTx.listing.id}
          listingTitle={reviewTx.listing.title}
          onClose={() => setReviewTx(null)}
          onSuccess={() => {
            setReviewTx(null)
            load()
          }}
        />
      )}
      {disputeTxId && (
        <DisputeModal
          onClose={() => setDisputeTxId(null)}
          onSubmit={(reason) => openDispute(disputeTxId, reason)}
        />
      )}
    </>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-4">
      {[1, 2].map(i => (
        <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-[#F1F5F9] rounded-xl animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#F1F5F9] rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-[#F1F5F9] rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ icon: Icon, title, text, cta }: { icon: LucideIcon; title: string; text: string; cta?: { href: string; label: string } }) {
  return (
    <div className="py-12 text-center">
      <div className="w-14 h-14 mx-auto mb-4 bg-[#F8FAFC] rounded-2xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-[#94A3B8]" />
      </div>
      <p className="text-[16px] font-semibold text-[#0F172A] mb-2">{title}</p>
      <p className="text-[13px] text-[#64748B] mb-5 max-w-[320px] mx-auto">{text}</p>
      {cta && (
        <Link href={cta.href} className="inline-flex h-10 px-5 items-center bg-[#2563EB] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1D4ED8]">
          {cta.label}
        </Link>
      )}
    </div>
  )
}
