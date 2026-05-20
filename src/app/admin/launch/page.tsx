'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, XCircle, Rocket, Copy, Cloud, Mail, TimerReset, Database, ShieldCheck, ListChecks, Activity, Inbox, AlertTriangle } from 'lucide-react'

const REQUIRED_ENV = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'NEXT_PUBLIC_SITE_URL=https://kram-auction.vercel.app',
  'CRON_SECRET',
  'CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME',
  'NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=false',
  'EMAIL_FROM=KRAM <noreply@your-domain>',
  'SMTP_HOST / SMTP_USER / SMTP_PASS або GMAIL_USER / GMAIL_PASS',
]

export default function LaunchPage() {
  const [readiness, setReadiness] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testEmail, setTestEmail] = useState('')
  const [cronResult, setCronResult] = useState('')
  const [telegramResult, setTelegramResult] = useState('')

  async function load() {
    setLoading(true)
    const [r, s] = await Promise.all([
      fetch('/api/admin/readiness').then(res => res.ok ? res.json() : null),
      fetch('/api/admin/stats').then(res => res.ok ? res.json() : null),
    ])
    setReadiness(r)
    setStats(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function copyEnv() {
    await navigator.clipboard.writeText(REQUIRED_ENV.join('\n'))
  }


  async function runCron(job: 'close-auctions' | 'ending-soon') {
    setCronResult(`Запуск ${job}...`)
    const res = await fetch('/api/admin/cron', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job })
    })
    const data = await res.json()
    setCronResult(res.ok ? `${job}: ${JSON.stringify(data.result)}` : `${job}: ${data.error || 'Помилка'}`)
    await load()
  }


  async function postLatestToTelegram() {
    setTelegramResult('Публікуємо останні лоти...')
    const res = await fetch('/api/admin/telegram-channel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 5 })
    })
    const data = await res.json().catch(() => ({}))
    setTelegramResult(res.ok ? JSON.stringify(data.result) : (data.error || data.result?.reason || 'Telegram не налаштовано'))
  }

  async function sendTestEmail() {
    setTestEmail('Надсилання...')
    const res = await fetch('/api/admin/test-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    setTestEmail(res.ok ? 'Тестовий email відправлено або залоговано fallback-провайдером.' : ((await res.json()).error || 'Помилка email'))
  }

  if (loading) return <div className="max-w-[1320px] mx-auto px-4 py-8 text-[#64748B]">Завантаження launch checklist...</div>

  const checks = readiness?.checks || []
  const ready = checks.length > 0 && checks.every((c: any) => c.ok)

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="w-6 h-6 text-[#2563EB]" />
            <h1 className="text-[28px] font-black text-[#0B1220]">Launch Center</h1>
          </div>
          <p className="text-[14px] text-[#64748B] max-w-2xl">
            Єдиний центр перевірки перед публічним запуском KRAM: env, фото, пошта, cron, база, модерація та live QA.
          </p>
        </div>
        <Link href="/admin" className="h-10 px-4 inline-flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-semibold text-[#64748B] hover:bg-[#F8FAFC]">
          До адмінки
        </Link>
      </div>

      <div className={`mb-8 rounded-3xl border p-6 ${ready ? 'bg-[#ECFDF5] border-[#BBF7D0]' : 'bg-[#FFFBEB] border-[#FDE68A]'}`}>
        <div className="flex items-center gap-3">
          {ready ? <CheckCircle2 className="w-8 h-8 text-[#10B981]" /> : <XCircle className="w-8 h-8 text-[#D97706]" />}
          <div>
            <h2 className="text-[20px] font-black text-[#0B1220]">{ready ? 'Готово до controlled launch' : 'Ще є blockers перед запуском'}</h2>
            <p className="text-[13px] text-[#64748B]">{ready ? 'Усі критичні readiness-перевірки пройдено.' : 'Закрийте червоні/жовті пункти нижче перед публічним запуском.'}</p>
          </div>
        </div>
      </div>


      {stats && (
        <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-[18px] font-bold text-[#0B1220]">Daily launch health</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
            <HealthTile label="Нові користувачі 24h" value={stats.last24h?.users} />
            <HealthTile label="Нові лоти 24h" value={stats.last24h?.lots} />
            <HealthTile label="Ставки 24h" value={stats.last24h?.bids} />
            <HealthTile label="Повідомлення 24h" value={stats.last24h?.messages} />
            <HealthTile label="Угоди 24h" value={stats.last24h?.transactions} />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <QueueTile label="Скарги" value={stats.queues?.pendingReports} href="/admin/reports" danger={stats.queues?.pendingReports > 0} />
            <QueueTile label="Верифікації" value={stats.queues?.pendingVerificationRequests} href="/admin/verifications" danger={stats.queues?.pendingVerificationRequests > 0} />
            <QueueTile label="Лоти на модерації" value={stats.queues?.pendingReviewLots} href="/admin/lots" danger={stats.queues?.pendingReviewLots > 0} />
            <QueueTile label="Відкриті спори" value={stats.queues?.disputesOpen} href="/admin/disputes" danger={stats.queues?.disputesOpen > 0} />
            <QueueTile label="Прострочені лоти" value={stats.queues?.expiredActiveLots} href="/admin" danger={stats.queues?.expiredActiveLots > 0} />
            <QueueTile label="QA/Test users" value={stats.queues?.qaUsers} href="/admin/users" danger={stats.queues?.qaUsers > 0} />
          </div>
          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#E2E8F0] p-4 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#64748B]">Payments disabled</span>
              {stats.health?.paymentsDisabled ? <CheckCircle2 className="w-5 h-5 text-[#10B981]" /> : <AlertTriangle className="w-5 h-5 text-[#EF4444]" />}
            </div>
            <div className="rounded-2xl border border-[#E2E8F0] p-4 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#64748B]">Saved searches</span>
              <strong className="text-[#0B1220]">{stats.health?.savedSearchesActive ?? 0}</strong>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/admin/users" className="h-9 px-3 inline-flex items-center rounded-xl bg-[#FEF2F2] text-[#EF4444] text-[12px] font-bold border border-[#FECACA]">QA cleanup center</Link>
            <Link href="/admin/lots" className="h-9 px-3 inline-flex items-center rounded-xl bg-[#EFF6FF] text-[#2563EB] text-[12px] font-bold border border-[#BFDBFE]">Lot autopilot</Link>
            <Link href="/admin/reports" className="h-9 px-3 inline-flex items-center rounded-xl bg-white text-[#64748B] text-[12px] font-bold border border-[#E2E8F0]">Reports</Link>
            <Link href="/admin/disputes" className="h-9 px-3 inline-flex items-center rounded-xl bg-white text-[#64748B] text-[12px] font-bold border border-[#E2E8F0]">Disputes</Link>
          </div>
        </section>
      )}

      <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6 mb-8">
        <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-[18px] font-bold text-[#0B1220]">Readiness checks</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {checks.map((check: any) => (
              <div key={check.key} className="border border-[#E2E8F0] rounded-2xl p-4 flex items-start gap-3">
                {check.ok ? <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />}
                <div>
                  <p className="text-[13px] font-bold text-[#0F172A]">{check.label}</p>
                  {typeof check.value !== 'undefined' && <p className="text-[12px] text-[#64748B] mt-0.5">Значення: {check.value}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-[18px] font-bold text-[#0B1220]">Live stats</h2>
          </div>
          <div className="space-y-3 text-[13px]">
            <Stat label="Користувачі" value={stats?.users} />
            <Stat label="Активні лоти" value={stats?.activeLots} />
            <Stat label="Pending reports" value={stats?.pendingReports} />
            <Stat label="Expired active lots" value={stats?.expiredActiveLots} danger={stats?.expiredActiveLots > 0} />
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6">
          <Cloud className="w-7 h-7 text-[#2563EB] mb-3" />
          <h3 className="text-[16px] font-bold text-[#0B1220] mb-1">Telegram channel</h3>
          <p className="text-[13px] text-[#64748B] mb-4">Автопостинг нових лотів у канал, якщо задано TELEGRAM_CHANNEL_ID.</p>
          <button onClick={postLatestToTelegram} className="h-10 px-4 rounded-xl bg-[#2563EB] text-white text-[13px] font-bold">Post latest lots</button>
          {telegramResult && <p className="mt-3 text-[11px] text-[#64748B] break-words">{telegramResult}</p>}
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6">
          <TimerReset className="w-7 h-7 text-[#2563EB] mb-3" />
          <h3 className="text-[16px] font-bold text-[#0B1220] mb-1">Cron jobs</h3>
          <p className="text-[13px] text-[#64748B] mb-4">Ручний запуск cron без розкриття CRON_SECRET.</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => runCron('close-auctions')} className="h-10 px-4 rounded-xl bg-[#0B1220] text-white text-[13px] font-bold">Test close-auctions</button>
            <button onClick={() => runCron('ending-soon')} className="h-10 px-4 rounded-xl bg-[#EFF6FF] text-[#2563EB] text-[13px] font-bold border border-[#BFDBFE]">Test ending-soon</button>
          </div>
          {cronResult && <p className="mt-3 text-[11px] text-[#64748B] break-words">{cronResult}</p>}
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6">
          <Mail className="w-7 h-7 text-[#2563EB] mb-3" />
          <h3 className="text-[16px] font-bold text-[#0B1220] mb-1">Email</h3>
          <p className="text-[13px] text-[#64748B] mb-4">Перевірте SMTP/Gmail відправку.</p>
          <button onClick={sendTestEmail} className="h-10 px-4 rounded-xl bg-[#2563EB] text-white text-[13px] font-bold">Тест email</button>
          {testEmail && <p className="mt-3 text-[12px] text-[#64748B]">{testEmail}</p>}
        </div>
      </div>

      <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[18px] font-bold text-[#0B1220]">Required Vercel env</h2>
            <p className="text-[13px] text-[#64748B]">Скопіюйте цей список у Vercel Environment Variables.</p>
          </div>
          <button onClick={copyEnv} className="h-10 px-4 inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-bold text-[#0F172A]"><Copy className="w-4 h-4" />Copy</button>
        </div>
        <pre className="overflow-x-auto rounded-2xl bg-[#0B1220] p-4 text-[12px] text-white leading-relaxed">{REQUIRED_ENV.join('\n')}</pre>
      </section>
    </div>
  )
}

function Stat({ label, value, danger }: { label: string; value: any; danger?: boolean }) {
  return <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2"><span className="text-[#64748B]">{label}</span><strong className={danger ? 'text-[#EF4444]' : 'text-[#0F172A]'}>{value ?? '—'}</strong></div>
}

function ActionCard({ icon: Icon, title, text, href }: any) {
  return <Link href={href} className="bg-white border border-[#E2E8F0] rounded-3xl p-6 hover:border-[#2563EB]/40 transition-colors"><Icon className="w-7 h-7 text-[#2563EB] mb-3" /><h3 className="text-[16px] font-bold text-[#0B1220] mb-1">{title}</h3><p className="text-[13px] text-[#64748B]">{text}</p></Link>
}


function HealthTile({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#FAFBFD] p-4">
      <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wide">{label}</p>
      <p className="text-[26px] font-black text-[#0B1220] mt-1">{value ?? 0}</p>
    </div>
  )
}

function QueueTile({ label, value, href, danger }: { label: string; value: any; href: string; danger?: boolean }) {
  return (
    <Link href={href} className={`rounded-2xl border p-4 flex items-center justify-between ${danger ? 'border-[#FECACA] bg-[#FEF2F2]' : 'border-[#E2E8F0] bg-white'}`}>
      <div>
        <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-wide">{label}</p>
        <p className={`text-[24px] font-black mt-1 ${danger ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>{value ?? 0}</p>
      </div>
      <Inbox className={`w-5 h-5 ${danger ? 'text-[#EF4444]' : 'text-[#CBD5E1]'}`} />
    </Link>
  )
}
