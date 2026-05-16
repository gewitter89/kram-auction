import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { trackDocument } from '@/lib/nova-poshta-service'
import { createTransactionEvent, TransactionEventType } from '@/lib/transaction-service'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      select: {
        id: true,
        trackingNumber: true,
        status: true,
        deliveryStatus: true,
      }
    })

    if (!transaction || !transaction.trackingNumber) {
      return NextResponse.json({ error: 'ТТН не знайдено' }, { status: 404 })
    }

    // Call Nova Poshta API
    const trackingInfo = await trackDocument(transaction.trackingNumber)
    
    if (!trackingInfo) {
      return NextResponse.json({ error: 'Не вдалося отримати дані від Нової Пошти' }, { status: 502 })
    }

    // Update metadata/status based on tracking
    // StatusCode 7, 8: Arrived at warehouse
    // StatusCode 9, 10, 11: Received
    
    let message = `Оновлено статус доставки: ${trackingInfo.Status}`

    if (['9', '10', '11'].includes(trackingInfo.StatusCode) && transaction.status === 'SELLER_SHIPPED') {
      // Auto-confirm receipt if delivered
      // Note: In production we might want to wait for actual buyer confirmation or a delay
      // but for this MVP let's just log it and maybe auto-complete
      message = `Посилка отримана за даними Нової Пошти. ${trackingInfo.Status}`
    }

    // Log the event
    await createTransactionEvent(
      id,
      TransactionEventType.DELIVERY_UPDATE,
      null,
      transaction.status,
      transaction.status,
      message,
      {
        statusCode: trackingInfo.StatusCode,
        statusText: trackingInfo.Status,
        scheduledDelivery: trackingInfo.ScheduledDeliveryDate
      }
    )

    return NextResponse.json({ 
      success: true, 
      trackingStatus: trackingInfo.Status,
      statusCode: trackingInfo.StatusCode
    })
  } catch (error) {
    console.error('Sync tracking error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
