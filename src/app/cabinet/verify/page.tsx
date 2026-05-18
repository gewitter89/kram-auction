'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ShieldCheck, Phone, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function VerifyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, update } = useSession()
  const redirectUrl = searchParams?.get('redirect') || '/cabinet'

  // Steps: 1: Method Select, 3: Identity Verification (Diia or BankID or SMS), 4: Success
  const [step, setStep] = useState(1)
  const [method, setMethod] = useState<'diia' | 'bankid' | 'sms'>('diia')
  
  // Diia specific
  const [diiaStep, setDiiaStep] = useState(1) // 1: QR code, 2: Processing, 3: Completed
  const [verifyLoading, setVerifyLoading] = useState(false)

  // BankID specific
  const [selectedBank, setSelectedBank] = useState<'mono' | 'privat' | null>(null)
  const [bankLoginStep, setBankLoginStep] = useState(1) // 1: Select/Auth, 2: Code, 3: Completed
  const [bankPhone, setBankPhone] = useState('')

  // SMS Verification states
  const [phone, setPhone] = useState('+380')
  const [smsCode, setSmsCode] = useState('')
  const [error, setError] = useState('')

  if (session?.user?.verified) {
    return (
      <div className="max-w-[480px] mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 bg-[#ECFDF5] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#A7F3D0]">
          <CheckCircle className="w-8 h-8 text-[#10B981]" />
        </div>
        <h1 className="text-[22px] font-bold text-[#0B1220] mb-2">Акаунт верифіковано</h1>
        <p className="text-[14px] text-[#64748B] mb-6">Ви вже пройшли офіційну перевірку і можете вільно торгувати на KRAM.</p>
        <Link href={redirectUrl} className="inline-flex items-center h-12 px-8 bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] transition-colors">
          Продовжити
        </Link>
      </div>
    )
  }

  // Handle Free SMS Verification
  async function handleSendSmsCode() {
    if (phone.length < 13) {
      setError('Введіть номер у форматі +380XXXXXXXXX')
      return
    }
    setError('')
    setVerifyLoading(true)
    try {
      const res = await fetch('/api/user/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Помилка відправки SMS')
        setVerifyLoading(false)
        return
      }
      setVerifyLoading(false)
      setDiiaStep(2) // Reuse for SMS code step
    } catch {
      setError('Помилка сервера. Спробуйте пізніше.')
      setVerifyLoading(false)
    }
  }

  async function handleVerifySms() {
    if (smsCode.length < 4) {
      setError('Введіть 4-значний код')
      return
    }
    setError('')
    setVerifyLoading(true)
    try {
      const res = await fetch('/api/user/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: smsCode })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Помилка верифікації')
        setVerifyLoading(false)
        return
      }
      await update({ verified: true })
      setStep(4)
    } catch {
      setError('Помилка сервера')
      setVerifyLoading(false)
    }
  }

  // Complete Premium Verification (Diia / BankID)
  const completePremiumVerification = async () => {
    setVerifyLoading(true)
    try {
      const res = await fetch('/api/user/verify/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method })
      })
      if (res.ok) {
        await update({ verified: true })
        setStep(4)
      } else {
        setError('Помилка оновлення статусу верифікації')
      }
    } catch {
      setError('Помилка сервера')
    } finally {
      setVerifyLoading(false)
    }
  }

  return (
    <div className="max-w-[540px] mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href={redirectUrl} className="inline-flex items-center gap-2 text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад
        </Link>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        
        {/* Step 1: Select Verification Method */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-amber-500" />
              </div>
              <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">Верифікація акаунту</h1>
              <p className="text-[14px] text-[#64748B] mt-1">Оберіть спосіб перевірки особи для захисту угод та підвищення довіри.</p>
            </div>

            <div className="space-y-3">
              {/* Option 1: Diia */}
              <div 
                onClick={() => setMethod('diia')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 hover:border-amber-500/50 ${
                  method === 'diia' ? 'border-amber-500 bg-amber-500/[0.02]' : 'border-[#E2E8F0] bg-white'
                }`}
              >
                <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center font-black text-[13px] text-white flex-shrink-0">
                  Дія
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[14px] text-[#0F172A]">Дія.Підпис (Рекомендовано)</p>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Безкоштовно</span>
                  </div>
                  <p className="text-[12px] text-[#64748B] mt-0.5">Отримайте золотий щит довіри 🛡️ та пріоритет лотів. Оплачує KRAM.</p>
                </div>
              </div>

              {/* Option 2: BankID */}
              <div 
                onClick={() => setMethod('bankid')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 hover:border-amber-500/50 ${
                  method === 'bankid' ? 'border-amber-500 bg-amber-500/[0.02]' : 'border-[#E2E8F0] bg-white'
                }`}
              >
                <div className="w-11 h-11 bg-[#EFF6FF] rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                  🏦
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[14px] text-[#0F172A]">Швидко через BankID</p>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Безкоштовно</span>
                  </div>
                  <p className="text-[12px] text-[#64748B] mt-0.5">Перевірка через Приват24, Монобанк або інші банки. Оплачує KRAM.</p>
                </div>
              </div>

              {/* Option 3: SMS */}
              <div 
                onClick={() => setMethod('sms')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 hover:border-[#CBD5E1] ${
                  method === 'sms' ? 'border-[#0F172A] bg-slate-50' : 'border-[#E2E8F0] bg-white'
                }`}
              >
                <div className="w-11 h-11 bg-[#F1F5F9] rounded-xl flex items-center justify-center flex-shrink-0 text-[#64748B]">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[14px] text-[#0F172A]">Базова SMS верифікація</p>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Безкоштовно</span>
                  </div>
                  <p className="text-[12px] text-[#64748B] mt-0.5">Звичайне підтвердження номеру телефону без значка перевіреного продавця.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setStep(3) // Bypasses the dead payment step, going straight to identity verification
              }}
              className="w-full h-12 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-xl text-[14px] font-bold transition-all shadow-md shadow-[#2563EB]/10 flex items-center justify-center gap-2"
            >
              Продовжити
            </button>
          </div>
        )}

        {/* Step 3: Identity Verification Screen */}
        {step === 3 && (
          <div className="space-y-6">
            {/* DIIA FLOW */}
            {method === 'diia' && (
              <div className="text-center space-y-6">
                <div>
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center font-black text-[14px] text-white mx-auto mb-3 shadow-md shadow-black/10">
                    Дія
                  </div>
                  <h2 className="text-[18px] font-bold text-[#0F172A]">Дія.Підпис Ідентифікація</h2>
                  <p className="text-[12.5px] text-[#64748B] max-w-[340px] mx-auto mt-1">
                    Відскануйте QR-код нижче через сканер у правому верхньому кутку застосунку Дія.
                  </p>
                </div>

                {diiaStep === 1 && (
                  <div className="space-y-5 animate-fade-in">
                    {/* Simulated QR Code with Scan Pulse Effect */}
                    <div className="relative w-44 h-44 bg-[#F8FAFC] border-2 border-slate-200 rounded-3xl mx-auto flex items-center justify-center overflow-hidden shadow-inner group">
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-500 animate-bounce shadow-md shadow-amber-500/80 z-20" style={{ animationDuration: '3s' }} />
                      
                      {/* Realistic looking mock QR code grid */}
                      <div className="w-36 h-36 opacity-90 relative">
                        {/* QR Corners */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-4 border-black rounded-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-4 border-black rounded-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-4 border-black rounded-lg" />
                        
                        {/* Inner dots */}
                        <div className="absolute top-[9px] left-[9px] w-3.5 h-3.5 bg-black rounded-xs" />
                        <div className="absolute top-[9px] right-[9px] w-3.5 h-3.5 bg-black rounded-xs" />
                        <div className="absolute bottom-[9px] left-[9px] w-3.5 h-3.5 bg-black rounded-xs" />

                        {/* Random mock QR lines */}
                        <div className="absolute top-12 left-2 w-32 h-16 flex flex-wrap gap-1 opacity-70">
                          {Array.from({ length: 48 }).map((_, idx) => (
                            <div 
                              key={idx} 
                              className={`w-2.5 h-2.5 rounded-2xs ${
                                (idx * 7) % 3 === 0 ? 'bg-black' : 'bg-transparent'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 max-w-sm mx-auto">
                      <button
                        onClick={async () => {
                          setDiiaStep(2)
                          setTimeout(() => {
                            setDiiaStep(3)
                          }, 2500)
                        }}
                        className="w-full h-11 bg-black text-white hover:bg-slate-900 rounded-xl text-[13px] font-bold transition-all shadow-md shadow-black/10 flex items-center justify-center gap-1.5"
                      >
                        Я підписав у застосунку Дія
                      </button>
                    </div>
                  </div>
                )}

                {diiaStep === 2 && (
                  <div className="py-8 flex flex-col items-center justify-center gap-4 animate-fade-in">
                    <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                    <div>
                      <p className="text-[14px] font-bold text-[#0F172A]">Перевірка Дія.Підпису...</p>
                      <p className="text-[12px] text-[#64748B] mt-0.5">Отримуємо захищені дані від Міністерства цифрової трансформації...</p>
                    </div>
                  </div>
                )}

                {diiaStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left max-w-md mx-auto">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-[13.5px] mb-1">
                        <CheckCircle className="w-4 h-4" /> Особу підтверджено
                      </div>
                      <div className="text-[12px] text-emerald-800 space-y-1 mt-2 font-medium">
                        <p>👤 <strong>ПІБ</strong>: Шевченко Андрій Миколайович</p>
                        <p>🪪 <strong>Документ</strong>: ID-картка громадянина України</p>
                        <p>🔒 <strong>Підпис</strong>: Дія.Підпис сертифіковано</p>
                      </div>
                    </div>

                    <button
                      onClick={completePremiumVerification}
                      disabled={verifyLoading}
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[14px] font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {verifyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Завершити верифікацію'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* BANKID FLOW */}
            {method === 'bankid' && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-3xl">🏦</span>
                  <h2 className="text-[18px] font-bold text-[#0F172A] mt-2">Ідентифікація через BankID</h2>
                  <p className="text-[12.5px] text-[#64748B] mt-1">Оберіть ваш обслуговуючий банк для безпечної автентифікації.</p>
                </div>

                {bankLoginStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        onClick={() => setSelectedBank('mono')}
                        className={`p-4 border-2 rounded-2xl cursor-pointer text-center hover:border-amber-500/50 transition-all ${
                          selectedBank === 'mono' ? 'border-amber-500 bg-amber-500/[0.02]' : 'border-[#E2E8F0]'
                        }`}
                      >
                        <span className="text-2xl block mb-1">🐱</span>
                        <span className="text-[13px] font-extrabold text-[#0F172A]">monobank</span>
                      </div>

                      <div 
                        onClick={() => setSelectedBank('privat')}
                        className={`p-4 border-2 rounded-2xl cursor-pointer text-center hover:border-amber-500/50 transition-all ${
                          selectedBank === 'privat' ? 'border-amber-500 bg-amber-500/[0.02]' : 'border-[#E2E8F0]'
                        }`}
                      >
                        <span className="text-2xl block mb-1">💚</span>
                        <span className="text-[13px] font-extrabold text-[#0F172A]">Приват24</span>
                      </div>
                    </div>

                    {selectedBank && (
                      <div className="pt-4 border-t border-slate-100 animate-fade-in space-y-4">
                        <div>
                          <label className="block text-[12.5px] font-semibold text-[#0F172A] mb-1.5">Фінансовий номер телефону</label>
                          <input 
                            type="tel"
                            value={bankPhone}
                            onChange={e => setBankPhone(e.target.value)}
                            placeholder="+380"
                            className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] font-semibold focus:border-[#2563EB] focus:bg-white transition-all outline-none"
                          />
                        </div>

                        <button
                          onClick={() => {
                            setBankLoginStep(2)
                            setTimeout(() => {
                              setBankLoginStep(3)
                            }, 2500)
                          }}
                          className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[14px] font-bold transition-all shadow-md shadow-amber-500/10 flex items-center justify-center"
                        >
                          Увійти через {selectedBank === 'mono' ? 'monobank' : 'Приват24'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {bankLoginStep === 2 && (
                  <div className="py-8 flex flex-col items-center justify-center gap-4 animate-fade-in">
                    <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                    <div>
                      <p className="text-[14px] font-bold text-[#0F172A]">Зв'язок з банком...</p>
                      <p className="text-[12px] text-[#64748B] mt-0.5">Очікуємо підтвердження авторизації у мобільному додатку банку...</p>
                    </div>
                  </div>
                )}

                {bankLoginStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left max-w-md mx-auto">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-[13.5px] mb-1">
                        <CheckCircle className="w-4 h-4" /> Банк підтвердив особу
                      </div>
                      <div className="text-[12px] text-emerald-800 space-y-1 mt-2 font-medium">
                        <p>👤 <strong>ПІБ</strong>: Коваленко Олександр Петрович</p>
                        <p>🏦 <strong>Банк-партнер</strong>: {selectedBank === 'mono' ? 'АТ «Універсал Банк» (monobank)' : 'АТ КБ «ПриватБанк»'}</p>
                        <p>🔒 <strong>Статус</strong>: Дані BankID успішно імпортовано</p>
                      </div>
                    </div>

                    <button
                      onClick={completePremiumVerification}
                      disabled={verifyLoading}
                      className="w-full h-12 bg-[#10B981] hover:bg-emerald-700 text-white rounded-xl text-[14px] font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {verifyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Завершити верифікацію'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* FREE SMS FLOW */}
            {method === 'sms' && (
              <div className="space-y-5 animate-fade-in">
                {diiaStep === 1 ? (
                  <>
                    <div>
                      <h2 className="text-[18px] font-bold text-[#0F172A]">Підтвердження номеру телефону</h2>
                      <p className="text-[13px] text-[#64748B] mt-1">Введіть ваш телефон для отримання 4-значного коду перевірки.</p>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[12.5px] text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-[12.5px] font-semibold text-[#0F172A] mb-1.5">Номер телефону</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                        <input
                           type="tel"
                           value={phone}
                           onChange={e => setPhone(e.target.value)}
                           placeholder="+380"
                           className="w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14.5px] font-semibold focus:border-[#2563EB] focus:bg-white outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSendSmsCode}
                      disabled={verifyLoading}
                      className="w-full h-12 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-xl text-[14px] font-bold transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      {verifyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Отримати SMS код'}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <h2 className="text-[18px] font-bold text-[#0F172A]">Введіть код з SMS</h2>
                      <p className="text-[13px] text-[#64748B] mt-1">Код надіслано на номер <strong className="text-[#0F172A]">{phone}</strong>.</p>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[12.5px] text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[12px] text-blue-800">
                      <b>Режим тестування:</b> введіть код <b>0000</b> для успішного входу.
                    </div>

                    <input
                      type="text"
                      value={smsCode}
                      onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="0000"
                      className="w-full h-14 text-center tracking-[0.5em] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[24px] font-black focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
                    />

                    <button
                      onClick={handleVerifySms}
                      disabled={verifyLoading || smsCode.length < 4}
                      className="w-full h-12 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-xl text-[14px] font-bold transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      {verifyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Підтвердити телефон'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Verification Success Screen */}
        {step === 4 && (
          <div className="text-center py-6 space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-2 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">Вітаємо! Успішна верифікація</h1>
              <p className="text-[13.5px] text-[#64748B] max-w-[380px] mx-auto mt-1.5">
                Ваш акаунт успішно підтверджено {method === 'diia' ? 'через Дія.Підпис 🛡️' : method === 'bankid' ? 'через BankID 🏦' : 'через SMS 💬'}. 
                {method !== 'sms' && ' Золотий бейдж довіри активовано у вашому профілі!'}
              </p>
            </div>

            <Link
              href={redirectUrl}
              className="inline-flex w-full h-12 items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[14.5px] font-bold transition-all"
            >
              Продовжити користування KRAM
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
        <p className="text-[14px] text-[#64748B] font-medium">Завантаження верифікації...</p>
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  )
}
