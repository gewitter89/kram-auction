'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, Truck, ShieldCheck, CheckCircle, AlertCircle, 
  Clock, CreditCard, MessageSquare, ChevronLeft, MapPin, 
  User, Phone, ExternalLink, Calendar, Info
} from 'lucide-react'
import { formatPrice, timeAgo } from '@/lib/utils'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [tx, setTx] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const load = async () => {
    try {
      const res = await fetch(`/api/transactions/${id}`)
      const data = await res.json()
      if (data.transaction) {
        setTx(data.transaction)
      } else {
        alert('Угоду не знайдено')
        router.push('/cabinet?tab=purchases')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function handleAction(action: string, body?: any) {
    setProcessing(true)
    try {
      const res = await fetch(`/api/transactions/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      })
      if (res.ok) {
        await load()
      } else {
        const data = await res.json()
        alert(data.error || 'Помилка')
      }
    } catch (err) {
      alert('Помилка мережі')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return (
    <div className="py-40 flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin" />
      <p className="text-[#64748B] font-medium">Завантаження деталей угоди...</p>
    </div>
  )

  if (!tx) return null

  const steps = [
    { id: 'PENDING_PAYMENT', label: 'Оплата', icon: CreditCard },
    { id: 'PAID_HELD', label: 'Підготовка', icon: Package },
    { id: 'SELLER_SHIPPED', label: 'Доставка', icon: Truck },
    { id: 'COMPLETED', label: 'Завершено', icon: CheckCircle },
  ]

  const currentStepIndex = steps.findIndex(s => {
    if (tx.status === 'COMPLETED') return s.id === 'COMPLETED'
    if (tx.status === 'SELLER_SHIPPED') return s.id === 'SELLER_SHIPPED'
    if (tx.status === 'PAID_HELD') return s.id === 'PAID_HELD'
    return s.id === 'PENDING_PAYMENT'
  })

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8">
      {/* Navigation */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#64748B] hover:text-[#0B1220] transition-colors mb-6 text-[14px] font-medium"
      >
        <ChevronLeft className="w-4 h-4" /> Повернутися
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Stepper */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, i) => {
                const isCompleted = i < currentStepIndex || tx.status === 'COMPLETED'
                const isCurrent = i === currentStepIndex && tx.status !== 'COMPLETED'
                const Icon = step.icon
                
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 relative flex-1">
                    {/* Line */}
                    {i < steps.length - 1 && (
                      <div className={`absolute top-5 left-[50%] right-[-50%] h-[2px] ${i < currentStepIndex ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'}`} />
                    )}
                    
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                      isCompleted ? 'bg-[#10B981] text-white' : 
                      isCurrent ? 'bg-[#2563EB] text-white ring-4 ring-[#2563EB]/10' : 
                      'bg-[#F1F5F9] text-[#94A3B8]'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      isCompleted ? 'text-[#10B981]' : isCurrent ? 'text-[#2563EB]' : 'text-[#94A3B8]'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className={`p-5 rounded-2xl flex flex-col gap-4 ${
              tx.status === 'DISPUTED' ? 'bg-[#FEF2F2] border border-[#EF4444]/25 shadow-sm' : 'bg-[#F8FAFC] border border-[#E2E8F0]'
            }`}>
              <div className="flex items-start gap-3">
                {tx.status === 'DISPUTED' ? (
                  <AlertCircle className="w-5 h-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                ) : (
                  <Info className="w-5 h-5 text-[#2563EB] mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <h4 className={`text-[15px] font-bold ${tx.status === 'DISPUTED' ? 'text-[#EF4444]' : 'text-[#0F172A]'}`}>
                    {tx.status === 'DISPUTED' ? 'Триває вирішення спору' : 'Поточний статус угоди'}
                  </h4>
                  <p className="text-[13px] text-[#64748B] mt-1 leading-relaxed">
                    {tx.status === 'PENDING_PAYMENT' && 'Очікуємо оплату від покупця. Усі кошти підлягають безпечному утриманню в системі.'}
                    {tx.status === 'PAID_HELD' && 'Оплата отримана! Продавець готує товар до відправлення.'}
                    {tx.status === 'SELLER_SHIPPED' && 'Товар успішно надіслано продавцем і він уже прямує до отримувача.'}
                    {tx.status === 'COMPLETED' && 'Угоду успішно закрито. Кошти перераховані на користь продавця.'}
                    {tx.status === 'DISPUTED' && 'Адміністратор KRAM перевіряє деталі угоди та надану інформацію для вирішення спору.'}
                  </p>
                </div>
              </div>

              {/* What's Next / Що далі dynamic guide */}
              <div className="pt-4 border-t border-[#E2E8F0] mt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-3">
                  💡 Що далі (покрокова інструкція)
                </span>
                
                {tx.buyerId === tx.currentUserId ? (
                  // Buyer Instructions
                  <div className="space-y-3">
                    {tx.status === 'PENDING_PAYMENT' && (
                      <div className="flex items-start gap-2.5 text-[13px] text-[#475569]">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2563EB]/15 text-[#2563EB] text-[11px] font-bold flex items-center justify-center">1</span>
                        <p><strong>Здійсніть оплату</strong>. Ви можете зробити це у вашому кабінеті у вкладці «Покупки». Ми безпечно затримаємо кошти на транзитному рахунку.</p>
                      </div>
                    )}
                    {tx.status === 'PAID_HELD' && (
                      <div className="flex items-start gap-2.5 text-[13px] text-[#475569]">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2563EB]/15 text-[#2563EB] text-[11px] font-bold flex items-center justify-center">2</span>
                        <p><strong>Очікуйте ТТН</strong>. Продавець зобов'язаний надіслати лот протягом 3 днів та вказати номер відправлення. Ви отримаєте сповіщення.</p>
                      </div>
                    )}
                    {tx.status === 'SELLER_SHIPPED' && (
                      <div className="flex flex-col gap-2 bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm">
                        <div className="flex items-start gap-2.5 text-[13px] text-[#475569]">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#10B981]/15 text-[#10B981] text-[11px] font-bold flex items-center justify-center">3</span>
                          <p><strong>Отримайте та перевірте товар</strong> у відділенні Нової Пошти. Лише після огляду натисніть кнопку <strong>«Підтвердити отримання»</strong> в деталях угоди, щоб продавець отримав виплату.</p>
                        </div>
                        <p className="text-[11px] text-[#EF4444] font-medium ml-7">
                          ⚠️ Не підтверджуйте отримання, якщо товар не відповідає опису або ви не забрали його!
                        </p>
                      </div>
                    )}
                    {tx.status === 'COMPLETED' && (
                      <div className="flex items-start gap-2.5 text-[13px] text-[#10B981]">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#10B981]/15 text-[11px] font-bold flex items-center justify-center">✓</span>
                        <p><strong>Дякуємо за покупку!</strong> Ваша угода захищена KRAM Safe Deal. Ви можете залишити відгук про продавця.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Seller Instructions
                  <div className="space-y-3">
                    {tx.status === 'PENDING_PAYMENT' && (
                      <div className="flex items-start gap-2.5 text-[13px] text-[#475569]">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2563EB]/15 text-[#2563EB] text-[11px] font-bold flex items-center justify-center">1</span>
                        <p><strong>Очікуйте оплати</strong>. Покупець має внести кошти. Тільки після підтвердження статусу «Оплачено» приступайте до відправки товару.</p>
                      </div>
                    )}
                    {tx.status === 'PAID_HELD' && (
                      <div className="flex flex-col gap-2 bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm">
                        <div className="flex items-start gap-2.5 text-[13px] text-[#475569]">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2563EB]/15 text-[#2563EB] text-[11px] font-bold flex items-center justify-center">2</span>
                          <p><strong>Відправте лот</strong> через Нову Пошту на вказане покупцем відділення. Потім впишіть ТТН у полі «Доставка».</p>
                        </div>
                        <p className="text-[11px] text-amber-600 font-medium ml-7">
                          ⚠️ Надсилання здійснюється виключно на реквізити, зазначені в даній угоді!
                        </p>
                      </div>
                    )}
                    {tx.status === 'SELLER_SHIPPED' && (
                      <div className="flex items-start gap-2.5 text-[13px] text-[#475569]">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2563EB]/15 text-[#2563EB] text-[11px] font-bold flex items-center justify-center">3</span>
                        <p><strong>Відстеження посилки</strong>. Як тільки покупець перевірить та підтвердить отримання товару, заблокована сума автоматично стане доступною для виплати на вашу картку.</p>
                      </div>
                    )}
                    {tx.status === 'COMPLETED' && (
                      <div className="flex items-start gap-2.5 text-[13px] text-[#10B981]">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#10B981]/15 text-[11px] font-bold flex items-center justify-center">✓</span>
                        <p><strong>Угоду завершено!</strong> Кошти відправлено на виплату за вашими реквізитами. Дякуємо за продаж!</p>
                      </div>
                    )}
                  </div>
                )}

                {tx.status === 'DISPUTED' && (
                  <div className="bg-red-50 p-3 rounded-xl border border-red-200 mt-2 text-[12px] text-red-800 leading-relaxed">
                    🚨 <strong>Арбітраж KRAM Safe Deal</strong>: Очікуйте на розгляд спору. Кошти надійно утримуються на платформі до фінального рішення арбітра. Ви можете надіслати підтверджуючі матеріали (чек відправки, скріншоти діалогу) у нашу підтримку.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lot Info Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <h3 className="text-[15px] font-bold text-[#0B1220]">Деталі лота</h3>
            </div>
            <div className="p-4 flex gap-4">
              <div className="w-24 h-24 bg-[#F1F5F9] rounded-xl overflow-hidden flex-shrink-0">
                {JSON.parse(tx.listing.images || '[]')[0] && (
                  <img src={JSON.parse(tx.listing.images || '[]')[0]} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <Link href={`/lot/${tx.listing.id}`} className="text-[16px] font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors leading-tight block mb-2">
                  {tx.listing.title}
                </Link>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-[11px] text-[#94A3B8] uppercase font-bold tracking-wider mb-1">Ціна</p>
                    <p className="text-[18px] font-black text-[#2563EB]">{formatPrice(tx.amount)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#94A3B8] uppercase font-bold tracking-wider mb-1">Дата угоди</p>
                    <p className="text-[14px] font-semibold text-[#0B1220]">{new Date(tx.createdAt).toLocaleDateString('uk-UA')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Tracking */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#F1F5F9] flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0B1220] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#2563EB]" /> Доставка
              </h3>
              {tx.trackingNumber && (
                <span className="px-2 py-1 bg-[#EFF6FF] text-[#2563EB] text-[11px] font-bold rounded-lg uppercase tracking-wider">
                  {tx.deliveryProvider}
                </span>
              )}
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[13px] font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#94A3B8]" /> Отримувач
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-[#64748B]" />
                      </div>
                      <p className="text-[14px] font-medium text-[#0F172A]">{tx.recipientName || 'Не вказано'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-[#64748B]" />
                      </div>
                      <p className="text-[14px] font-medium text-[#0F172A]">{tx.recipientPhone || 'Не вказано'}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg flex items-center justify-center mt-0.5">
                        <MapPin className="w-4 h-4 text-[#64748B]" />
                      </div>
                      <p className="text-[14px] font-medium text-[#0F172A] flex-1">
                        {tx.deliveryCity}, {tx.deliveryWarehouse}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[13px] font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#94A3B8]" /> Відправлення
                  </h4>
                  {tx.trackingNumber ? (
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] text-[#94A3B8] font-bold uppercase">Номер ТТН</p>
                        <button 
                          onClick={() => handleAction('sync-tracking')}
                          disabled={processing}
                          className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-1"
                        >
                          {processing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                          Оновити статус
                        </button>
                      </div>
                      <p className="text-[20px] font-black text-[#0B1220] mb-4 tracking-tight">
                        {tx.trackingNumber}
                      </p>
                      <a 
                        href={`https://novaposhta.ua/tracking/?cargo_number=${tx.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 h-10 w-full bg-[#2563EB] text-white rounded-xl text-[13px] font-bold hover:bg-[#1D4ED8] transition-all"
                      >
                        <ExternalLink className="w-4 h-4" /> Відстежити
                      </a>
                    </div>
                  ) : (
                    <div className="h-full border-2 border-dashed border-[#E2E8F0] rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                      <Truck className="w-8 h-8 text-[#CBD5E1] mb-2" />
                      <p className="text-[12px] text-[#94A3B8]">Очікуємо відправку від продавця</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline / Events */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#F1F5F9] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2563EB]" />
              <h3 className="text-[15px] font-bold text-[#0B1220]">Історія подій</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#F1F5F9]">
                {tx.events?.map((event: any, i: number) => (
                  <div key={event.id} className="relative pl-8">
                    <div className={`absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full border-4 border-white flex items-center justify-center ${
                      i === 0 ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'
                    }`}>
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-[13px] font-bold ${i === 0 ? 'text-[#0B1220]' : 'text-[#64748B]'}`}>
                        {event.message}
                      </p>
                      <span className="text-[11px] text-[#94A3B8]">{new Date(event.createdAt).toLocaleString('uk-UA', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                    </div>
                    {event.metadata && (
                      <p className="text-[12px] text-[#94A3B8]">
                        {JSON.parse(event.metadata).note || ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Party Cards */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <h3 className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-wider mb-4">Учасники</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EFF6FF] rounded-full flex items-center justify-center overflow-hidden">
                  {tx.seller.avatar ? <img src={tx.seller.avatar} alt="" /> : <User className="w-5 h-5 text-[#2563EB]" />}
                </div>
                <div>
                  <p className="text-[11px] text-[#94A3B8] font-bold uppercase">Продавець</p>
                  <p className="text-[14px] font-bold text-[#0F172A]">{tx.seller.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F1F5F9] rounded-full flex items-center justify-center overflow-hidden">
                  {tx.buyer.avatar ? <img src={tx.buyer.avatar} alt="" /> : <User className="w-5 h-5 text-[#64748B]" />}
                </div>
                <div>
                  <p className="text-[11px] text-[#94A3B8] font-bold uppercase">Покупець</p>
                  <p className="text-[14px] font-bold text-[#0F172A]">{tx.buyer.name}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[#F1F5F9]">
              <Link 
                href={`/messages?user=${tx.seller.id === tx.currentUserId ? tx.buyer.id : tx.seller.id}&listing=${tx.listing.id}`}
                className="flex items-center justify-center gap-2 h-11 w-full bg-[#F8FAFC] text-[#0B1220] rounded-xl text-[13px] font-bold hover:bg-[#F1F5F9] transition-all"
              >
                <MessageSquare className="w-4 h-4" /> Написати повідомлення
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <h3 className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-wider mb-4">Дії</h3>
            <div className="space-y-3">
              {tx.status === 'SELLER_SHIPPED' && tx.buyerId === tx.currentUserId && (
                <button
                  onClick={() => handleAction('confirm-received')}
                  disabled={processing}
                  className="w-full h-12 bg-[#10B981] text-white rounded-xl font-bold hover:bg-[#059669] transition-all flex items-center justify-center gap-2"
                >
                  {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Підтвердити отримання
                </button>
              )}

              {(tx.status === 'PAID_HELD' || tx.status === 'SELLER_SHIPPED') && (
                <button
                  onClick={() => {
                    const reason = prompt('Вкажіть причину спору:')
                    if (reason) handleAction('dispute', { reason })
                  }}
                  disabled={processing}
                  className="w-full h-11 bg-white border border-[#EF4444] text-[#EF4444] rounded-xl text-[13px] font-bold hover:bg-[#FEF2F2] transition-all"
                >
                  Відкрити спір
                </button>
              )}

              {tx.status === 'PENDING_PAYMENT' && tx.buyerId === tx.currentUserId && (
                <p className="text-[12px] text-center text-[#64748B] italic">
                  Перейдіть до оплати у вкладці "Покупки"
                </p>
              )}

              {tx.status === 'COMPLETED' && (
                <div className="p-4 bg-[#F0FDF4] rounded-xl flex items-center gap-3 text-[#10B981]">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-[13px] font-bold">Угоду успішно завершено</p>
                </div>
              )}
            </div>
          </div>

          {/* Protection Note */}
          <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-2xl p-6 text-white shadow-lg">
            <ShieldCheck className="w-8 h-8 mb-4 opacity-80" />
            <h4 className="text-[16px] font-bold mb-2">KRAM Safe</h4>
            <p className="text-[12px] text-white/80 leading-relaxed">
              Ваша безпека — наш пріоритет. KRAM показує статус оплати, доставки, отримання та спору на кожному кроці.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
