import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { getTransactionWithDetails } from '@/lib/transaction-service'

type SessionUserWithRole = {
  role?: string
}

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

    const userRole = (session.user as SessionUserWithRole).role
    const transaction = await getTransactionWithDetails(
      id,
      session.user.id,
      userRole
    )

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Get transaction error:', error)
    const message = error instanceof Error ? error.message : 'Помилка сервера'
    
    if (message === 'TRANSACTION_NOT_FOUND') {
      return NextResponse.json({ error: 'Угоду не знайдено' }, { status: 404 })
    }
    if (message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Немає доступу' }, { status: 403 })
    }
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
