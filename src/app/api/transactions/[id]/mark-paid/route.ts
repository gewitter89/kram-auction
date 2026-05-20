import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { markTransactionTermsAgreed } from '@/lib/transaction-service'

// POST /api/transactions/[id]/mark-paid - Buyer confirms direct agreement terms
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

    const transaction = await markTransactionTermsAgreed(
      id,
      session.user.id,
      ip,
      userAgent
    )

    return NextResponse.json({ 
      success: true,
      message: 'Умови домовленості підтверджено. Очікуємо відправлення продавцем.',
      transaction 
    })
  } catch (error: any) {
    console.error('Terms agreed error:', error)
    
    if (error.message === 'TRANSACTION_NOT_FOUND') {
      return NextResponse.json({ error: 'Угоду не знайдено' }, { status: 404 })
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Тільки покупець може підтвердити домовленість' }, { status: 403 })
    }
    if (error.message === 'INVALID_STATUS') {
      return NextResponse.json({ error: 'Неправильний статус угоди' }, { status: 409 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Помилка сервера' },
      { status: 500 }
    )
  }
}
