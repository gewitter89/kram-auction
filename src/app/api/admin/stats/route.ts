import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/getCurrentUser'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [users, activeLots, bidsToday, completedDeals, pendingReports, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: 'active' } }),
      prisma.bid.count({ where: { createdAt: { gte: today } } }),
      prisma.listing.count({ where: { status: 'sold' } }),
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true }
      })
    ])

    return NextResponse.json({ users, activeLots, bidsToday, completedDeals, pendingReports, recentUsers })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

