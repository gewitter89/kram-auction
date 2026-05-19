import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/getCurrentUser'
import { absoluteUrl } from '@/lib/site-url'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [users, activeLots, bidsToday, completedDeals, pendingReports, expiredActiveLots, lastCronRun, lastEndingSoonRun, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: 'active' } }),
      prisma.bid.count({ where: { createdAt: { gte: today } } }),
      prisma.listing.count({ where: { status: 'sold' } }),
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.listing.count({ where: { status: 'active', endsAt: { lte: new Date() } } }),
      prisma.auditLog.findFirst({
        where: { action: { in: ['CRON_CLOSE_AUCTIONS_SUCCESS', 'CRON_CLOSE_AUCTIONS_PARTIAL', 'CRON_CLOSE_AUCTIONS_FAILED'] } },
        orderBy: { createdAt: 'desc' },
        select: { action: true, metadata: true, createdAt: true }
      }),
      prisma.auditLog.findFirst({
        where: { action: { in: ['CRON_ENDING_SOON_SUCCESS', 'CRON_ENDING_SOON_PARTIAL', 'CRON_ENDING_SOON_FAILED'] } },
        orderBy: { createdAt: 'desc' },
        select: { action: true, metadata: true, createdAt: true }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true }
      })
    ])

    let cron = null
    if (lastCronRun) {
      try { cron = { action: lastCronRun.action, createdAt: lastCronRun.createdAt, ...(JSON.parse(lastCronRun.metadata || '{}')) } }
      catch { cron = { action: lastCronRun.action, createdAt: lastCronRun.createdAt } }
    }
    let endingSoonCron = null
    if (lastEndingSoonRun) {
      try { endingSoonCron = { action: lastEndingSoonRun.action, createdAt: lastEndingSoonRun.createdAt, ...(JSON.parse(lastEndingSoonRun.metadata || '{}')) } }
      catch { endingSoonCron = { action: lastEndingSoonRun.action, createdAt: lastEndingSoonRun.createdAt } }
    }

    return NextResponse.json({ users, activeLots, bidsToday, completedDeals, pendingReports, expiredActiveLots, lastCronRun: cron, lastEndingSoonRun: endingSoonCron, recentUsers })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}



const CRON_JOBS = new Set(['close-auctions', 'ending-soon'])

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const { action, job } = await request.json().catch(() => ({}))
    if (action !== 'runCron') return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    if (!CRON_JOBS.has(job)) return NextResponse.json({ error: 'Unknown cron job' }, { status: 400 })
    if (!process.env.CRON_SECRET) return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })

    const res = await fetch(absoluteUrl(`/api/cron/${job}`), {
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
    console.error('Admin stats cron runner error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
