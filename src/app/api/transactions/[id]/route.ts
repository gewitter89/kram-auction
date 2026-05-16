import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { getTransactionWithDetails } from '@/lib/transaction-service'

// GET /api/transactions/[id] - Get transaction details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    const transaction = await getTransactionWithDetails(
      id,
      session.user.id,
      (session.user as any).role
    )

    return NextResponse.json({ transaction })
  } catch (error: any) {
    console.error('Get transaction error:', error)
    
    if (error.message === 'TRANSACTION_NOT_FOUND') {
      return NextResponse.json({ error: 'Угоду не знайдено' }, { status: 404 })
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Немає доступу' }, { status: 403 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Помилка сервера' },
      { status: 500 }
    )
  }
}
