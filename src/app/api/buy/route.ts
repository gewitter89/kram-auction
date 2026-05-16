import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { createTransactionFromBuyNow } from '@/lib/transaction-service'
import { eventBus } from '@/lib/eventBus'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    const { listingId } = await request.json()
    if (!listingId) return NextResponse.json({ error: 'Вкажіть лот' }, { status: 400 })

    // Get IP and user agent for audit log
    const headers = request.headers
    const ip = headers.get('x-forwarded-for') || undefined
    const userAgent = headers.get('user-agent') || undefined

    const transaction = await createTransactionFromBuyNow(listingId, userId, ip, userAgent)

    eventBus.emit('global', {
      type: 'won',
      name: transaction.listing.title,
      amount: `${transaction.amount.toLocaleString('uk-UA')} ₴`,
      user: (session?.user?.name || 'Учасник').slice(0, 3) + '***' + userId.slice(-2)
    })

    return NextResponse.json({ 
      success: true,
      message: 'Лот куплено! Перейдіть у кабінет для підтвердження оплати.',
      transactionId: transaction.id
    })
  } catch (error: any) {
    console.error('Buy Now error:', error)
    
    if (error.message === 'TRANSACTION_EXISTS') {
      return NextResponse.json({ error: 'Угода за цим лотом вже існує' }, { status: 409 })
    }
    if (error.message === 'LISTING_NOT_FOUND') {
      return NextResponse.json({ error: 'Лот не знайдено' }, { status: 404 })
    }
    if (error.message === 'CANNOT_BUY_OWN') {
      return NextResponse.json({ error: 'Ви не можете купити свій лот' }, { status: 400 })
    }
    if (error.message === 'LISTING_NOT_ACTIVE') {
      return NextResponse.json({ error: 'Лот вже продано або неактивний' }, { status: 400 })
    }
    if (error.message === 'NO_BUY_NOW_PRICE') {
      return NextResponse.json({ error: 'Цей лот не можна купити відразу' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
