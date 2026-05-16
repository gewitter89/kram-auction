import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { eventBus } from '@/lib/eventBus'

// This route is called by a cron job or manually to close expired auctions
// Protect with a secret token
export async function GET(request: NextRequest) {
  const token = request.headers.get('x-cron-secret') || request.nextUrl.searchParams.get('secret')

  // Allow local calls or valid token
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find all active listings where endsAt has passed
    const expired = await prisma.listing.findMany({
      where: {
        status: 'active',
        endsAt: { lte: new Date() }
      },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
          include: { user: { select: { id: true, name: true } } }
        },
        seller: { select: { id: true, name: true } }
      }
    })

    let closedCount = 0

    for (const listing of expired) {
      const winner = listing.bids[0]

      if (winner) {
        // Close as SOLD
        await prisma.listing.update({
          where: { id: listing.id },
          data: { status: 'sold' }
        })

        // Create transaction
        await prisma.transaction.create({
          data: {
            listingId: listing.id,
            buyerId: winner.userId,
            sellerId: listing.sellerId,
            amount: winner.amount,
            status: 'pending'
          }
        })

        // Notify winner
        await prisma.notification.create({
          data: {
            userId: winner.userId,
            type: 'won',
            title: '🎉 Ви виграли аукціон!',
            message: `Вітаємо! Ви виграли "${listing.title}" за ${winner.amount} ₴. Очікуйте контакту від продавця.`,
            listingId: listing.id
          }
        })

        // Notify seller
        await prisma.notification.create({
          data: {
            userId: listing.sellerId,
            type: 'sold',
            title: '💰 Ваш лот продано!',
            message: `"${listing.title}" продано за ${winner.amount} ₴. Покупець: ${winner.user.name}`,
            listingId: listing.id
          }
        })

        // Broadcast won event to global feed
        eventBus.emit('global', {
          type: 'won',
          name: listing.title,
          amount: `${winner.amount} ₴`,
          user: `${winner.user.name.slice(0, 4)}***`
        })
      } else {
        // No bids — close as ended (unsold)
        await prisma.listing.update({
          where: { id: listing.id },
          data: { status: 'ended' }
        })
      }

      closedCount++
    }

    return NextResponse.json({
      ok: true,
      closed: closedCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron close-auctions error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
