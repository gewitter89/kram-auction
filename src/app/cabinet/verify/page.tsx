import Link from 'next/link'
import { ShieldCheck, Clock, ArrowLeft, User, LifeBuoy } from 'lucide-react'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export default async function VerifyPage({ searchParams }: { searchParams?: Promise<{ redirect?: string }> }) {
  const session = await auth()
  const params = searchParams ? await searchParams : {}
  const redirect = params?.redirect || '/sell'

  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, verified: true }
      })
    : null

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-12">
      <div className="max-w-[640px] mx-auto">
        <Link 
          href={user ? '/cabinet' : '/'} 
          className="inline-flex items-center gap-1.5 text-[14px] text-[#64748B] hover:text-[#0F172A] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {user ? 'До кабінету' : 'На головну'}
        </Link>

        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 md:p-10 shadow-sm">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-5">
            <ShieldCheck className="w-7 h-7 text-amber-500" />
          </div>
          
          <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight mb-3">
            Верифікація продавців
          </h1>
          
          <p className="text-[15px] text-[#64748B] leading-relaxed mb-6">
            KRAM використовує ручну/контактну перевірку продавця. Ми не показуємо позначку
            &quot;Підтверджено&quot;, якщо реальної перевірки ще не було.
          </p>

          {user ? (
            <>
              <div className={`p-4 border rounded-2xl mb-6 ${user.verified ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-black/5">
                    <User className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#0F172A]">{user.name || user.email}</p>
                    <p className={`text-[12px] font-semibold ${user.verified ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {user.verified ? 'Профіль продавця підтверджено' : 'Профіль ще очікує ручної перевірки'}
                    </p>
                  </div>
                </div>
              </div>

              {!user.verified && (
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl mb-6">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-[14px] font-semibold text-[#0F172A] mb-1">Як пройти перевірку</p>
                      <p className="text-[12px] text-[#64748B] leading-relaxed">
                        Напишіть у підтримку з email акаунта, містом, номером телефону та коротким описом товарів,
                        які плануєте продавати. Модератор перевірить профіль і вручну відкриє можливість публікації.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/support" 
                  className="inline-flex items-center justify-center gap-2 flex-1 h-12 bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] transition-colors"
                >
                  <LifeBuoy className="w-4 h-4" /> Написати в підтримку
                </Link>
                <Link 
                  href={user.verified ? redirect : '/cabinet'} 
                  className="inline-flex items-center justify-center flex-1 h-12 bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl text-[15px] font-semibold hover:bg-[#F8FAFC] transition-colors"
                >
                  {user.verified ? 'Продовжити' : 'До кабінету'}
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#0F172A]">Увійдіть, щоб відкрити налаштування верифікації</p>
                  </div>
                </div>
              </div>

              <Link 
                href="/auth/login?callbackUrl=/cabinet/verify" 
                className="inline-flex items-center justify-center w-full h-12 bg-[#2563EB] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1D4ED8] transition-colors"
              >
                Увійти
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
