'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ExternalLink, Eye, Loader2, Share2, UploadCloud, XCircle } from 'lucide-react'

type PreviewResult = {
  ok: boolean
  olxUrl?: string
  sourceUrl?: string
  error?: string
  item?: {
    olxUrl: string
    sourceUrl?: string
    sourceLabel?: string
    provider?: string
    title: string
    price: number
    categoryName: string
    conditionLabel: string
    locationLabel: string
    photos: string[]
    startPrice: number
  }
}

type ImportResult = {
  ok?: boolean
  olxUrl: string
  sourceUrl?: string
  id?: string
  status?: string
  alreadyExists?: boolean
  error?: string
}

function urlsFromText(text: string) {
  return [...new Set(text.split(/\s+/).map(url => url.trim()).filter(Boolean))].slice(0, 10)
}

export function OlxImportBox() {
  const [olxText, setOlxText] = useState('')
  const [previewing, setPreviewing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [previews, setPreviews] = useState<PreviewResult[]>([])
  const [results, setResults] = useState<ImportResult[]>([])

  async function preview(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResults([])
    const urls = urlsFromText(olxText)
    if (urls.length === 0) {
      setError('Вставте хоча б одне OLX-посилання')
      return
    }
    setPreviewing(true)
    try {
      const res = await fetch('/api/lots/import-url/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/auth/login?callbackUrl=/sellers?importOlx=1'
          return
        }
        setError(data.error || 'Не вдалося прочитати OLX-посилання')
        return
      }
      setPreviews(data.results || [])
    } catch {
      setError('Помилка мережі. Спробуйте пізніше')
    } finally {
      setPreviewing(false)
    }
  }

  async function importAll() {
    const urls = previews.filter(item => item.ok && (item.item?.sourceUrl || item.item?.olxUrl)).map(item => item.item!.sourceUrl || item.item!.olxUrl)
    if (urls.length === 0) return
    setImporting(true)
    setError('')
    try {
      const res = await fetch('/api/lots/import-url/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/auth/login?callbackUrl=/sellers?importOlx=1'
          return
        }
        setError(data.error || 'Не вдалося імпортувати лоти')
        return
      }
      setResults(data.results || [])
    } catch {
      setError('Помилка мережі. Спробуйте пізніше')
    } finally {
      setImporting(false)
    }
  }

  const goodPreviews = previews.filter(item => item.ok && item.item)

  async function shareLot(id: string) {
    const url = `${window.location.origin}/lot/${id}`
    if (navigator.share) {
      try { await navigator.share({ title: 'Лот KRAM', url }); return } catch {}
    }
    await navigator.clipboard.writeText(url)
    setError('Посилання на лот скопійовано')
    setTimeout(() => setError(''), 2500)
  }

  function resetImport() {
    setOlxText('')
    setPreviews([])
    setResults([])
    setError('')
  }


  return (
    <section className="max-w-[900px] mx-auto px-4 pb-10 overflow-hidden">
      <div className="bg-[#0B1220] text-white rounded-[2rem] p-6 md:p-8 shadow-sm overflow-hidden">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
            <ExternalLink className="w-6 h-6 text-[#60A5FA]" />
          </div>
          <div>
            <h2 className="text-[22px] font-black tracking-tight mb-2">Імпорт лотів з маркетплейсів</h2>
            <p className="text-[13px] text-slate-300 leading-relaxed">
              Вставте одне або кілька посилань з OLX, Prom.ua або іншого сайту. KRAM покаже preview з ціною, фото й категорією; після підтвердження імпортує лоти. Для невідомих сайтів використаємо OpenGraph/schema.org дані, а ціну можна буде уточнити вручну.
            </p>
          </div>
        </div>

        <form onSubmit={preview} className="space-y-3">
          <textarea
            value={olxText}
            onChange={e => setOlxText(e.target.value)}
            placeholder={'https://www.olx.ua/d/uk/obyavlenie/...\nhttps://prom.ua/ua/p...\nhttps://example.com/product/...'}
            className="w-full min-h-[96px] max-h-[180px] p-4 bg-white/10 border border-white/15 rounded-xl text-[14px] text-white placeholder:text-slate-500 outline-none focus:border-[#60A5FA] resize-y break-all"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <button disabled={previewing} className="h-12 px-6 bg-white text-[#0B1220] rounded-xl text-[14px] font-black hover:bg-slate-100 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
              {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              {previewing ? 'Читаємо посилання...' : 'Показати preview'}
            </button>
            {goodPreviews.length > 0 && (
              <button type="button" onClick={importAll} disabled={importing} className="h-12 px-6 bg-[#2563EB] text-white rounded-xl text-[14px] font-black hover:bg-[#1D4ED8] disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {importing ? 'Імпортуємо...' : `Імпортувати ${goodPreviews.length}`}
              </button>
            )}
          </div>
          {error && <p className="text-[12px] text-red-300">{error}</p>}
          <p className="text-[11px] text-slate-500">Максимум 10 посилань за раз. Підтримка: OLX, Prom.ua, generic URL fallback. Потрібен вхід в акаунт.</p>
        </form>

        {previews.length > 0 && (
          <div className="mt-6 space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {previews.map((preview, index) => preview.ok && preview.item ? (
              <div key={preview.item.olxUrl} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex gap-3 min-w-0 overflow-hidden">
                <div className="w-20 h-20 rounded-xl bg-white/10 overflow-hidden shrink-0">
                  {preview.item.photos[0] && <img src={preview.item.photos[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="text-[13px] font-bold text-white line-clamp-2 break-words">{preview.item.title}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-slate-300">
                    <span className="px-2 py-0.5 bg-[#2563EB]/30 rounded-full">{preview.item.sourceLabel || 'Marketplace'}</span>
                    <span className="px-2 py-0.5 bg-white/10 rounded-full">{preview.item.categoryName}</span>
                    <span className="px-2 py-0.5 bg-white/10 rounded-full">{preview.item.conditionLabel}</span>
                    <span className="px-2 py-0.5 bg-white/10 rounded-full">{preview.item.locationLabel}</span>
                  </div>
                  <p className="mt-2 text-[13px] font-black text-[#93C5FD] break-words">{preview.item.price.toLocaleString('uk-UA')} ₴ · старт {preview.item.startPrice.toLocaleString('uk-UA')} ₴</p>
                </div>
              </div>
            ) : (
              <div key={`${preview.sourceUrl || preview.olxUrl}-${index}`} className="bg-red-500/10 border border-red-400/20 rounded-2xl p-3 flex items-start gap-2 text-[12px] text-red-200 min-w-0 overflow-hidden break-all">
                <XCircle className="w-4 h-4" /> {preview.sourceUrl || preview.olxUrl}: {preview.error}
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 mt-0.5" />
              <div>
                <p className="text-[14px] font-bold text-white">Імпорт завершено</p>
                <p className="text-[12px] text-emerald-100 mt-1">Перевірте статус кожного лота нижче. Для Prom.ua/generic імпорту радимо вручну перевірити ціну, категорію та опис перед активним просуванням.</p>
              </div>
            </div>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={`${result.sourceUrl || result.olxUrl}-${index}`} className="text-[12px] text-slate-200 flex items-center justify-between gap-3 border-t border-white/10 pt-2 min-w-0 overflow-hidden">
                  <span className="min-w-0 break-all line-clamp-2">{result.sourceUrl || result.olxUrl}</span>
                  {result.id ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/lot/${result.id}`} className="h-8 px-3 inline-flex items-center rounded-lg bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400/30 font-bold">Відкрити лот</Link>
                      <button onClick={() => shareLot(result.id!)} className="h-8 px-3 inline-flex items-center gap-1 rounded-lg bg-white/10 text-white hover:bg-white/15 font-bold"><Share2 className="w-3 h-3" /> Поділитися</button>
                    </div>
                  ) : <span className="text-red-200 shrink-0">{result.error}</span>}
                </div>
              ))}
            </div>
            <button onClick={resetImport} className="w-full h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[13px] font-bold">Імпортувати ще посилання</button>
          </div>
        )}
      </div>
    </section>
  )
}
