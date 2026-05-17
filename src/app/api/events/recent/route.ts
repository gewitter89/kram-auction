import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 1. Fetch recent bids
    const recentBids = await prisma.bid.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        listing: { select: { title: true } },
        user: { select: { name: true } }
      }
    })

    // 2. Fetch recent sold listings (wins)
    const recentWins = await prisma.listing.findMany({
      where: { status: 'sold' },
      take: 4,
      orderBy: { endsAt: 'desc' },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
          include: { user: { select: { name: true } } }
        }
      }
    })

    // 3. Map to unified event structures
    const bidEvents = recentBids.map(b => ({
      type: 'bid',
      name: b.listing.title,
      amount: `+${b.amount.toLocaleString('uk-UA')} ₴`,
      user: `${b.user.name.slice(0, 4)}***`,
      time: b.createdAt
    }))

    const winEvents = recentWins.map(w => {
      const topBid = w.bids[0]
      return {
        type: 'won',
        name: w.title,
        amount: `${w.currentPrice.toLocaleString('uk-UA')} ₴`,
        user: topBid ? `${topBid.user.name.slice(0, 4)}***` : 'Користувач',
        time: w.endsAt
      }
    })

    // Combine and sort chronologically (newest first)
    const allEvents = [...bidEvents, ...winEvents]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6)

    return NextResponse.json({ events: allEvents }, { status: 200 })
  } catch (error) {
    console.error('Fetch recent events error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
