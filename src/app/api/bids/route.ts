import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { placeBid } from '@/server/auction/placeBid'
import { requireAuth } from '@/lib/getCurrentUser'

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const { listingId, amount, isAuto, autoMax } = await request.json()

    if (!listingId || !amount) {
      return NextResponse.json({ error: 'Вкажіть лот та суму' }, { status: 400 })
    }

    const result = await placeBid({
      userId: user.id,
      listingId,
      amount: Number(amount),
      isAuto: Boolean(isAuto),
      autoMax: autoMax ? Number(autoMax) : undefined
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ 
      message: result.message, 
      newPrice: result.newPrice 
    }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }
    console.error('Bid error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
