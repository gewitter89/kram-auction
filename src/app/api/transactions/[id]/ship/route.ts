import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { shipTransaction } from '@/lib/transaction-service'
import { z } from 'zod'

const shipSchema = z.object({
  trackingNumber: z.string().min(1, 'Вкажіть номер накладної'),
  deliveryProvider: z.string().min(1, 'Вкажіть перевізника'),
})

// POST /api/transactions/[id]/ship - Seller ships the item
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

    const body = await request.json()
    const validation = shipSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.toString() },
        { status: 400 }
      )
    }

    const { trackingNumber, deliveryProvider } = validation.data

    // Get IP and user agent for audit log
    const headers = request.headers
    const ip = headers.get('x-forwarded-for') || undefined
    const userAgent = headers.get('user-agent') || undefined

    const transaction = await shipTransaction(
      id,
      session.user.id,
      trackingNumber,
      deliveryProvider,
      ip,
      userAgent
    )

    return NextResponse.json({ 
      success: true,
      message: 'Відправлення підтверджено. Покупець отримає сповіщення.',
      transaction 
    })
  } catch (error: any) {
    console.error('Ship error:', error)
    
    if (error.message === 'TRANSACTION_NOT_FOUND') {
      return NextResponse.json({ error: 'Угоду не знайдено' }, { status: 404 })
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Тільки продавець може підтвердити відправлення' }, { status: 403 })
    }
    if (error.message === 'INVALID_STATUS') {
      return NextResponse.json({ error: 'Неправильний статус угоди' }, { status: 409 })
    }
    if (error.message === 'MISSING_DELIVERY_INFO') {
      return NextResponse.json({ error: 'Вкажіть номер накладної та перевізника' }, { status: 400 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Помилка сервера' },
      { status: 500 }
    )
  }
}
