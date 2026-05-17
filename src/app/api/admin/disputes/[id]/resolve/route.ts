import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { createTransactionEvent } from '@/lib/transaction-service'
import { cancelRelease, createPendingRelease, makeFundsAvailable } from '@/lib/payment-release-service'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { resolution, notes } = await request.json()

    if (!['REFUND_BUYER', 'PAYOUT_SELLER'].includes(resolution)) {
      return NextResponse.json({ error: 'Invalid resolution action' }, { status: 400 })
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { payments: { orderBy: { createdAt: 'desc' }, take: 1 } }
    })

    if (!transaction || transaction.status !== 'DISPUTED') {
      return NextResponse.json({ error: 'Transaction not found or not disputed' }, { status: 404 })
    }

    // Determine new status based on resolution
    const newStatus = resolution === 'REFUND_BUYER' ? 'CANCELLED' : 'COMPLETED'

    // Update transaction
    await prisma.transaction.update({
      where: { id },
      data: { status: newStatus }
    })

    // Log event
    await createTransactionEvent(
      id,
      session.user.id,
      resolution === 'REFUND_BUYER' ? 'TRANSACTION_DISPUTE_RESOLVED_REFUND' : 'TRANSACTION_DISPUTE_RESOLVED_RELEASE',
      'DISPUTED',
      newStatus,
      `Адміністратор вирішив спір: ${resolution === 'REFUND_BUYER' ? 'Повернення коштів покупцю' : 'Виплата продавцю'}. Примітка: ${notes || 'Немає'}`
    )

    // Handle money
    if (resolution === 'REFUND_BUYER') {
      // Cancel any pending releases
      await cancelRelease(id, `Dispute resolved in favor of buyer: ${notes}`)
      // In a real world, here we would also call LiqPay refund API
    } else {
      // Payout seller
      // Since it was disputed, maybe funds are not yet 'APPROVED' for release
      // Let's forcefully approve funds
      const payment = transaction.payments[0]
      if (payment) {
        // Ensure pending release exists
        await createPendingRelease(id, payment.id, transaction.sellerId, transaction.amount, 'UAH')
        // Make funds available so it shows up in payouts panel
        await makeFundsAvailable(id)
      }
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error: any) {
    console.error('Failed to resolve dispute:', error)
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    )
  }
}
