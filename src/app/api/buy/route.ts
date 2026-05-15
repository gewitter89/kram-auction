import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { eventBus } from '@/lib/eventBus'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    const { listingId } = await request.json()
    if (!listingId) return NextResponse.json({ error: 'Вкажіть лот' }, { status: 400 })

    const listing = await prisma.listing.findUnique({ where: { id: listingId } })
    if (!listing) return NextResponse.json({ error: 'Лот не знайдено' }, { status: 404 })

    if (listing.sellerId === session.user.id) {
      return NextResponse.json({ error: 'Ви не можете купити свій лот' }, { status: 400 })
    }

    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Лот вже продано або неактивний' }, { status: 400 })
    }

    if (!listing.buyNowPrice) {
      return NextResponse.json({ error: 'Цей лот не можна купити відразу' }, { status: 400 })
    }

    // Process buy now
    // 1. Update listing status
    // 2. Create a transaction
    // 3. Create a winning bid (optional, for consistency in history)
    // 4. Send notifications

    await prisma.$transaction(async (tx) => {
      await tx.listing.update({
        where: { id: listingId },
        data: { status: 'sold', currentPrice: listing.buyNowPrice }
      })

      // Add a bid just to show it in history as the final price
      await tx.bid.create({
        data: {
          listingId,
          userId: session.user.id,
          amount: listing.buyNowPrice!
        }
      })

      // Create transaction
      await tx.transaction.create({
        data: {
          listingId,
          buyerId: session.user.id,
          sellerId: listing.sellerId,
          amount: listing.buyNowPrice!
        }
      })

      // Notify seller
      await tx.notification.create({
        data: {
          userId: listing.sellerId,
          type: 'sold',
          title: 'Ваш лот куплено!',
          message: `Лот "${listing.title}" купили за бліц-ціною ${listing.buyNowPrice} ₴. Зв'яжіться з покупцем!`,
          listingId
        }
      })
    })

    eventBus.emit('global', {
      type: 'won',
      name: listing.title,
      amount: `${listing.buyNowPrice.toLocaleString('uk-UA')} ₴`,
      user: session.user.name?.slice(0, 3) + '***' + session.user.id.slice(-2)
    })

    return NextResponse.json({ message: 'Лот куплено' })
  } catch (error) {
    console.error('Buy Now error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
