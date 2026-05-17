import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseCallback } from '@/lib/liqpay-service'
import { eventBus } from '@/lib/eventBus'
import { createPendingRelease } from '@/lib/payment-release-service'

// POST /api/liqpay/callback - Handle LiqPay payment callback
export async function POST(request: Request) {
  try {
    const body = await request.formData()
    const data = body.get('data') as string
    const signature = body.get('signature') as string

    if (!data || !signature) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    // Parse and verify callback
    const result = parseCallback(data, signature)
    
    if (!result.valid) {
      console.error('Invalid LiqPay callback signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payment = result.payment!
    const orderId = payment.orderId.replace('kram-', '')

    // Find payment record
    const paymentRecord = await prisma.payment.findFirst({
      where: { transactionId: orderId },
      include: { transaction: true },
    })

    if (!paymentRecord) {
      console.error('Payment record not found:', orderId)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const isSuccess = payment.status === 'success' || payment.status === 'sandbox'
    const isProcessing = payment.status === 'processing' || payment.status === 'wait_accept' || payment.status === 'wait_secure'
    const nextPaymentStatus = isSuccess ? 'COMPLETED' : isProcessing ? 'PROCESSING' : 'FAILED'

    // Double-spend & duplicate callback protection
    if (paymentRecord.status === 'COMPLETED') {
      return NextResponse.json({ success: true, alreadyProcessed: true })
    }

    if (paymentRecord.status === nextPaymentStatus && paymentRecord.providerPaymentId === payment.paymentId) {
      return NextResponse.json({ success: true, alreadyProcessed: true })
    }

    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        status: nextPaymentStatus,
        providerPaymentId: payment.paymentId,
        paidAt: isSuccess ? new Date() : null,
        callbackData: JSON.stringify(payment),
      },
    })

    if (isSuccess && paymentRecord.transaction.status === 'PENDING_PAYMENT') {
      await prisma.transaction.update({
        where: { id: paymentRecord.transactionId },
        data: {
          status: 'PAID_HELD',
          paymentStatus: 'PAID',
          paymentConfirmedAt: new Date(),
        },
      })

      // Create pending release for seller (funds available after buyer confirms receipt)
      try {
        await createPendingRelease(
          paymentRecord.transactionId,
          paymentRecord.id,
          paymentRecord.transaction.sellerId,
          payment.amount,
          payment.currency
        )
      } catch (e) {
        console.error('Failed to create pending release:', e)
        // Don't fail the callback if release creation fails
      }

      // Create event
      await prisma.transactionEvent.create({
        data: {
          transactionId: paymentRecord.transactionId,
          type: 'PAYMENT_RECEIVED',
          actorId: paymentRecord.buyerId,
          fromStatus: 'PENDING_PAYMENT',
          toStatus: 'PAID_HELD',
          message: `Оплата підтверджена через LiqPay (ID: ${payment.paymentId}). Виплата продавцю виконується після підтвердження отримання та фінальної перевірки.`,
          metadata: JSON.stringify({
            paymentId: payment.paymentId,
            amount: payment.amount,
            transactionId: payment.transactionId,
          }),
        },
      })

      // Emit notification
      eventBus.emit('global', {
        type: 'payment',
        transactionId: paymentRecord.transactionId,
        amount: payment.amount,
      })
    }

    if (isProcessing) {
      await prisma.transaction.update({
        where: { id: paymentRecord.transactionId },
        data: { paymentStatus: 'PENDING' },
      })
    }

    console.log('LiqPay callback processed:', {
      orderId,
      paymentId: payment.paymentId,
      status: payment.status,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('LiqPay callback error:', error)
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    )
  }
}
