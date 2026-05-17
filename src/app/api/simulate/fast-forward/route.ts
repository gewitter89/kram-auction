import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const { listingId } = await request.json()
    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 })
    }

    // 1. Update endsAt in DB to be 10 seconds in the past
    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        endsAt: new Date(Date.now() - 10000), // 10 seconds ago
        status: 'active' // Ensure it's active so cron processes it
      }
    })

    console.log(`[SIMULATE] Fast-forwarded listing ${listingId}. Set endsAt to 10s in the past.`)

    return NextResponse.json({
      success: true,
      message: `Listing ${listingId} fast-forwarded successfully. It is now expired in the past.`,
      endsAt: listing.endsAt.toISOString()
    })
  } catch (error: any) {
    console.error('Simulate fast-forward error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
