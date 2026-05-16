import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { eventBus } from '@/lib/eventBus'
import { createTransactionFromAuctionWin } from '@/lib/transaction-service'

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
        try {
          // Create transaction using Safe Deal service with idempotency
          const idempotencyKey = `auction:${listing.id}:${winner.userId}:${new Date().toISOString().slice(0, 10)}`
          await createTransactionFromAuctionWin(
            listing.id,
            winner.userId,
            winner.amount,
            null, // system action
            idempotencyKey
          )

          // Broadcast won event to global feed
          eventBus.emit('global', {
            type: 'won',
            name: listing.title,
            amount: `${winner.amount} ₴`,
            user: `${winner.user.name.slice(0, 4)}***`
          })
        } catch (error: any) {
          if (error.message === 'TRANSACTION_EXISTS') {
            console.log(`Transaction already exists for listing ${listing.id}, skipping`)
          } else {
            console.error(`Failed to create transaction for listing ${listing.id}:`, error)
          }
        }
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
