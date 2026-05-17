'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { X, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function GlobalNotifier() {
  const { data: session } = useSession()
  const router = useRouter()
  const [alert, setAlert] = useState<{
    listingId: string
    lotTitle: string
    amount: number
    minIncrement: number
  } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!session?.user?.id) return

    let sse: EventSource | null = null
    let pollingFallback: NodeJS.Timeout | null = null

    function startSSE() {
      try {
        sse = new EventSource(`/api/events?channel=user_${session?.user?.id}`)
        sse.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data)
            if (data.type === 'outbid') {
              // Only trigger if we are not currently on that exact lot detail page to avoid duplicate modals!
              if (window.location.pathname === `/lot/${data.listingId}`) {
                return
              }

              setAlert({
                listingId: data.listingId,
                lotTitle: data.lotTitle,
                amount: data.amount,
                minIncrement: data.minIncrement,
              })

              // Play custom retro video game alert synth sound
              try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'triangle'
                osc.frequency.setValueAtTime(600, ctx.currentTime)
                osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15)
                gain.gain.setValueAtTime(0.08, ctx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start()
                osc.stop(ctx.currentTime + 0.3)
              } catch (err) {}
            }
          } catch (err) {}
        }

        sse.onerror = () => {
          if (sse) {
            sse.close()
            sse = null
          }
          // Retry after 5s
          pollingFallback = setTimeout(startSSE, 5000)
        }
      } catch (err) {
        pollingFallback = setTimeout(startSSE, 5000)
      }
    }

    startSSE()

    return () => {
      if (sse) sse.close()
      if (pollingFallback) clearTimeout(pollingFallback)
    }
  }, [session?.user?.id])

  async function handleRetaliate() {
    if (!alert || submitting) return
    setSubmitting(true)
    const nextBid = alert.amount + alert.minIncrement

    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: alert.listingId, amount: nextBid })
      })
      const data = await res.json()

      if (!res.ok) {
        // Fallback alert on fail
        const errorMsg = data.error || 'Помилка при ставці'
        setSuccessMsg(`❌ ${errorMsg}`)
        setSubmitting(false)
        setTimeout(() => {
          setSuccessMsg('')
          setAlert(null)
        }, 3000)
        return
      }

      // Success
      setSuccessMsg('⚔️ Реванш успішний! Ви знову лідер!')
      // Play retro win sound
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        osc.frequency.setValueAtTime(900, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.25)
      } catch (err) {}

      setTimeout(() => {
        setSuccessMsg('')
        setAlert(null)
        setSubmitting(false)
      }, 2500)

    } catch (err) {
      setSubmitting(false)
    }
  }

  if (successMsg && alert) {
    const isError = successMsg.startsWith('❌')
    return (
      <div className={`fixed bottom-24 right-4 z-50 max-w-[360px] w-full rounded-2xl p-4 shadow-2xl text-white animate-fade-in border ${
        isError ? 'bg-rose-600 border-rose-700/30' : 'bg-[#10B981] border-[#059669]/30'
      } md:bottom-6`}>
        <p className="font-bold text-[14px]">{successMsg}</p>
        <p className="text-[11px] opacity-90 truncate mt-0.5">{alert.lotTitle}</p>
      </div>
    )
  }

  if (!alert) return null

  return (
    <div className="fixed bottom-24 right-4 z-50 max-w-[360px] w-full bg-[#0F172A] border border-rose-500/30 rounded-2xl p-4 shadow-premium text-white animate-slide-in-right md:bottom-6">
      <button 
        onClick={() => setAlert(null)} 
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500 flex-shrink-0 animate-pulse text-[18px]">
          ⚔️
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[13px] text-rose-400">Вашу ставку перебито!</p>
          <p className="text-[12px] text-white/70 truncate mb-1">{alert.lotTitle}</p>
          <p className="text-[14px] font-bold mb-3">Нова ціна: {formatPrice(alert.amount)}</p>

          <div className="flex gap-2">
            <button
              onClick={handleRetaliate}
              disabled={submitting}
              className="flex-1 h-9 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-800 rounded-lg text-[12px] font-bold text-white transition-all flex items-center justify-center gap-1 hover:scale-[1.02]"
            >
              {submitting ? 'Реванш...' : `Реванш (+${alert.minIncrement} ₴)`}
            </button>
            <Link
              href={`/lot/${alert.listingId}`}
              onClick={() => setAlert(null)}
              className="h-9 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-[12px] font-semibold flex items-center justify-center transition-colors"
            >
              Переглянути
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
