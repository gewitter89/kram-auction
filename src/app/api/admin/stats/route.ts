import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

export async function GET() {
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check admin
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user?.role !== 'admin' && user?.email !== 'admin@lotva.ua' && user?.email !== 'admin@kram.ua') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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
}
