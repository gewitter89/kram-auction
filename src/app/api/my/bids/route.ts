import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bids = await prisma.bid.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: {
        select: {
          id: true, title: true, images: true,
          currentPrice: true, status: true, endsAt: true,
          seller: { select: { name: true, rating: true } },
          _count: { select: { bids: true } }
        }
      }
    },
    distinct: ['listingId']
  })

  const result = bids.map(bid => ({
    ...bid,
    isWinning: bid.amount >= bid.listing.currentPrice,
  }))

  return NextResponse.json({ bids: result })
}
