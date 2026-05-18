import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ lots: [] })
    }

    const lots = await prisma.listing.findMany({
      where: {
        status: 'active',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ]
      },
      select: {
        id: true,
        title: true,
        currentPrice: true,
        images: true,
        endsAt: true,
        _count: {
          select: { bids: true }
        }
      },
      take: 6,
      orderBy: {
        featured: 'desc' // VIP listings first
      }
    })

    const formattedLots = lots.map(lot => {
      let imagesList: string[] = []
      try {
        imagesList = JSON.parse(lot.images || '[]')
      } catch {}

      return {
        id: lot.id,
        title: lot.title,
        currentPrice: lot.currentPrice,
        image: imagesList[0] || '',
        endsAt: lot.endsAt,
        bidsCount: lot._count?.bids || 0,
      }
    })

    return NextResponse.json({ lots: formattedLots })
  } catch (error) {
    console.error('Autocomplete search error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
