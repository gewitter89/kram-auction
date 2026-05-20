import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { broadcast } from '@/lib/realtime-server'
import { createTransactionFromAuctionWin } from '@/lib/transaction-service'

// This route is called by a cron job or manually to close expired auctions
// Protect with a secret token
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const token = request.headers.get('x-cron-secret') || bearer || request.nextUrl.searchParams.get('secret')

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
    const errors: Array<{ listingId: string; error: string }> = []

    for (const listing of expired) {
      const winner = listing.bids[0]

      if (winner) {
        try {
          // Create a direct-agreement transaction with idempotency
          const idempotencyKey = `auction:${listing.id}:${winner.userId}:${new Date().toISOString().slice(0, 10)}`
          await createTransactionFromAuctionWin(
            listing.id,
            winner.userId,
            winner.amount,
            undefined,
            null,
            idempotencyKey
          )

          // Broadcast won event to global feed
          broadcast('global', 'won', {
            type: 'won',
            name: listing.title,
            amount: `${winner.amount} ₴`,
            user: `${winner.user.name.slice(0, 4)}***`
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : ''
          if (message === 'TRANSACTION_EXISTS') {
            console.log(`Transaction already exists for listing ${listing.id}, skipping`)
          } else {
            console.error(`Failed to create transaction for listing ${listing.id}:`, error)
            errors.push({ listingId: listing.id, error: message || 'Unknown error' })
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

    const timestamp = new Date().toISOString()
    await prisma.auditLog.create({
      data: {
        action: errors.length > 0 ? 'CRON_CLOSE_AUCTIONS_PARTIAL' : 'CRON_CLOSE_AUCTIONS_SUCCESS',
        metadata: JSON.stringify({ closed: closedCount, expired: expired.length, errors, timestamp })
      }
    }).catch(() => {})

    return NextResponse.json({
      ok: errors.length === 0,
      closed: closedCount,
      expired: expired.length,
      errors,
      timestamp
    })
  } catch (error) {
    console.error('Cron close-auctions error:', error)
    await prisma.auditLog.create({
      data: {
        action: 'CRON_CLOSE_AUCTIONS_FAILED',
        metadata: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date().toISOString() })
      }
    }).catch(() => {})
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
