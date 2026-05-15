'use client'

import { useState } from 'react'
import { X, Star } from 'lucide-react'

interface ReviewModalProps {
  sellerId: string
  sellerName: string
  onClose: () => void
  onSuccess: () => void
}

export function ReviewModal({ sellerId, sellerName, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, rating, text })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Помилка')
        setLoading(false)
        return
      }
      onSuccess()
    } catch {
      setError('Помилка сервера')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl w-full max-w-[420px] p-6 shadow-2xl animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC]">
          <X className="w-5 h-5 text-[#64748B]" />
        </button>

        <h2 className="text-[20px] font-bold text-[#0B1220] mb-1">Залишити відгук</h2>
        <p className="text-[13px] text-[#64748B] mb-6">Продавець: {sellerName}</p>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star className={`w-8 h-8 ${star <= rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'fill-[#E2E8F0] text-[#E2E8F0]'}`} />
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">Ваш коментар (необов&apos;язково)</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Розкажіть про свій досвід покупки..."
            rows={4}
            className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all resize-none"
          />
        </div>

        {error && <p className="text-[12px] text-[#EF4444] mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] disabled:opacity-50 transition-all"
        >
          {loading ? 'Надсилання...' : 'Опублікувати відгук'}
        </button>
      </div>
    </div>
  )
}
