'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface BidModalProps {
  lotId: string
  currentPrice: number
  minIncrement: number
  lotTitle: string
  onClose: () => void
  onSuccess: (newPrice: number) => void
}

export function BidModal({ lotId, currentPrice, minIncrement, lotTitle, onClose, onSuccess }: BidModalProps) {
  const minBid = currentPrice + minIncrement
  const [amount, setAmount] = useState(minBid)
  const [isAuto, setIsAuto] = useState(false)
  const [autoMax, setAutoMax] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const quickBids = [
    { label: `+${minIncrement}`, value: currentPrice + minIncrement },
    { label: `+${minIncrement * 2}`, value: currentPrice + minIncrement * 2 },
    { label: `+${minIncrement * 5}`, value: currentPrice + minIncrement * 5 },
    { label: `+${minIncrement * 10}`, value: currentPrice + minIncrement * 10 },
  ]

  async function handleSubmit() {
    if (amount < minBid) {
      setError(`Мінімальна ставка: ${formatPrice(minBid)}`)
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          listingId: lotId, 
          amount,
          isAuto: isAuto && autoMax !== '',
          autoMax: isAuto && autoMax !== '' ? Number(autoMax) : null
        })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Помилка при створенні ставки')
        setLoading(false)
        return
      }

      onSuccess(amount)
    } catch {
      setError('Помилка зʼєднання з сервером')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-[420px] p-6 shadow-2xl animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC]">
          <X className="w-5 h-5 text-[#64748B]" />
        </button>

        <h2 className="text-[20px] font-bold text-[#0B1220] mb-1">Зробити ставку</h2>
        <p className="text-[13px] text-[#64748B] mb-6 line-clamp-1">{lotTitle}</p>

        {/* Current Price */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#94A3B8]">Поточна ціна</p>
              <p className="text-[20px] font-bold text-[#0F172A]">{formatPrice(currentPrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#94A3B8]">Мін. ставка</p>
              <p className="text-[16px] font-semibold text-[#2563EB]">{formatPrice(minBid)}</p>
            </div>
          </div>
        </div>

        {/* Quick Bids */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {quickBids.map((qb) => (
            <button
              key={qb.label}
              onClick={() => setAmount(qb.value)}
              className={`h-9 rounded-lg text-[12px] font-medium border transition-colors ${
                amount === qb.value
                  ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                  : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
              }`}
            >
              {qb.label}
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">Ваша ставка (₴)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={minBid}
            className="w-full h-12 px-4 bg-white border border-[#E2E8F0] rounded-xl text-[18px] font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
          />
        </div>

        {/* Auto-bid Toggle */}
        <div className="mb-5 p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={isAuto}
                onChange={(e) => setIsAuto(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] border-[#CBD5E1] rounded focus:ring-[#2563EB]"
              />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#0F172A]">Автоматична ставка (Снайпер)</p>
              <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                Система буде автоматично перебивати ставки інших учасників до вказаної вами суми.
              </p>
            </div>
          </label>

          {isAuto && (
            <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
              <label className="block text-[12px] font-medium text-[#0F172A] mb-1.5">Максимальна сума, яку ви готові дати (₴)</label>
              <input
                type="number"
                value={autoMax}
                onChange={(e) => setAutoMax(Number(e.target.value))}
                min={amount + minIncrement}
                placeholder="Наприклад: 5000"
                className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-lg text-[14px] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          )}
        </div>

        {error && <p className="text-[12px] text-[#EF4444] mb-3">{error}</p>}


        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || amount < minBid}
          className="w-full h-12 bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Обробка...' : `Підтвердити ставку ${formatPrice(amount)}`}
        </button>

        <p className="text-[11px] text-[#94A3B8] text-center mt-3">
          Натискаючи кнопку, ви погоджуєтесь з правилами торгів KRAM
        </p>
      </div>
    </div>
  )
}
