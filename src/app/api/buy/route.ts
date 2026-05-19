import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTransactionFromBuyNow } from '@/lib/transaction-service'
import { broadcast } from '@/lib/realtime-server'
import { requireAuth } from '@/lib/getCurrentUser'
import { isRateLimited } from '@/lib/rateLimit'
import { assertUserAllowed, restrictionErrorMessage } from '@/lib/user-restrictions'

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const userId = user.id
    await assertUserAllowed(userId, 'buy')

    if (await isRateLimited(`buy:${userId}`, 8, 60_000)) {
      return NextResponse.json({ error: 'Занадто багато спроб. Спробуйте через кілька секунд.' }, { status: 429 })
    }

    const { listingId } = await request.json()
    if (!listingId || typeof listingId !== 'string') return NextResponse.json({ error: 'Вкажіть лот' }, { status: 400 })

    // Get listing for event
    const listing = await prisma.listing.findUnique({ where: { id: listingId } })
    if (!listing) return NextResponse.json({ error: 'Лот не знайдено' }, { status: 404 })

    // Get IP and user agent for audit log
    const headers = request.headers
    const ip = headers.get('x-forwarded-for') || undefined
    const userAgent = headers.get('user-agent') || undefined

    // Generate idempotency key for double-submit protection
    const idempotencyKey = `buy:${listingId}:${userId}:${Math.floor(Date.now() / 1000 / 60)}` // 1-minute window

    const transaction = await createTransactionFromBuyNow(listingId, userId, undefined, ip, userAgent, idempotencyKey)

    broadcast('global', 'won', {
      type: 'won',
      name: listing.title,
      amount: `${transaction.amount.toLocaleString('uk-UA')} ₴`,
      user: (user.name || 'Учасник').slice(0, 3) + '***' + userId.slice(-2)
    })

    return NextResponse.json({ 
      success: true,
      message: 'Лот куплено! Перейдіть у кабінет для підтвердження оплати.',
      transactionId: transaction.id
    })
  } catch (error) {
    const restrictionMessage = restrictionErrorMessage(error)
    if (restrictionMessage) return NextResponse.json({ error: restrictionMessage }, { status: 403 })
    console.error('Buy Now error:', error)
    const message = error instanceof Error ? error.message : ''
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }
    if (message === 'TRANSACTION_EXISTS') {
      return NextResponse.json({ error: 'Угода за цим лотом вже існує' }, { status: 409 })
    }
    if (message === 'CANNOT_BUY_OWN') {
      return NextResponse.json({ error: 'Ви не можете купити свій лот' }, { status: 400 })
    }
    if (message === 'LISTING_NOT_ACTIVE') {
      return NextResponse.json({ error: 'Лот вже продано або неактивний' }, { status: 400 })
    }
    if (message === 'NO_BUY_NOW_PRICE') {
      return NextResponse.json({ error: 'Цей лот не можна купити відразу' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
