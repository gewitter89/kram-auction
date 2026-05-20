import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { cancelTransaction } from '@/lib/transaction-service'

type SessionUserWithRole = {
  role?: string
}

// POST /api/transactions/[id]/cancel - Cancel transaction before shipment
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

    // Get IP and user agent for audit log
    const headers = request.headers
    const ip = headers.get('x-forwarded-for') || undefined
    const userAgent = headers.get('user-agent') || undefined

    const userRole = (session.user as SessionUserWithRole).role || 'user'

    const transaction = await cancelTransaction(
      id,
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
  } catch (error) {
    console.error('Cancel error:', error)
    const message = error instanceof Error ? error.message : 'Помилка сервера'
    
    if (message === 'TRANSACTION_NOT_FOUND') {
      return NextResponse.json({ error: 'Угоду не знайдено' }, { status: 404 })
    }
    if (message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Немає доступу' }, { status: 403 })
    }
    if (message === 'INVALID_STATUS') {
      return NextResponse.json({ error: 'Скасувати можна тільки до відправлення або відкриття спору' }, { status: 409 })
    }
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
