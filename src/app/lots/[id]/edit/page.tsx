'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react'

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
  { value: 'new', label: 'Новий' },
  { value: 'like_new', label: 'Як новий' },
  { value: 'used', label: 'Вживаний' },
  { value: 'for_parts', label: 'На запчастини' },
]

export default function EditLotPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [imagesRaw, setImagesRaw] = useState('[]')
  const [form, setForm] = useState({
    title: '', description: '', categoryId: '', condition: 'used', city: '',
    startPrice: '', minIncrement: '50', buyNowPrice: '', reservePrice: '', duration: '7', delivery: 'nova_poshta', featured: false,
  })

  useEffect(() => {
    fetch(`/api/lots/${params.id}`)
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Не вдалося завантажити лот')
        let images = '[]'
        try { images = JSON.stringify(JSON.parse(data.images || '[]'), null, 2) } catch {}
        setImagesRaw(images)
        setForm({
          title: data.title || '',
          description: data.description || '',
          categoryId: data.category?.slug || data.category?.name || '',
          condition: data.condition || 'used',
          city: data.city || '',
          startPrice: String(data.startPrice || data.currentPrice || ''),
          minIncrement: String(data.minIncrement || '50'),
          buyNowPrice: data.buyNowPrice ? String(data.buyNowPrice) : '',
          reservePrice: data.reservePrice ? String(data.reservePrice) : '',
          duration: String(data.duration || '7'),
          delivery: data.delivery || 'nova_poshta',
          featured: Boolean(data.featured),
        })
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [params.id])

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    let images: string[] = []
    try { images = JSON.parse(imagesRaw || '[]') } catch { setError('Некоректний JSON у фото'); setSaving(false); return }
    if (!Array.isArray(images)) { setError('Фото мають бути JSON-масивом URL'); setSaving(false); return }

    const res = await fetch(`/api/lots/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        startPrice: Number(form.startPrice),
        minIncrement: Number(form.minIncrement),
        buyNowPrice: form.buyNowPrice ? Number(form.buyNowPrice) : null,
        reservePrice: form.reservePrice ? Number(form.reservePrice) : null,
        duration: Number(form.duration),
        images,
      })
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Помилка збереження'); return }
    setSuccess('Лот оновлено та повторно відправлено на модерацію.')
    setTimeout(() => router.push(`/lot/${params.id}`), 1200)
  }

  if (loading) return <div className="max-w-[720px] mx-auto px-4 py-12 text-[#64748B]">Завантаження...</div>

  return (
    <div className="max-w-[760px] mx-auto px-4 py-8">
      <Link href={`/lot/${params.id}`} className="inline-flex items-center gap-1.5 text-[14px] text-[#64748B] hover:text-[#0F172A] mb-6">
        <ArrowLeft className="w-4 h-4" /> Назад до лота
      </Link>
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm">
        <h1 className="text-[24px] font-bold text-[#0B1220] mb-2">Редагувати лот</h1>
        <p className="text-[14px] text-[#64748B] mb-6">Після збереження лот знову потрапить на модерацію.</p>

        {error && <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[13px] text-[#EF4444] flex gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
        {success && <div className="mb-4 p-3 bg-[#ECFDF5] border border-[#BBF7D0] rounded-xl text-[13px] text-[#047857] flex gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}

        <form onSubmit={submit} className="space-y-4">
          <Field label="Назва"><input value={form.title} onChange={e => update('title', e.target.value)} required minLength={5} maxLength={120} className="input" /></Field>
          <Field label="Категорія"><select value={form.categoryId} onChange={e => update('categoryId', e.target.value)} required className="input">{CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></Field>
          <Field label="Стан"><select value={form.condition} onChange={e => update('condition', e.target.value)} className="input">{CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></Field>
          <Field label="Місто"><input value={form.city} onChange={e => update('city', e.target.value)} required className="input" /></Field>
          <Field label="Опис"><textarea value={form.description} onChange={e => update('description', e.target.value)} required minLength={20} rows={5} className="input py-3 h-auto" /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Стартова ціна"><input type="number" value={form.startPrice} onChange={e => update('startPrice', e.target.value)} required min={1} className="input" /></Field>
            <Field label="Крок ставки"><input type="number" value={form.minIncrement} onChange={e => update('minIncrement', e.target.value)} min={1} className="input" /></Field>
            <Field label="Купити зараз"><input type="number" value={form.buyNowPrice} onChange={e => update('buyNowPrice', e.target.value)} className="input" /></Field>
            <Field label="Резервна ціна"><input type="number" value={form.reservePrice} onChange={e => update('reservePrice', e.target.value)} className="input" /></Field>
          </div>
          <Field label="Тривалість"><select value={form.duration} onChange={e => update('duration', e.target.value)} className="input"><option value="1">1 день</option><option value="3">3 дні</option><option value="5">5 днів</option><option value="7">7 днів</option></select></Field>
          <Field label="Фото URL JSON"><textarea value={imagesRaw} onChange={e => setImagesRaw(e.target.value)} rows={5} className="input py-3 h-auto font-mono text-[12px]" /></Field>
          <button disabled={saving} className="w-full h-12 bg-[#2563EB] text-white rounded-xl text-[15px] font-bold hover:bg-[#1D4ED8] disabled:opacity-60 flex items-center justify-center gap-2"><Save className="w-4 h-4" />{saving ? 'Збереження...' : 'Зберегти і надіслати на модерацію'}</button>
        </form>
      </div>
      <style jsx>{`.input{width:100%;height:44px;padding:0 14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;font-size:14px;outline:none}.input:focus{border-color:#2563EB;background:white}`}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">{label}</span>{children}</label>
}
