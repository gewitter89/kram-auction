import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { sendSimpleEventEmail } from '@/lib/email'
import { absoluteUrl } from '@/lib/site-url'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    const { sellerId, listingId, rating, text } = await request.json()
    const numericRating = Number(rating)

    if (!sellerId || !listingId || !numericRating || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Вкажіть лот, продавця та оцінку від 1 до 5' }, { status: 400 })
    }

    if (sellerId === userId) {
      return NextResponse.json({ error: 'Не можна залишати відгук самому собі' }, { status: 400 })
    }

    const completedTransaction = await prisma.transaction.findFirst({
      where: {
        listingId,
        sellerId,
        buyerId: userId,
        status: 'COMPLETED',
      },
      select: { id: true }
    })

    if (!completedTransaction) {
      return NextResponse.json({ error: 'Відгук можна залишити тільки після завершеної домовленості за цим лотом' }, { status: 403 })
    }

    const existing = await prisma.review.findFirst({
      where: { sellerId, reviewerId: userId, listingId }
    })
    if (existing) {
      return NextResponse.json({ error: 'Ви вже залишали відгук за цей лот' }, { status: 409 })
    }

    const review = await prisma.review.create({
      data: {
        sellerId,
        reviewerId: userId,
        listingId,
        rating: numericRating,
        text: typeof text === 'string' ? text.trim().slice(0, 1000) : ''
      }
    })

    const aggregate = await prisma.review.aggregate({
      where: { sellerId },
      _avg: { rating: true },
      _count: { id: true }
    })

    await prisma.user.update({
      where: { id: sellerId },
      data: { 
        rating: aggregate._avg.rating || numericRating,
        reviewsCount: aggregate._count.id
      },
      select: { id: true }
    })

    await prisma.notification.create({
      data: {
        userId: sellerId,
        type: 'review',
        title: 'Новий відгук',
        message: `Покупець залишив оцінку ${numericRating}/5 за завершену домовленість.`,
        listingId,
      }
    }).catch(() => {})

    const seller = await prisma.user.findUnique({ where: { id: sellerId }, select: { email: true } })
    sendSimpleEventEmail({
      to: seller?.email,
      subject: '⭐ Новий відгук на KRAM',
      title: 'Ви отримали новий відгук',
      message: `Покупець залишив оцінку ${numericRating}/5 за завершену домовленість.`,
      ctaUrl: absoluteUrl(`/user/${sellerId}`),
      ctaLabel: 'Переглянути профіль'
    }).catch(console.error)

    return NextResponse.json({ message: 'Відгук додано успішно', review }, { status: 201 })
  } catch (error) {
    console.error('Review error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
