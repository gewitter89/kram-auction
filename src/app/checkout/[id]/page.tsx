'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Truck, ShieldCheck, CreditCard, ChevronRight, MapPin, User, Phone } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [lot, setLot] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1) // 1: Delivery, 2: Payment, 3: Success
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: '',
    deliveryMethod: 'nova_poshta'
  })

  useEffect(() => {
    fetch(`/api/lots/${id}`).then(r => r.json()).then(d => {
      setLot(d)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="py-20 text-center">Завантаження...</div>
  if (!lot) return <div className="py-20 text-center">Лот не знайдено</div>

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8">
      {/* Steps Header */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] ${step >= 1 ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9]'}`}>1</div>
          <span className="font-semibold text-[14px]">Доставка</span>
        </div>
        <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] ${step >= 2 ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9]'}`}>2</div>
          <span className="font-semibold text-[14px]">Оплата</span>
        </div>
        <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] ${step >= 3 ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9]'}`}>3</div>
          <span className="font-semibold text-[14px]">Готово</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <h2 className="text-[18px] font-bold text-[#0B1220] mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#2563EB]" /> Дані для доставки
              </h2>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">ПІБ отримувача</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <input 
                        type="text" 
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        className="w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] focus:border-[#2563EB] outline-none" 
                        placeholder="Прізвище Ім'я"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">Телефон</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] focus:border-[#2563EB] outline-none" 
                        placeholder="+380..."
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">Місто та відділення / адреса</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#94A3B8]" />
                    <textarea 
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] focus:border-[#2563EB] outline-none resize-none" 
                      placeholder="м. Київ, відділення №1..."
                    />
                  </div>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  disabled={!formData.fullName || !formData.phone || !formData.address}
                  className="w-full h-12 bg-[#2563EB] text-white rounded-xl font-bold hover:bg-[#1D4ED8] transition-all disabled:opacity-50"
                >
                  Перейти до оплати
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <h2 className="text-[18px] font-bold text-[#0B1220] mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#2563EB]" /> Оплата
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-[#F0FDF4] border border-[#10B981]/20 rounded-xl mb-6">
                  <div className="flex items-center gap-2 text-[#10B981] font-bold text-[14px] mb-1">
                    <ShieldCheck className="w-4 h-4" /> Безпечна угода активована
                  </div>
                  <p className="text-[12px] text-[#047857]">
                    Кошти будуть зарезервовані на транзитному рахунку KRAM і передані продавцю тільки після того, як ви отримаєте товар.
                  </p>
                </div>

                <div className="border border-[#2563EB] bg-[#EFF6FF] p-4 rounded-xl flex items-center gap-4 cursor-pointer">
                  <div className="w-5 h-5 border-2 border-[#2563EB] rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-[#2563EB] rounded-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-[#0F172A]">Оплата картою онлайн</p>
                    <p className="text-[12px] text-[#64748B]">Visa, Mastercard, Apple Pay, Google Pay</p>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-white border border-[#E2E8F0] rounded shadow-xs" />
                    <div className="w-8 h-5 bg-white border border-[#E2E8F0] rounded shadow-xs" />
                  </div>
                </div>

                <button 
                  onClick={() => setStep(3)}
                  className="w-full h-12 bg-[#2563EB] text-white rounded-xl font-bold hover:bg-[#1D4ED8] transition-all"
                >
                  Оплатити {formatPrice(lot.currentPrice)}
                </button>
                <button onClick={() => setStep(1)} className="w-full text-[13px] font-semibold text-[#64748B] hover:text-[#0F172A]">Повернутись до доставки</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center shadow-sm animate-fade-in">
              <div className="w-20 h-20 bg-[#ECFDF5] text-[#10B981] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-[24px] font-bold text-[#0B1220] mb-2">Замовлення оформлено!</h2>
              <p className="text-[14px] text-[#64748B] mb-8 max-w-[360px] mx-auto">
                Дякуємо за покупку. Ми повідомили продавця про ваше замовлення. Ви можете відстежувати статус у кабінеті.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => router.push('/cabinet')} className="h-11 px-6 bg-[#2563EB] text-white rounded-xl font-bold">У кабінет</button>
                <button onClick={() => router.push('/')} className="h-11 px-6 bg-[#F1F5F9] text-[#0B1220] rounded-xl font-bold">На головну</button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Order Summary */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <h3 className="text-[15px] font-bold text-[#0B1220] mb-4">Ваше замовлення</h3>
            <div className="flex gap-3 mb-4 pb-4 border-b border-[#F1F5F9]">
              <div className="w-16 h-16 bg-[#F8FAFC] rounded-lg overflow-hidden flex-shrink-0">
                {JSON.parse(lot.images || '[]')[0] && <img src={JSON.parse(lot.images || '[]')[0]} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#0F172A] line-clamp-2 leading-tight mb-1">{lot.title}</p>
                <p className="text-[11px] text-[#64748B]">Продавець: {lot.seller.name}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#64748B]">Вартість лота</span>
                <span className="font-semibold text-[#0F172A]">{formatPrice(lot.currentPrice)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#64748B]">Доставка</span>
                <span className="text-[#10B981] font-medium">За тарифами перевізника</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#64748B]">Комісія сервісу</span>
                <span className="text-[#10B981] font-medium">0 ₴</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#E2E8F0]">
              <span className="text-[15px] font-bold text-[#0B1220]">Разом</span>
              <span className="text-[20px] font-black text-[#2563EB]">{formatPrice(lot.currentPrice)}</span>
            </div>
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
              <div>
                <p className="text-[12px] font-bold text-[#0F172A] mb-0.5">KRAM Protection</p>
                <p className="text-[11px] text-[#64748B] leading-normal">
                  Ваші покупки захищені. Ми гарантуємо повернення коштів, якщо товар не відповідає опису.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckCircle(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}
