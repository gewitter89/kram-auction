'use client'

import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'

export function DisputeModal({
  title = 'Відкрити спір',
  onClose,
  onSubmit,
}: {
  title?: string
  onClose: () => void
  onSubmit: (reason: string) => Promise<void>
}) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (reason.trim().length < 5) return
    setSubmitting(true)
    try {
      await onSubmit(reason.trim())
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="p-5 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#EF4444]" />
            <h2 className="text-[17px] font-bold text-[#0B1220]">{title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center">
            <X className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-[13px] text-[#64748B] leading-relaxed">
            Опишіть проблему коротко й по суті. KRAM не утримує кошти, але може перевірити історію домовленості, повідомлення, ТТН та обмежити порушника.
          </p>
          <textarea
            value={reason}
            onChange={event => setReason(event.target.value)}
            rows={5}
            placeholder="Наприклад: продавець не відповідає / товар не відповідає опису / не надано ТТН..."
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] resize-none focus:outline-none focus:border-[#EF4444]"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="h-10 px-4 rounded-xl border border-[#E2E8F0] text-[13px] font-semibold text-[#64748B] hover:bg-[#F8FAFC]">
              Скасувати
            </button>
            <button
              onClick={submit}
              disabled={submitting || reason.trim().length < 5}
              className="h-10 px-4 rounded-xl bg-[#EF4444] text-white text-[13px] font-bold hover:bg-[#DC2626] disabled:opacity-50"
            >
              {submitting ? 'Надсилання...' : 'Відкрити спір'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
