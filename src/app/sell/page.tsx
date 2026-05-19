'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Camera, ChevronRight, X, Upload, CheckCircle, AlertCircle, Sparkles, Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { compressImageForUpload } from '@/lib/image-compression'

const CATEGORIES = [
  { name: 'Електроніка', slug: 'electronics' },
  { name: 'Телефони', slug: 'phones' },
  { name: 'Ноутбуки та ПК', slug: 'laptops' },
  { name: 'Авто', slug: 'auto' },
  { name: 'Одяг', slug: 'fashion' },
  { name: 'Дім', slug: 'home' },
  { name: 'Дитячі товари', slug: 'kids' },
  { name: 'Спорт', slug: 'sport' },
  { name: 'Книги', slug: 'books' },
  { name: 'Інструменти', slug: 'tools' },
  { name: 'Ігри', slug: 'games' },
  { name: 'Колекції', slug: 'collections' },
]

const CONDITIONS = [
  { value: 'new', label: 'Новий', desc: 'В упаковці, не використовувався' },
  { value: 'like_new', label: 'Як новий', desc: 'Використовувався декілька разів' },
  { value: 'used', label: 'Вживаний', desc: 'Є сліди використання' },
  { value: 'for_parts', label: 'На запчастини', desc: 'Несправний або пошкоджений' },
]

const DURATIONS = [
  { value: '1', label: '1 день' },
  { value: '3', label: '3 дні' },
  { value: '5', label: '5 днів' },
  { value: '7', label: '7 днів' },
]

