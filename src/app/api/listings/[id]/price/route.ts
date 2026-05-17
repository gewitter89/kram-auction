import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const lot = await prisma.listing.findUnique({
      where: { id },
      select: {
        currentPrice: true,
        endsAt: true,
        status: true,
        bids: {
          orderBy: { createdAt: 'desc' },
          take: 8,
          include: { user: { select: { name: true } } }
        }
      }
    })

    if (!lot) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
    }

    return NextResponse.json({
      currentPrice: lot.currentPrice,
      endsAt: lot.endsAt.toISOString(),
      status: lot.status,
      bidCount: lot.bids.length,
      bids: lot.bids.map(b => ({
        id: b.id,
        amount: b.amount,
        createdAt: b.createdAt.toISOString(),
        user: { name: b.user.name }
      }))
    }, { status: 200 })
  } catch (error) {
    console.error('Fetch listing price error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
