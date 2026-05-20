import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { createTransactionEvent } from '@/lib/transaction-service'

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

    if (!['CANCEL_FOR_BUYER', 'COMPLETE_FOR_SELLER'].includes(resolution)) {
      return NextResponse.json({ error: 'Invalid resolution action' }, { status: 400 })
    }

    const transaction = await prisma.transaction.findUnique({ where: { id } })

    if (!transaction || transaction.status !== 'DISPUTED') {
      return NextResponse.json({ error: 'Transaction not found or not disputed' }, { status: 404 })
    }

    const newStatus = resolution === 'CANCEL_FOR_BUYER' ? 'CANCELLED' : 'COMPLETED'
    const eventType = resolution === 'CANCEL_FOR_BUYER'
      ? 'TRANSACTION_DISPUTE_RESOLVED_CANCEL'
      : 'TRANSACTION_DISPUTE_RESOLVED_COMPLETE'
    const resolutionText = resolution === 'CANCEL_FOR_BUYER'
      ? 'спір закрито, угоду скасовано на користь покупця'
      : 'спір закрито, домовленість завершено на користь продавця'

    await prisma.transaction.update({
      where: { id },
      data: {
        status: newStatus,
        paymentStatus: 'NOT_PAID',
        ...(newStatus === 'COMPLETED' ? { completedAt: new Date() } : { cancelledAt: new Date() }),
      }
    })

    await createTransactionEvent(
      id,
      eventType,
      session.user.id,
      'DISPUTED',
      newStatus,
      `Адміністратор вирішив спір: ${resolutionText}. Примітка: ${notes || 'Немає'}`,
      { resolution, notes, noEscrow: true }
    )

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error: any) {
    console.error('Failed to resolve dispute:', error)
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    )
  }
}
