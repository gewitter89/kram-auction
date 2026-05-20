import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/getCurrentUser'
import { absoluteUrl } from '@/lib/site-url'

const ALLOWED = new Set(['close-auctions', 'ending-soon', 'daily-digest'])

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const { job, force } = await request.json().catch(() => ({}))
    if (!ALLOWED.has(job)) return NextResponse.json({ error: 'Unknown cron job' }, { status: 400 })
    if (!process.env.CRON_SECRET) return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })

    const res = await fetch(absoluteUrl(`/api/cron/${job}${job === 'daily-digest' && force ? '?force=1' : ''}`), {
      method: 'GET',
      headers: { 'x-cron-secret': process.env.CRON_SECRET }
    })
    const text = await res.text()
    let payload: any = text
    try { payload = JSON.parse(text) } catch {}

    return NextResponse.json({ ok: res.ok, status: res.status, job, result: payload }, { status: res.ok ? 200 : 502 })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('Run cron error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
