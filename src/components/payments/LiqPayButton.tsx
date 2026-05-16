'use client'

import { useState } from 'react'
import { CreditCard, Loader2, AlertCircle } from 'lucide-react'

interface LiqPayButtonProps {
  transactionId: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function LiqPayButton({ transactionId, onSuccess, onError }: LiqPayButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/liqpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data.error || 'Помилка створення платежу'
        setError(errorMsg)
        onError?.(errorMsg)
        setLoading(false)
        return
      }

      // Create and submit LiqPay form
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = 'https://www.liqpay.ua/api/3/checkout'
      form.acceptCharset = 'utf-8'

      // Hidden input for data
      const dataInput = document.createElement('input')
      dataInput.type = 'hidden'
      dataInput.name = 'data'
      dataInput.value = data.formData.data
      form.appendChild(dataInput)

      // Hidden input for signature
      const sigInput = document.createElement('input')
      sigInput.type = 'hidden'
      sigInput.name = 'signature'
      sigInput.value = data.formData.signature
      form.appendChild(sigInput)

      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)

      onSuccess?.()
    } catch {
      const errorMsg = 'Помилка мережі. Спробуйте ще раз.'
      setError(errorMsg)
      onError?.(errorMsg)
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full h-11 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          Спробувати ще раз
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full h-11 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
      {loading ? 'Підготовка платежу...' : 'Сплатити через LiqPay'}
    </button>
  )
}
