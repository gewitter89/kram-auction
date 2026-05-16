import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { cancelTransaction } from '@/lib/transaction-service'

// POST /api/transactions/[id]/cancel - Cancel transaction (only from PENDING_PAYMENT)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    // Get IP and user agent for audit log
    const headers = request.headers
    const ip = headers.get('x-forwarded-for') || undefined
    const userAgent = headers.get('user-agent') || undefined

    const userRole = (session.user as any).role || 'user'

    const transaction = await cancelTransaction(
      params.id,
      session.user.id,
      userRole,
      ip,
      userAgent
    )

    return NextResponse.json({ 
      success: true,
      message: 'Угоду скасовано. Лот знову доступний у каталозі.',
      transaction 
    })
  } catch (error: any) {
    console.error('Cancel error:', error)
    
    if (error.message === 'TRANSACTION_NOT_FOUND') {
      return NextResponse.json({ error: 'Угоду не знайдено' }, { status: 404 })
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Немає доступу' }, { status: 403 })
    }
    if (error.message === 'INVALID_STATUS') {
      return NextResponse.json({ error: 'Скасувати можна тільки угоду, що очікує оплати' }, { status: 409 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Помилка сервера' },
      { status: 500 }
    )
  }
}
