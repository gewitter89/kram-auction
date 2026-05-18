'use client'

import { useState, useEffect } from 'react'
import { X, CreditCard, Lock, ShieldCheck, Loader2, CheckCircle2, Sparkles } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface MockPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  amount: number
  listingTitle: string
}

export function MockPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  listingTitle,
}: MockPaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form')
  const [processingStatus, setProcessingStatus] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = value.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '))
    } else {
      setCardNumber(value)
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (value.length >= 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`)
    } else {
      setExpiry(value)
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    setCvv(value.slice(0, 3))
  }

  const fillDemoData = () => {
    setCardNumber('4441 1144 5588 9922')
    setExpiry('12/29')
    setCvv('777')
    setCardholderName('DEMO USER')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Некоректний номер картки (має бути 16 цифр)')
      return
    }
    if (expiry.length < 5) {
      setError('Некоректний термін дії (формат ММ/РР)')
      return
    }
    if (cvv.length < 3) {
      setError('Некоректний код CVV (3 цифри)')
      return
    }
    if (!cardholderName.trim()) {
      setError("Вкажіть ім'я власника картки")
      return
    }

    setError(null)
    setPaymentStep('processing')

    const steps = [
      "Встановлення захищеного з'єднання SSL...",
      'Авторизація платежу в тестовому шлюзі KRAM Sandbox...',
      'Блокування коштів на безпечному Escrow-рахунку...',
      'Отримання успішного статусу транзакції...',
    ]

    for (let i = 0; i < steps.length; i++) {
      setProcessingStatus(steps[i])
      await new Promise((resolve) => setTimeout(resolve, 900))
    }

    setPaymentStep('success')
    await new Promise((resolve) => setTimeout(resolve, 1500))
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with premium glassmorphism */}
      <div 
        className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
        onClick={paymentStep === 'form' ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[500px] bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden z-10 transform transition-all duration-300 scale-100 animate-scaleUp">
        
        {/* Header (Only show close button during card entry) */}
        {paymentStep === 'form' && (
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Dynamic Content */}
        {paymentStep === 'form' && (
          <div className="p-6 md:p-8">
            {/* Header info */}
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/55 rounded-full text-[11px] font-semibold mb-3">
                <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                Тестовий режим (KRAM Safe Escrow)
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Безпечна оплата лоту</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-1 max-w-[340px] mx-auto">
                {listingTitle}
              </p>
              <div className="mt-4 inline-block px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Сума до сплати</span>
                <span className="text-2xl font-black text-slate-900">{formatPrice(amount)}</span>
              </div>
            </div>

            {/* Premium Interactive Visa/Mastercard representation */}
            <div className="relative h-44 w-full rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-5 shadow-lg overflow-hidden mb-6 flex flex-col justify-between">
              {/* Card glossy elements */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Secure Escrow Card</p>
                  <div className="w-10 h-7 bg-amber-200/90 rounded-md mt-2 flex items-center justify-center overflow-hidden border border-amber-300">
                    {/* Chip lines */}
                    <div className="grid grid-cols-3 gap-1 w-full h-full p-1 opacity-70">
                      <div className="border border-slate-800 rounded-sm"></div>
                      <div className="border border-slate-800 rounded-sm"></div>
                      <div className="border border-slate-800 rounded-sm"></div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black italic text-lg tracking-wide text-white/90">KRAM</span>
                  <span className="block text-[8px] text-emerald-400 font-bold uppercase tracking-wider">Secure Sandbox</span>
                </div>
              </div>

              {/* Card number display */}
              <div className="text-lg md:text-xl font-mono tracking-[0.2em] font-semibold my-2 text-slate-100 drop-shadow-md">
                {cardNumber || '•••• •••• •••• ••••'}
              </div>

              <div className="flex justify-between items-end">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-[8px] text-slate-400 uppercase tracking-wider">Власник</p>
                  <p className="text-xs font-mono font-semibold truncate tracking-wider uppercase text-slate-200">
                    {cardholderName || 'DEMO USER'}
                  </p>
                </div>
                <div className="flex gap-4 flex-shrink-0">
                  <div>
                    <p className="text-[8px] text-slate-400 uppercase tracking-wider">Діє до</p>
                    <p className="text-xs font-mono font-semibold text-slate-200">{expiry || 'MM/YY'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 uppercase tracking-wider">CVV</p>
                    <p className="text-xs font-mono font-semibold text-slate-200">{cvv ? '•••' : '000'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center gap-2 animate-shake">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0 animate-pulse" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Номер картки</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="4441 1144 5588 9922"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm"
                  />
                  <CreditCard className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Діє до</label>
                  <input
                    type="text"
                    required
                    placeholder="12/29"
                    maxLength={5}
                    value={expiry}
                    onChange={handleExpiryChange}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">CVV код</label>
                  <input
                    type="password"
                    required
                    placeholder="777"
                    maxLength={3}
                    value={cvv}
                    onChange={handleCvvChange}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-mono text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Ім'я на картці</label>
                <input
                  type="text"
                  required
                  placeholder="Ivan Ivanov"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 text-sm"
                >
                  <Lock className="w-4 h-4" />
                  Сплатити {formatPrice(amount)}
                </button>

                <div className="flex items-center justify-between mt-1 px-1">
                  <button
                    type="button"
                    onClick={fillDemoData}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors hover:underline"
                  >
                    ⚡ Заповнити демо-карту
                  </button>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Безпечний Sandbox
                  </span>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Processing Step */}
        {paymentStep === 'processing' && (
          <div className="p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[360px]">
            <div className="relative mb-6">
              {/* Double spinner */}
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-indigo-900" />
              </div>
            </div>
            <h4 className="text-lg font-bold text-slate-900">Обробка безпечного платежу</h4>
            <div className="mt-4 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl max-w-[340px]">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest animate-pulse">
                Транзакція Escrow
              </p>
              <p className="text-sm font-medium text-slate-600 mt-1 transition-all duration-300">
                {processingStatus}
              </p>
            </div>
            <p className="text-[11px] text-slate-400 mt-6 max-w-[280px]">
              Будь ласка, не закривайте це вікно. Платіж шифрується за стандартом PCI DSS.
            </p>
          </div>
        )}

        {/* Success Step */}
        {paymentStep === 'success' && (
          <div className="p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[360px] bg-gradient-to-b from-white via-white to-emerald-50/20">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-scaleUp shadow-inner border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-pulse" />
            </div>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">Платіж успішний!</h4>
            <p className="text-sm text-slate-500 mt-2 max-w-[300px]">
              Кошти успішно заблоковано на безпечному рахунку KRAM Escrow.
            </p>
            <div className="mt-6 px-5 py-3 bg-emerald-50 rounded-2xl border border-emerald-100/60 inline-flex flex-col items-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Сума транзакції</span>
              <span className="text-lg font-black text-slate-950 mt-0.5">{formatPrice(amount)}</span>
            </div>
            <p className="text-xs text-slate-400 mt-8">
              Повернення до вашого кабінету покупок...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
