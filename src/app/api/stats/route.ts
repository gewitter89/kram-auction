import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicActiveListingWhere } from '@/lib/public-listing-filters'

export async function GET(request: Request) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [activeLots, totalUsers, bidsToday, categoryGroup] = await Promise.all([
      prisma.listing.count({ where: publicActiveListingWhere() }),
      prisma.user.count(),
      prisma.bid.count({ where: { createdAt: { gte: today } } }),
      prisma.listing.groupBy({
        by: ['categoryId'],
        _count: { id: true },
        where: publicActiveListingWhere()
      })
    ])

    const categoryStats = categoryGroup.reduce((acc, curr) => {
      acc[curr.categoryId] = curr._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({ activeLots, totalUsers, bidsToday, categoryStats })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ 
      activeLots: 0, 
      totalUsers: 0, 
      bidsToday: 0, 
      categoryStats: {} 
    }, { status: 200 })
  }
}
