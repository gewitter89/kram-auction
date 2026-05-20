import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/getCurrentUser'

const QA_EMAIL_PREFIXES = ['kram.qa.', 'qa.', 'test.', 'demo.', 'api.qa.', 'ui.qa.']
const QA_EMAIL_SUBSTRINGS = ['+qa', '+test', 'qa-', 'test-', 'demo']
const QA_EMAIL_DOMAINS = ['example.com', 'test.com', 'kram-test.com']

function isSafeQaEmail(email: string) {
  const [local, domain = ''] = email.split('@')
  return (
    QA_EMAIL_PREFIXES.some(prefix => email.startsWith(prefix)) ||
    QA_EMAIL_SUBSTRINGS.some(marker => local.includes(marker)) ||
    QA_EMAIL_DOMAINS.includes(domain)
  )
}

async function cleanupQaUser(email: string, adminId: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, role: true } })
  if (!user) return { email, deleted: false, message: 'QA user not found', transactionIds: [], touchedListingIds: [] }
  if (user.role === 'admin') throw new Error('REFUSE_ADMIN_CLEANUP')

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
      userId: adminId,
      action: 'qa_cleanup',
      metadata: JSON.stringify({ email, transactionIds, touchedListingIds }),
    },
  }).catch(() => {})

  return { email, deleted: true, transactionIds, touchedListingIds }
}

export async function GET() {
  try {
    await requireAdmin()
    const users = await prisma.user.findMany({
      where: {
        NOT: { role: 'admin' },
        OR: [
          { email: { contains: 'qa', mode: 'insensitive' } },
          { email: { contains: 'test', mode: 'insensitive' } },
          { email: { contains: 'demo', mode: 'insensitive' } },
          { email: { endsWith: '@example.com', mode: 'insensitive' } },
          { email: { endsWith: '@test.com', mode: 'insensitive' } },
          { email: { endsWith: '@kram-test.com', mode: 'insensitive' } },
        ],
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, name: true, role: true, createdAt: true,
        _count: { select: { listings: true, bids: true, sentMessages: true, purchases: true, sales: true, reports: true } },
      },
    })
    return NextResponse.json({ users: users.filter(user => isSafeQaEmail(user.email.toLowerCase())) })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    const body = await request.json().catch(() => ({}))
    const emails = Array.isArray(body.emails)
      ? body.emails.map((item: unknown) => String(item).toLowerCase().trim()).filter(Boolean)
      : [String(body.email || '').toLowerCase().trim()].filter(Boolean)

    if (emails.length === 0) return NextResponse.json({ error: 'email or emails required' }, { status: 400 })

    const unsafe = emails.filter((email: string) => !isSafeQaEmail(email))
    if (unsafe.length > 0) {
      return NextResponse.json({ error: 'Only explicit QA/test/demo emails can be cleaned up', unsafe }, { status: 400 })
    }

    const results = []
    for (const email of emails) {
      results.push(await cleanupQaUser(email, admin.id))
    }

    return NextResponse.json({ success: true, count: results.length, results })
  } catch (error) {
    if (error instanceof Error && error.message === 'REFUSE_ADMIN_CLEANUP') {
      return NextResponse.json({ error: 'Refusing to cleanup admin user' }, { status: 400 })
    }
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('QA cleanup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
