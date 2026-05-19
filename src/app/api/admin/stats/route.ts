import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/getCurrentUser'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [users, activeLots, bidsToday, completedDeals, pendingReports, expiredActiveLots, lastCronRun, recentUsers] = await Promise.all([
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

    return NextResponse.json({ users, activeLots, bidsToday, completedDeals, pendingReports, expiredActiveLots, lastCronRun: cron, recentUsers })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

