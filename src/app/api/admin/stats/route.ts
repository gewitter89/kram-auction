import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/getCurrentUser'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const qaUserWhere = {
      NOT: { role: 'admin' },
      OR: [
        { email: { contains: 'qa', mode: 'insensitive' as const } },
        { email: { contains: 'test', mode: 'insensitive' as const } },
        { email: { contains: 'demo', mode: 'insensitive' as const } },
        { email: { endsWith: '@example.com', mode: 'insensitive' as const } },
        { email: { endsWith: '@test.com', mode: 'insensitive' as const } },
        { email: { endsWith: '@kram-test.com', mode: 'insensitive' as const } },
      ],
    }

    const [users, activeLots, bidsToday, completedDeals, pendingReports, expiredActiveLots, lastCronRun, lastEndingSoonRun, recentUsers, newUsers24h, newLots24h, bids24h, messages24h, transactions24h, pendingVerificationRequests, pendingReviewLots, disputesOpen, savedSearchesActive, paymentsDisabled, qaUsers] = await Promise.all([
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
      }),
      prisma.user.count({ where: { createdAt: { gte: last24h } } }),
      prisma.listing.count({ where: { createdAt: { gte: last24h } } }),
      prisma.bid.count({ where: { createdAt: { gte: last24h } } }),
      prisma.message.count({ where: { createdAt: { gte: last24h } } }),
      prisma.transaction.count({ where: { createdAt: { gte: last24h } } }),
      prisma.report.count({ where: { reason: 'seller_verification_request', status: 'pending' } }),
      prisma.listing.count({ where: { status: 'pending_review' } }),
      prisma.transaction.count({ where: { status: 'DISPUTED' } }),
      prisma.report.count({ where: { reason: 'saved_search', status: 'reviewed' } }),
      Promise.resolve(process.env.PAYMENTS_ENABLED !== 'true'),
      prisma.user.count({ where: qaUserWhere }),
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

    return NextResponse.json({
      users,
      activeLots,
      bidsToday,
      completedDeals,
      pendingReports,
      expiredActiveLots,
      lastCronRun: cron,
      lastEndingSoonRun: endingSoonCron,
      recentUsers,
      last24h: {
        users: newUsers24h,
        lots: newLots24h,
        bids: bids24h,
        messages: messages24h,
        transactions: transactions24h,
      },
      queues: {
        pendingReports,
        pendingVerificationRequests,
        pendingReviewLots,
        disputesOpen,
        expiredActiveLots,
        qaUsers,
      },
      health: {
        paymentsDisabled,
        savedSearchesActive,
      },
    })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

