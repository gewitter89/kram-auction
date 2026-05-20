import { NextResponse } from 'next/server'
import { paymentsDisabledResponse, paymentsEnabled } from '@/lib/payments-mode'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { createPaymentForm, isLiqPayConfigured } from '@/lib/liqpay-service'
import { absoluteUrl } from '@/lib/site-url'

// POST /api/liqpay/create - Create LiqPay payment form
export async function POST(request: Request) {
  if (!paymentsEnabled()) {
    return NextResponse.json(paymentsDisabledResponse, { status: 410 })
  }

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    // Check if LiqPay is configured
    if (!isLiqPayConfigured()) {
      return NextResponse.json(
        { error: 'LiqPay не налаштовано. Зверніться до адміністратора.' },
        { status: 503 }
      )
    }

    const { transactionId } = await request.json()
    if (!transactionId) {
      return NextResponse.json({ error: 'Вкажіть ID транзакції' }, { status: 400 })
    }

    // Get transaction with listing info
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        listing: { select: { title: true, id: true } },
        buyer: { select: { id: true, name: true, email: true } },
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Транзакцію не знайдено' }, { status: 404 })
    }

    // Verify buyer owns this transaction
    if (transaction.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

    // Check transaction status
    if (transaction.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { error: 'Цю транзакцію не можна оплатити' },
        { status: 409 }
      )
    }

    // Check if already has payment attempt
    const existingPayment = await prisma.payment.findFirst({
      where: { transactionId, status: { in: ['PENDING', 'PROCESSING'] } },
    })

    if (existingPayment) {
      // Return existing payment data
      return NextResponse.json({
        success: true,
        formData: {
          data: existingPayment.liqpayData,
          signature: existingPayment.liqpaySignature,
        },
        paymentId: existingPayment.id,
        isSandbox: process.env.LIQPAY_SANDBOX !== 'false',
      })
    }

    // Create LiqPay payment form
    const serverUrl = absoluteUrl('/api/liqpay/callback')
    const resultUrl = absoluteUrl(`/payment/pending?transactionId=${transaction.id}`)

    const formData = createPaymentForm(
      transaction.amount,
      `kram-${transaction.id}`,
      `Оплата лоту: ${transaction.listing.title}`,
      serverUrl,
      resultUrl,
      'UAH',
      'pay'
    )

    // Save payment record
    const payment = await prisma.payment.create({
      data: {
        transactionId: transaction.id,
        buyerId: session.user.id,
        amount: transaction.amount,
        currency: 'UAH',
        provider: 'LIQPAY',
        status: 'PENDING',
        liqpayData: formData.data,
        liqpaySignature: formData.signature,
      },
    })

    return NextResponse.json({
      success: true,
      formData,
      paymentId: payment.id,
      isSandbox: process.env.LIQPAY_SANDBOX !== 'false',
    })
  } catch (error) {
    console.error('LiqPay create payment error:', error)
    return NextResponse.json(
      { error: 'Помилка створення платежу' },
      { status: 500 }
    )
  }
}
