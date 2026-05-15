import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [activeLots, totalUsers, bidsToday, categoryGroup] = await Promise.all([
    prisma.listing.count({ where: { status: 'active' } }),
    prisma.user.count(),
    prisma.bid.count({ where: { createdAt: { gte: today } } }),
    prisma.listing.groupBy({
      by: ['categoryId'],
      _count: { id: true },
      where: { status: 'active' }
    })
  ])

  const categoryStats = categoryGroup.reduce((acc, curr) => {
    acc[curr.categoryId] = curr._count.id
    return acc
  }, {} as Record<string, number>)

  return NextResponse.json({ activeLots, totalUsers, bidsToday, categoryStats })
}
