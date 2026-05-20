'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { ArrowRight, BadgeCheck, Bell, Camera, CheckCircle2, Gavel, ShieldCheck, Store, UploadCloud } from 'lucide-react'
import { OlxImportBox } from '@/components/sellers/OlxImportBox'

const launchCategories = ['РўРµР»РµС„РѕРЅРё', 'РќРѕСѓС‚Р±СѓРєРё', 'Р†РіСЂРѕРІС– РєРѕРЅСЃРѕР»С–', 'РђРєСЃРµСЃСѓР°СЂРё Apple', 'РљРѕРјРїР»РµРєС‚СѓСЋС‡С– РџРљ', 'Р¤РѕС‚Рѕ/РІС–РґРµРѕ']

export default function SellersPage() {
  const [form, setForm] = useState({ name: '', email: '', telegram: '', category: '', lotsCount: '', note: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.email.includes('@')) {
      setError('Р’РєР°Р¶С–С‚СЊ РєРѕСЂРµРєС‚РЅРёР№ email')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          type: 'seller',
          source: 'seller_launch_application',
          meta: form,
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'РќРµ РІРґР°Р»РѕСЃСЏ РІС–РґРїСЂР°РІРёС‚Рё Р·Р°СЏРІРєСѓ')
        return
      }
      setSubmitted(true)
    } catch {
      setError('РџРѕРјРёР»РєР° РјРµСЂРµР¶С–. РЎРїСЂРѕР±СѓР№С‚Рµ РїС–Р·РЅС–С€Рµ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-white">
        <div className="absolute inset-0 gradient-mesh opacity-60 pointer-events-none" />
        <div className="relative max-w-[1320px] mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 h-8 px-3.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-[12px] font-bold text-[#2563EB] mb-6">
              <Store className="w-4 h-4" /> РџРµСЂС€С– РїСЂРѕРґР°РІС†С– KRAM
            </div>
            <h1 className="text-[36px] md:text-[54px] font-black text-[#0B1220] tracking-[-0.04em] leading-[1.05] mb-6">
              Р—Р°РїСѓСЃС‚С–С‚СЊ СЃРІРѕС— Р»РѕС‚Рё Р· РїСЂРѕР·РѕСЂРёРјРё СЃС‚Р°РІРєР°РјРё Р±РµР· РєРѕРјС–СЃС–С—
            </h1>
            <p className="text-[16px] text-[#475569] leading-relaxed max-w-[620px] mb-8">
              KRAM Р·Р°СЂР°Р· Р·Р±РёСЂР°С” РїРµСЂС€РёС… РїСЂРѕРґР°РІС†С–РІ С‚РµС…РЅС–РєРё, РіР°РґР¶РµС‚С–РІ С‚Р° С–РіСЂРѕРІРёС… С‚РѕРІР°СЂС–РІ. РњРё РЅРµ РїСЂРёР№РјР°С”РјРѕ РѕРїР»Р°С‚Сѓ С– РЅРµ СѓС‚СЂРёРјСѓС”РјРѕ РєРѕС€С‚Рё вЂ” РїР»Р°С‚С„РѕСЂРјР° С„С–РєСЃСѓС” Р»РѕС‚, СЃС‚Р°РІРєРё, РїРµСЂРµРїРёСЃРєСѓ С‚Р° СЃС‚Р°С‚СѓСЃ РґРѕРјРѕРІР»РµРЅРѕСЃС‚С–.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <a href="#seller-application" className="h-12 px-7 bg-[#2563EB] text-white rounded-xl text-[14.5px] font-bold hover:bg-[#1D4ED8] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#2563EB]/15">
                РџРѕРґР°С‚Рё Р·Р°СЏРІРєСѓ РїСЂРѕРґР°РІС†СЏ <ArrowRight className="w-4 h-4" />
              </a>
              <Link href="/sell" className="h-12 px-7 bg-white text-[#0B1220] border border-[#E2E8F0] rounded-xl text-[14.5px] font-bold hover:bg-[#F8FAFC] transition-all flex items-center justify-center">
                РЎС‚РІРѕСЂРёС‚Рё Р»РѕС‚
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 max-w-2xl">
              <div className="p-4 bg-white border border-[#E2E8F0] rounded-2xl">
                <Gavel className="w-5 h-5 text-[#2563EB] mb-2" />
                <p className="text-[13px] font-bold text-[#0B1220]">РџСЂРѕР·РѕСЂР° С†С–РЅР°</p>
                <p className="text-[12px] text-[#64748B] mt-1">РџРѕРєСѓРїС†С– Р±Р°С‡Р°С‚СЊ С–СЃС‚РѕСЂС–СЋ СЃС‚Р°РІРѕРє С– РєСЂРѕРє С†С–РЅРё.</p>
              </div>
              <div className="p-4 bg-white border border-[#E2E8F0] rounded-2xl">
                <Bell className="w-5 h-5 text-[#F59E0B] mb-2" />
                <p className="text-[13px] font-bold text-[#0B1220]">Telegram-РєР°РЅР°Р»</p>
                <p className="text-[12px] text-[#64748B] mt-1">РџРµСЂС€С– Р»РѕС‚Рё РјРѕР¶РЅР° РїСЂРѕСЃСѓРІР°С‚Рё Сѓ СЃРїС–Р»СЊРЅРѕС‚С– KRAM.</p>
              </div>
              <div className="p-4 bg-white border border-[#E2E8F0] rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-[#10B981] mb-2" />
                <p className="text-[13px] font-bold text-[#0B1220]">0% РЅР° СЃС‚Р°СЂС‚С–</p>
                <p className="text-[12px] text-[#64748B] mt-1">Р‘РµР· РєРѕРјС–СЃС–С— Р·Р° РїСѓР±Р»С–РєР°С†С–СЋ С‚Р° СЃС‚Р°РІРєРё Сѓ beta.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0B1220] text-white rounded-[2rem] p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center">
                <BadgeCheck className="w-6 h-6 text-[#10B981]" />
              </div>
              <div>
                <p className="text-[15px] font-bold">Р©Рѕ РѕС‚СЂРёРјСѓС” РїРµСЂС€РёР№ РїСЂРѕРґР°РІРµС†СЊ</p>
                <p className="text-[12px] text-slate-400">Р¤РѕРєСѓСЃ РЅР° СЂРµР°Р»СЊРЅРёС… Р»РѕС‚Р°С…, РЅРµ demo-Р±Р°Р·С–</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                'РѕРєСЂРµРјР° СЃС‚РѕСЂС–РЅРєР° РїСЂРѕРґР°РІС†СЏ Р· С–СЃС‚РѕСЂС–С”СЋ Р»РѕС‚С–РІ',
                'РјРѕРґРµСЂР°С†С–СЏ РїРµСЂС€РѕРіРѕ Р»РѕС‚Р° РїРµСЂРµРґ РїСѓР±Р»С–РєР°С†С–С”СЋ',
                'РїРѕСЃРёР»Р°РЅРЅСЏ РЅР° Р»РѕС‚ РґР»СЏ Telegram/Instagram/OLX',
                'СЃС‚Р°С‚СѓСЃРё РґРѕРјРѕРІР»РµРЅРѕСЃС‚С–: СѓР·РіРѕРґР¶РµРЅРЅСЏ, РўРўРќ, РѕС‚СЂРёРјР°РЅРЅСЏ',
                'РІС–РґРіСѓРєРё С‚С–Р»СЊРєРё РїС–СЃР»СЏ Р·Р°РІРµСЂС€РµРЅРёС… РґРѕРјРѕРІР»РµРЅРѕСЃС‚РµР№',
              ].map(item => (
                <div key={item} className="flex items-start gap-3 text-[13px] text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-7 p-4 bg-white/5 border border-white/10 rounded-2xl text-[12px] text-slate-400 leading-relaxed">
              <strong className="text-white">Р’Р°Р¶Р»РёРІРѕ:</strong> KRAM РЅРµ РїСЂРёР№РјР°С” РїРµСЂРµРґРѕРїР»Р°С‚Рё Р№ РЅРµ РіР°СЂР°РЅС‚СѓС” РѕРїР»Р°С‚Сѓ. РњРё РґРѕРїРѕРјР°РіР°С”РјРѕ РїСЂРѕР·РѕСЂРѕ Р·Р°С„С–РєСЃСѓРІР°С‚Рё СЃС‚Р°РІРєСѓ, РґРѕРјРѕРІР»РµРЅС–СЃС‚СЊ С– РґРѕРєР°Р·Рё РїРµСЂРµРїРёСЃРєРё.
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1320px] mx-auto px-4 py-16 grid lg:grid-cols-[0.9fr_1.1fr] gap-10">
        <div>
          <div className="inline-flex items-center gap-2 h-7 px-3 bg-white border border-[#E2E8F0] rounded-full text-[11px] font-bold text-[#64748B] uppercase tracking-wide mb-4">
            <Camera className="w-3.5 h-3.5" /> РЇРєС–СЃС‚СЊ Р»РѕС‚Р°
          </div>
          <h2 className="text-[28px] md:text-[36px] font-black text-[#0B1220] tracking-tight mb-4">РЇРєС– Р»РѕС‚Рё РјРё С…РѕС‡РµРјРѕ Р±Р°С‡РёС‚Рё РїРµСЂС€РёРјРё</h2>
          <p className="text-[14px] text-[#64748B] leading-relaxed mb-6">
            РќР° СЃС‚Р°СЂС‚С– KRAM РєСЂР°С‰Рµ РјР°С‚Рё 20 СЂРµР°Р»СЊРЅРёС… СЃРёР»СЊРЅРёС… Р»РѕС‚С–РІ, РЅС–Р¶ 200 РІРёРїР°РґРєРѕРІРёС… РѕРіРѕР»РѕС€РµРЅСЊ. РўРѕРјСѓ РјРё С„РѕРєСѓСЃСѓС”РјРѕСЃСЊ РЅР° С‚РµС…РЅС–С†С–, РіР°РґР¶РµС‚Р°С… С‚Р° С–РіСЂРѕРІРёС… С‚РѕРІР°СЂР°С….
          </p>
          <div className="flex flex-wrap gap-2">
            {launchCategories.map(cat => (
              <span key={cat} className="h-8 px-3 bg-white border border-[#E2E8F0] rounded-full text-[12px] font-semibold text-[#475569]">{cat}</span>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ['2вЂ“8 СЂРµР°Р»СЊРЅРёС… С„РѕС‚Рѕ', 'Р¤РѕС‚Рѕ РјР°СЋС‚СЊ РїРѕРєР°Р·СѓРІР°С‚Рё СЃР°РјРµ РІР°С€ С‚РѕРІР°СЂ, РЅРµ С‚С–Р»СЊРєРё РєР°СЂС‚РёРЅРєСѓ Р· С–РЅС‚РµСЂРЅРµС‚Сѓ.'],
            ['Р§РµСЃРЅРёР№ РѕРїРёСЃ СЃС‚Р°РЅСѓ', 'РџРѕРґСЂСЏРїРёРЅРё, Р±Р°С‚Р°СЂРµСЏ, РєРѕРјРїР»РµРєС‚, РґРµС„РµРєС‚Рё вЂ” РєСЂР°С‰Рµ РЅР°РїРёСЃР°С‚Рё РѕРґСЂР°Р·Сѓ.'],
            ['РђРґРµРєРІР°С‚РЅР° СЃС‚Р°СЂС‚РѕРІР° С†С–РЅР°', 'Р—Р°РЅР°РґС‚Рѕ РЅРёР·СЊРєР° С†С–РЅР° РЅР° РґРѕСЂРѕРіРёР№ С‚РѕРІР°СЂ РІС–Рґ РЅРѕРІРѕРіРѕ РїСЂРѕРґР°РІС†СЏ РїС–РґРµ РЅР° РјРѕРґРµСЂР°С†С–СЋ.'],
            ['Р‘РµР· Р·РѕРІРЅС–С€РЅС–С… РѕРїР»Р°С‚', 'РќРµ РґРѕРґР°РІР°Р№С‚Рµ Сѓ РѕРїРёСЃ РєР°СЂС‚РєРё, РїР»Р°С‚С–Р¶РЅС– РїРѕСЃРёР»Р°РЅРЅСЏ Р°Р±Рѕ РїСЂРѕС…Р°РЅРЅСЏ РїСЂРѕ РїРµСЂРµРґРѕРїР»Р°С‚Сѓ.'],
          ].map(([title, desc]) => (
            <div key={title} className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
              <UploadCloud className="w-5 h-5 text-[#2563EB] mb-3" />
              <h3 className="text-[15px] font-bold text-[#0B1220] mb-2">{title}</h3>
              <p className="text-[13px] text-[#64748B] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>


      <OlxImportBox />

      <section id="seller-application" className="max-w-[900px] mx-auto px-4 pb-20">
        <div className="bg-white border border-[#E2E8F0] rounded-[2rem] p-6 md:p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-[#ECFDF5] rounded-3xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
              </div>
              <h2 className="text-[24px] font-black text-[#0B1220] mb-2">Р—Р°СЏРІРєСѓ РѕС‚СЂРёРјР°РЅРѕ</h2>
              <p className="text-[14px] text-[#64748B] max-w-md mx-auto">РњРё Р·Р±РµСЂРµР¶РµРјРѕ Р·Р°СЏРІРєСѓ РїСЂРѕРґР°РІС†СЏ С– РїРѕРІРµСЂРЅРµРјРѕСЃСЊ С–Р· РЅР°СЃС‚СѓРїРЅРёРјРё РєСЂРѕРєР°РјРё Р·Р°РїСѓСЃРєСѓ.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-[24px] font-black text-[#0B1220] mb-2">РџРѕРґР°С‚Рё Р·Р°СЏРІРєСѓ РїСЂРѕРґР°РІС†СЏ</h2>
                <p className="text-[14px] text-[#64748B]">Р РѕР·РєР°Р¶С–С‚СЊ, С‰Рѕ РІРё РїСЂРѕРґР°С”С‚Рµ. Р¦Рµ РґРѕРїРѕРјРѕР¶Рµ РЅР°Рј Р·Р°РїСѓСЃРєР°С‚Рё РїРµСЂС€С– РєР°С‚РµРіРѕСЂС–С— РЅРµ РїРѕСЂРѕР¶РЅС–РјРё.</p>
              </div>
              {error && <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[13px] text-[#EF4444]">{error}</div>}
              <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
                <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Р’Р°С€Рµ С–РјКјСЏ / РјР°РіР°Р·РёРЅ" className="h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB]" />
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="Email РґР»СЏ Р·РІКјСЏР·РєСѓ" className="h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB]" />
                <input value={form.telegram} onChange={e => update('telegram', e.target.value)} placeholder="Telegram / Instagram (РЅРµРѕР±РѕРІКјСЏР·РєРѕРІРѕ)" className="h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB]" />
                <input value={form.lotsCount} onChange={e => update('lotsCount', e.target.value)} placeholder="РЎРєС–Р»СЊРєРё Р»РѕС‚С–РІ РјРѕР¶РµС‚Рµ РґРѕРґР°С‚Рё?" className="h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB]" />
                <select value={form.category} onChange={e => update('category', e.target.value)} className="h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB]">
                  <option value="">Р©Рѕ РїСЂРѕРґР°С”С‚Рµ?</option>
                  {launchCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="other">Р†РЅС€Рµ</option>
                </select>
                <textarea value={form.note} onChange={e => update('note', e.target.value)} placeholder="РљРѕСЂРѕС‚РєРѕ РїСЂРѕ С‚РѕРІР°СЂРё / СѓРјРѕРІРё / РјС–СЃС‚Рѕ" className="md:col-span-2 min-h-[110px] p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB] resize-none" />
                <button disabled={loading} className="md:col-span-2 h-12 bg-[#2563EB] text-white rounded-xl text-[15px] font-bold hover:bg-[#1D4ED8] disabled:opacity-60 transition-all">
                  {loading ? 'РќР°РґСЃРёР»Р°С”РјРѕ...' : 'РќР°РґС–СЃР»Р°С‚Рё Р·Р°СЏРІРєСѓ'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

