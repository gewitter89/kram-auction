import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/getCurrentUser'

const QA_EMAIL_PREFIXES = ['kram.qa.', 'qa.']
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''

    if (!email || !QA_EMAIL_PREFIXES.some(prefix => email.startsWith(prefix))) {
      return NextResponse.json({ error: 'Only explicit QA emails can be cleaned up' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } })
    if (!user) return NextResponse.json({ success: true, deleted: false, message: 'QA user not found' })

    const transactions = await prisma.transaction.findMany({
      where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
      select: { id: true, listingId: true },
    })
    const transactionIds = transactions.map(tx => tx.id)
    const listingIdsFromTransactions = transactions.map(tx => tx.listingId)

    const ownListings = await prisma.listing.findMany({ where: { sellerId: user.id }, select: { id: true } })
    const ownListingIds = ownListings.map(lot => lot.id)
    const touchedListingIds = [...new Set([...listingIdsFromTransactions, ...ownListingIds])]

    await prisma.$transaction(async tx => {
      if (transactionIds.length > 0) {
        await tx.transactionEvent.deleteMany({ where: { transactionId: { in: transactionIds } } })
        await tx.paymentRelease.deleteMany({ where: { transactionId: { in: transactionIds } } })
        await tx.payment.deleteMany({ where: { transactionId: { in: transactionIds } } })
        await tx.transaction.deleteMany({ where: { id: { in: transactionIds } } })
      }

      await tx.bid.deleteMany({ where: { userId: user.id } })
      await tx.favorite.deleteMany({ where: { userId: user.id } })
      await tx.report.deleteMany({ where: { userId: user.id, reason: 'saved_search' } })
      await tx.message.deleteMany({ where: { OR: [{ senderId: user.id }, { receiverId: user.id }] } })
      await tx.notification.deleteMany({ where: { userId: user.id } })
      await tx.review.deleteMany({ where: { OR: [{ sellerId: user.id }, { reviewerId: user.id }] } })
      await tx.report.deleteMany({ where: { userId: user.id } })

      if (ownListingIds.length > 0) {
        await tx.bid.deleteMany({ where: { listingId: { in: ownListingIds } } })
        await tx.favorite.deleteMany({ where: { listingId: { in: ownListingIds } } })
        await tx.message.deleteMany({ where: { listingId: { in: ownListingIds } } })
        await tx.report.deleteMany({ where: { listingId: { in: ownListingIds } } })
        await tx.review.deleteMany({ where: { listingId: { in: ownListingIds } } })
        await tx.listing.deleteMany({ where: { id: { in: ownListingIds } } })
      }

      if (listingIdsFromTransactions.length > 0) {
        await tx.listing.updateMany({
          where: { id: { in: listingIdsFromTransactions }, status: { in: ['sold', 'ended'] } },
          data: { status: 'active' },
        })
      }

      await tx.user.delete({ where: { id: user.id } })
    })

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'qa_cleanup',
        metadata: JSON.stringify({ email, transactionIds, touchedListingIds }),
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, deleted: true, email, transactionIds, touchedListingIds })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('QA cleanup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
