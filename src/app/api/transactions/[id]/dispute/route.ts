import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { openTransactionDispute } from '@/lib/transaction-service'
import { z } from 'zod'

const disputeSchema = z.object({
  reason: z.string().min(5, 'Вкажіть причину спору (мінімум 5 символів)'),
})

// POST /api/transactions/[id]/dispute - Open dispute
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    const body = await request.json()
    const validation = disputeSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.toString() },
        { status: 400 }
      )
    }

    const { reason } = validation.data

    // Get IP and user agent for audit log
    const headers = request.headers
    const ip = headers.get('x-forwarded-for') || undefined
    const userAgent = headers.get('user-agent') || undefined

    const transaction = await openTransactionDispute(
      params.id,
      session.user.id,
      reason,
      ip,
      userAgent
    )

    return NextResponse.json({ 
      success: true,
      message: 'Спір відкрито. Команда KRAM розгляне ситуацію.',
      transaction 
    })
  } catch (error: any) {
    console.error('Dispute error:', error)
    
    if (error.message === 'TRANSACTION_NOT_FOUND') {
      return NextResponse.json({ error: 'Угоду не знайдено' }, { status: 404 })
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Немає доступу' }, { status: 403 })
    }
    if (error.message === 'INVALID_STATUS') {
      return NextResponse.json({ error: 'Спір можна відкрити тільки після оплати та до підтвердження отримання' }, { status: 409 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Помилка сервера' },
      { status: 500 }
    )
  }
}