export default function SellPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiHint, setAiHint] = useState('')
  const [aiTips, setAiTips] = useState<string[]>([])
  const [error, setError] = useState('')

  const [images, setImages] = useState<string[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    condition: 'used',
    city: '',
    startPrice: '',
    minIncrement: '50',
    buyNowPrice: '',
    reservePrice: '',
    duration: '7',
    delivery: 'nova_poshta',
    featured: false,
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function runAiAssist() {
    if (!form.title || form.title.length < 4) {
      setError('Спочатку введіть назву лота (мінімум 4 символи)')
      return
    }
    setAiLoading(true)
    setAiHint('')
    setAiTips([])
    setError('')
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, condition: form.condition, description: form.description })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      setForm(prev => ({
        ...prev,
        categoryId: data.category.name,
        description: prev.description.length > 10 ? prev.description : data.description,
        startPrice: prev.startPrice || String(data.price.suggestedStart),
        buyNowPrice: prev.buyNowPrice || String(data.price.suggestedBuyNow),
      }))

      const icon = data.price.confidence === 'high' ? '🎯' : data.price.confidence === 'medium' ? '📊' : '💡'
      const src = data.source === 'deepseek' ? ' • AI' : ''
      setAiHint(`${icon} ${data.category.name} • ${data.price.hint} • Старт: ${data.price.suggestedStart.toLocaleString('uk-UA')} ₴${src}`)
      if (data.tips?.length) setAiTips(data.tips)
    } catch {
      setError('Помилка AI-асистента')
    } finally {
      setAiLoading(false)
    }
  }


  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    if (images.length + files.length > 8) {
      setError('Максимум 8 фото')
      return
    }

    // Show previews immediately
    const previews = files.map(f => URL.createObjectURL(f))
    setImagePreviews(prev => [...prev, ...previews])
    setUploadingPhotos(true)
    setError('')

    const uploadedUrls: string[] = []
    let hasFailed = false

    try {
      // Upload files individually to prevent body limit errors (e.g. 413 Payload Too Large)
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          setError('Дозволені тільки фото JPEG, PNG або WebP')
          hasFailed = true
          break
        }

        let uploadFile = file
        try {
          uploadFile = await compressImageForUpload(file)
        } catch {
          // If compression fails, continue with the original file and let server validation respond.
        }

        if (uploadFile.size > 4 * 1024 * 1024) {
          setError(`Фото ${file.name} завелике навіть після стиснення. Максимальний розмір — 4MB`)
          hasFailed = true
          break
        }
        const fd = new FormData()
        fd.append('files', uploadFile)

        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || `Помилка завантаження фото: ${file.name}`)
          hasFailed = true
          break
        }

        if (data.urls && data.urls.length > 0) {
          uploadedUrls.push(data.urls[0])
          // Incrementally add successfully uploaded image url to trigger reactive updates
          setImages(prev => [...prev, data.urls[0]])
        } else {
          setError(`Помилка завантаження фото: ${file.name}`)
          hasFailed = true
          break
        }
      }

      if (hasFailed) {
        // Remove the newly added previews that failed to upload
        setImagePreviews(prev => prev.slice(0, prev.length - (files.length - uploadedUrls.length)))
      }
    } catch {
      setError('Помилка з\'єднання при завантаженні фото')
      setImagePreviews(prev => prev.slice(0, prev.length - files.length))
    } finally {
      setUploadingPhotos(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  function validateStep1() {
    if (!form.title.trim() || form.title.length < 5) {
      setError('Назва повинна містити мінімум 5 символів')
      return false
    }
    if (!form.categoryId) {
      setError('Оберіть категорію')
      return false
    }
    if (!form.description.trim() || form.description.length < 20) {
      setError('Опис повинен містити мінімум 20 символів')
      return false
    }
    if (!form.city.trim()) {
      setError('Вкажіть місто')
      return false
    }
    setError('')
    return true
  }

  function validateStep2() {
    const price = Number(form.startPrice)
    if (!price || price < 1) {
      setError('Стартова ціна повинна бути більше 0')
      return false
    }
    const buyNow = Number(form.buyNowPrice)
    if (form.buyNowPrice && buyNow <= price) {
      setError('Ціна "Купити зараз" повинна бути більша за стартову')
      return false
    }
    const reserve = Number(form.reservePrice)
    if (form.reservePrice && reserve <= price) {
      setError('Резервна ціна повинна бути більша за стартову')
      return false
    }
    setError('')
    return true
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)

    try {
      const finalImages = images

      const res = await fetch('/api/lots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          startPrice: Number(form.startPrice),
          minIncrement: Number(form.minIncrement),
          buyNowPrice: form.buyNowPrice ? Number(form.buyNowPrice) : null,
          reservePrice: form.reservePrice ? Number(form.reservePrice) : null,
          duration: Number(form.duration),
          images: finalImages,
        })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Помилка створення лота')
        setLoading(false)
        return
      }

      // Hard redirect — guaranteed to work unlike router.push
      window.location.href = `/lot/${data.id}?published=1`
    } catch {
      setError("Помилка з'єднання з сервером")
      setLoading(false)
    }
  }


  // Redirect if not logged in
  if (status === 'unauthenticated') {
    return (
      <div className="max-w-[480px] mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-[#2563EB]" />
        </div>
        <h1 className="text-[22px] font-bold text-[#0B1220] mb-2">Увійдіть, щоб створити лот</h1>
        <p className="text-[14px] text-[#64748B] mb-6">Щоб опублікувати лот на KRAM, потрібен акаунт. Платформа фіксує лоти, ставки та повідомлення, а оплату сторони погоджують напряму.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/auth/login?callbackUrl=/sell" className="inline-flex items-center justify-center h-12 px-8 w-full sm:w-auto bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] transition-colors">
            Увійти
          </Link>
          <Link href="/catalog" className="inline-flex items-center justify-center h-12 px-8 w-full sm:w-auto bg-white border border-[#E2E8F0] text-[#0B1220] rounded-xl text-[15px] font-semibold hover:bg-[#F8FAFC] transition-colors">
            Переглянути каталог
          </Link>
        </div>
      </div>
    )
  }

  if (session?.user && !session.user.verified) {
    return (
      <div className="max-w-[480px] mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-[#FFFBEB] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#FDE68A]">
          <ShieldCheck className="w-8 h-8 text-[#F59E0B]" />
        </div>
        <h1 className="text-[22px] font-bold text-[#0B1220] mb-2">Верифікація продавця</h1>
        <p className="text-[14px] text-[#64748B] mb-6">З метою безпеки платформи KRAM, нові продавці повинні пройти швидку верифікацію номера телефону.</p>
        <Link href="/cabinet/verify?redirect=/sell" className="inline-flex items-center h-12 px-8 bg-[#F59E0B] text-white rounded-xl text-[15px] font-semibold hover:bg-[#D97706] transition-colors">
          Пройти верифікацію
        </Link>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="max-w-[480px] mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Camera className="w-8 h-8 text-[#2563EB]" />
        </div>
        <h1 className="text-[22px] font-bold text-[#0B1220] mb-2">Увійдіть, щоб створити лот</h1>
        <p className="text-[14px] text-[#64748B] mb-6">Щоб опублікувати лот на KRAM, потрібен акаунт. Платформа фіксує лоти, ставки та повідомлення, а оплату сторони погоджують напряму.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/auth/login?callbackUrl=/sell" className="inline-flex items-center justify-center h-12 px-8 w-full sm:w-auto bg-[#2563EB]/80 text-white rounded-xl text-[15px] font-semibold transition-colors pointer-events-none opacity-80">
            Увійти
          </Link>
          <Link href="/catalog" className="inline-flex items-center justify-center h-12 px-8 w-full sm:w-auto bg-white border border-[#E2E8F0] text-[#0B1220] rounded-xl text-[15px] font-semibold transition-colors pointer-events-none opacity-80">
            Переглянути каталог
          </Link>
        </div>
      </div>
    )
  }

  const stepTitles = ['Основна інформація', 'Ціна та умови', 'Перевірка та публікація']

  return (
    <div className="max-w-[680px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-[#0B1220] tracking-tight">Створити лот</h1>
        <p className="text-[14px] text-[#64748B] mt-1">Крок {step} з 3 — {stepTitles[step - 1]}</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'}`} />
        ))}
      </div>

      {error && (
        <div className="mb-5 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[13px] text-[#EF4444] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ─── STEP 1: Info + Photos ─── */}
      {step === 1 && (
        <div className="space-y-5">
          {/* Photo upload */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
            <h2 className="text-[16px] font-bold text-[#0F172A] mb-1">Фотографії</h2>
            <p className="text-[12px] text-[#94A3B8] mb-4">До 8 фото. JPEG, PNG або WebP — фото з телефону автоматично стискаються до 4MB</p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#F1F5F9] group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {i >= images.length && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {i < images.length && (
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                  {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">ГОЛОВНЕ</span>}
                </div>
              ))}

              {imagePreviews.length < 8 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhotos}
                  className="aspect-square min-h-[96px] rounded-xl border-2 border-dashed border-[#CBD5E1] flex flex-col items-center justify-center gap-1 hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-all group disabled:opacity-50"
                >
                  <Upload className="w-5 h-5 text-[#94A3B8] group-hover:text-[#2563EB]" />
                  <span className="text-[10px] text-[#94A3B8] group-hover:text-[#2563EB]">Додати</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>

          {/* Basic info */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <h2 className="text-[16px] font-bold text-[#0F172A]">Основна інформація</h2>
              <button
                type="button"
                onClick={runAiAssist}
                disabled={aiLoading || !form.title}
                className="flex items-center justify-center gap-1.5 h-9 px-3 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white rounded-lg text-[12px] font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {aiLoading ? 'Аналізую...' : 'AI-підказка'}
              </button>
            </div>

            {aiHint && (
              <div className="mb-4 space-y-2">
                <div className="p-3 bg-gradient-to-r from-[#F5F3FF] to-[#EFF6FF] border border-[#7C3AED]/20 rounded-xl text-[12px] text-[#5B21B6] font-semibold">
                  {aiHint}
                </div>
                {aiTips.length > 0 && (
                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1">
                    <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">💬 Поради для кращого продажу</p>
                    {aiTips.map((tip, i) => (
                      <p key={i} className="text-[12px] text-[#0F172A]">· {tip}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">

              <div>
                <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">Назва лота *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => update('title', e.target.value)}
                  onBlur={() => { if (form.title.length >= 5 && !form.categoryId) runAiAssist() }}
                  placeholder="Наприклад: MacBook Air M2 256GB Midnight"
                  maxLength={120}
                  className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
                />
                <p className="text-[11px] text-[#94A3B8] mt-1">{form.title.length}/120 — введіть назву та AI автоматично визначить категорію</p>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">Категорія *</label>
                <select
                  value={form.categoryId}
                  onChange={e => update('categoryId', e.target.value)}
                  className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] focus:outline-none focus:border-[#2563EB] transition-all"
                >
                  <option value="">Оберіть категорію</option>
                  {CATEGORIES.map(c => (
                    <option key={c.slug} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0F172A] mb-2">Стан *</label>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITIONS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => update('condition', c.value)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        form.condition === c.value
                          ? 'bg-[#EFF6FF] border-[#2563EB]'
                          : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <p className={`text-[13px] font-semibold ${form.condition === c.value ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>{c.label}</p>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5">{c.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">Місто *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => update('city', e.target.value)}
                  placeholder="Київ, Харків, Одеса..."
                  className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">Опис *</label>
                <textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="Детальний опис: стан, комплектація, дефекти, причина продажу..."
                  rows={5}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all resize-none"
                />
                <p className="text-[11px] text-[#94A3B8] mt-1">{form.description.length} символів (мінімум 20)</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => { if (validateStep1()) setStep(2) }}
            className="w-full h-12 bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2"
          >
            Далі <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── STEP 2: Price ─── */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
            <h2 className="text-[16px] font-bold text-[#0F172A] mb-5">Ціна та умови аукціону</h2>
            <div className="space-y-4">

              <div>
                <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">Стартова ціна (₴) *</label>
                <input
                  type="number"
                  value={form.startPrice}
                  onChange={e => update('startPrice', e.target.value)}
                  placeholder="1"
                  min="1"
                  className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
                />
                {aiHint && (
                  <p className="text-[11px] text-[#7C3AED] mt-1 font-medium">✨ {aiHint.split('•')[1]?.trim()}</p>
                )}
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Порада: стартуйте з 30–50% від ринкової ціни — це залучить більше учасників</p>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">Мінімальний крок ставки (₴)</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {['10', '50', '100', '500'].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => update('minIncrement', v)}
                      className={`h-10 rounded-xl text-[13px] font-medium border transition-colors ${
                        form.minIncrement === v
                          ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                          : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                      }`}
                    >
                      {v} ₴
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">Резервна ціна (₴) — необов&apos;язково</label>
                <input
                  type="number"
                  value={form.reservePrice}
                  onChange={e => update('reservePrice', e.target.value)}
                  placeholder="Мінімум, за який ви згодні віддати лот"
                  className="w-full h-11 px-4 mb-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
                />

                <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">Ціна &ldquo;Купити зараз&rdquo; (₴) — необов&apos;язково</label>
                <input
                  type="number"
                  value={form.buyNowPrice}
                  onChange={e => update('buyNowPrice', e.target.value)}
                  placeholder="Залиште порожнім для чистого аукціону"
                  className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0F172A] mb-2">Тривалість аукціону</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {DURATIONS.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => update('duration', d.value)}
                      className={`h-10 rounded-xl text-[13px] font-medium border transition-colors ${
                        form.duration === d.value
                          ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                          : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0F172A] mb-2">Доставка</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'nova_poshta', label: 'Нова Пошта' },
                    { value: 'ukrposhta', label: 'Укрпошта' },
                    { value: 'pickup', label: 'Самовивіз' },
                    { value: 'both', label: 'Декілька варіантів' },
                  ].map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => update('delivery', d.value)}
                      className={`h-10 rounded-xl text-[13px] font-medium border transition-colors ${
                        form.delivery === d.value
                          ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                          : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => { setError(''); setStep(1) }} className="flex-1 h-12 border border-[#E2E8F0] rounded-xl text-[15px] font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
              Назад
            </button>
            <button
              onClick={() => { if (validateStep2()) setStep(3) }}
              className="flex-1 h-12 bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2"
            >
              Далі <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: Preview ─── */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
              <h2 className="text-[16px] font-bold text-[#0F172A]">Перевірте та опублікуйте</h2>
            </div>

            {/* Image preview */}
            {imagePreviews.length > 0 && (
              <div className="mb-5 aspect-[16/9] rounded-xl overflow-hidden bg-[#F1F5F9]">
                <img src={imagePreviews[0]} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-0">
              {[
                { label: 'Назва', value: form.title },
                { label: 'Категорія', value: form.categoryId },
                { label: 'Стан', value: CONDITIONS.find(c => c.value === form.condition)?.label },
                { label: 'Місто', value: form.city || '—' },
                { label: 'Стартова ціна', value: `${Number(form.startPrice).toLocaleString('uk-UA')} ₴` },
                { label: 'Крок ставки', value: `${form.minIncrement} ₴` },
                ...(form.reservePrice ? [{ label: 'Резервна ціна', value: `${Number(form.reservePrice).toLocaleString('uk-UA')} ₴` }] : []),
                ...(form.buyNowPrice ? [{ label: 'Купити зараз', value: `${Number(form.buyNowPrice).toLocaleString('uk-UA')} ₴` }] : []),
                { label: 'Тривалість', value: `${form.duration} ${Number(form.duration) === 1 ? 'день' : 'дні/днів'}` },
                { label: 'Доставка', value: form.delivery.replace('nova_poshta', 'Нова Пошта').replace('ukrposhta', 'Укрпошта').replace('pickup', 'Самовивіз').replace('both', 'Декілька варіантів') },
                { label: 'Фото', value: `${images.length} шт.${images.length === 0 ? ' (буде використано плейсхолдер)' : ''}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2.5 border-b border-[#F1F5F9] last:border-0">
                  <span className="text-[13px] text-[#64748B]">{row.label}</span>
                  <span className="text-[13px] font-semibold text-[#0F172A] text-right max-w-[55%]">{row.value}</span>
                </div>
              ))}
            </div>

            {/* VIP Toggle */}
            <div className="mt-5 p-4 rounded-xl border-2 border-dashed border-[#F59E0B] bg-[#FFFBEB] cursor-pointer hover:bg-[#FEF3C7] transition-colors flex items-center justify-between" onClick={() => setForm(prev => ({ ...prev, featured: !prev.featured }))}>
              <div>
                <p className="text-[14px] font-bold text-[#D97706] flex items-center gap-1.5">🔥 Зробити лот VIP</p>
                <p className="text-[11px] text-[#B45309] mt-0.5">Він буде відображатись на перших позиціях у каталозі</p>
              </div>
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${form.featured ? 'bg-[#F59E0B]' : 'bg-[#E2E8F0]'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${form.featured ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>

          {/* Trust note */}
          <div className="p-4 bg-[#ECFDF5] border border-[#10B981]/20 rounded-xl text-[12px] text-[#047857]">
            ✅ Публікуючи лот, ви погоджуєтесь з правилами платформи KRAM та підтверджуєте, що вся інформація є достовірною.
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => { setError(''); setStep(2) }} className="flex-1 h-12 border border-[#E2E8F0] rounded-xl text-[15px] font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
              Назад
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-12 bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Публікуємо...
                </>
              ) : '🚀 Опублікувати лот'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
