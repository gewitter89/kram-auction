import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { listUserTransactions } from '@/lib/transaction-service'

// GET /api/transactions - List user's transactions
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') as 'buyer' | 'seller' | undefined
    const status = searchParams.get('status') || undefined

    const transactions = await listUserTransactions(session.user.id, role, status)

    return NextResponse.json({ transactions })
  } catch (error: any) {
    console.error('List transactions error:', error)
    return NextResponse.json(
      { error: error.message || 'Помилка сервера' },
      { status: 500 }
    )
  }
}
