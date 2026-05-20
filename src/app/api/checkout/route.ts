import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/getCurrentUser'
import { createTransactionFromBuyNow } from '@/lib/transaction-service'
import { isRateLimited } from '@/lib/rateLimit'
import { assertUserAllowed, restrictionErrorMessage } from '@/lib/user-restrictions'

const checkoutSchema = z.object({
  lotId: z.string().min(1),
  deliveryInfo: z.object({
    fullName: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(7).max(30),
    city: z.string().trim().min(2).max(120),
    warehouse: z.string().trim().min(2).max(200),
    address: z.string().trim().max(300).optional(),
  }),
})

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    await assertUserAllowed(user.id, 'buy')

    if (await isRateLimited(`checkout:${user.id}`, 8, 60_000)) {
      return NextResponse.json({ error: 'Занадто багато спроб. Спробуйте через кілька секунд.' }, { status: 429 })
    }

    const validation = checkoutSchema.safeParse(await request.json())
    if (!validation.success) {
      return NextResponse.json({ error: 'Перевірте дані доставки' }, { status: 400 })
    }

    const { lotId, deliveryInfo } = validation.data
    const headers = request.headers
    const ip = headers.get('x-forwarded-for') || undefined
    const userAgent = headers.get('user-agent') || undefined
    const idempotencyKey = `checkout:${lotId}:${user.id}:${Math.floor(Date.now() / 1000 / 60)}`

    const transaction = await createTransactionFromBuyNow(
      lotId,
      user.id,
      {
        recipientName: deliveryInfo.fullName,
        recipientPhone: deliveryInfo.phone,
        deliveryCity: deliveryInfo.city,
        deliveryWarehouse: deliveryInfo.warehouse,
        deliveryAddress: deliveryInfo.address,
      },
      ip,
      userAgent,
      idempotencyKey
    )

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      amount: transaction.amount,
    })
  } catch (error) {
    const restrictionMessage = restrictionErrorMessage(error)
    if (restrictionMessage) return NextResponse.json({ error: restrictionMessage }, { status: 403 })

    const message = error instanceof Error ? error.message : ''
    if (message === 'Unauthorized') return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    if (message === 'TRANSACTION_EXISTS') return NextResponse.json({ error: 'Угода за цим лотом вже існує' }, { status: 409 })
    if (message === 'CANNOT_BUY_OWN') return NextResponse.json({ error: 'Ви не можете купити свій лот' }, { status: 400 })
    if (message === 'LISTING_NOT_FOUND') return NextResponse.json({ error: 'Лот не знайдено' }, { status: 404 })
    if (message === 'LISTING_NOT_ACTIVE') return NextResponse.json({ error: 'Лот вже продано або неактивний' }, { status: 400 })
    if (message === 'NO_BUY_NOW_PRICE') return NextResponse.json({ error: 'Цей лот не можна купити відразу' }, { status: 400 })

    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Помилка при оформленні замовлення' }, { status: 500 })
  }
}
