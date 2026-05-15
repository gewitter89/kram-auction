import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    const { sellerId, listingId, rating, text } = await request.json()

    if (!sellerId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Вкажіть продавця та оцінку від 1 до 5' }, { status: 400 })
    }

    if (sellerId === session.user.id) {
      return NextResponse.json({ error: 'Не можна залишати відгук самому собі' }, { status: 400 })
    }

    // Optional: Verify that the user actually bought something from this seller
    // For MVP we allow it, but let's check transactions
    const hasBought = await prisma.transaction.findFirst({
      where: { sellerId, buyerId: session.user.id }
    })

    if (!hasBought) {
      return NextResponse.json({ error: 'Ви можете залишити відгук тільки після покупки у цього продавця' }, { status: 403 })
    }

    // Check if review already exists for this listing (if listingId provided)
    if (listingId) {
      const existing = await prisma.review.findFirst({
        where: { sellerId, reviewerId: session.user.id, listingId }
      })
      if (existing) {
        return NextResponse.json({ error: 'Ви вже залишали відгук за цей лот' }, { status: 400 })
      }
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        sellerId,
        reviewerId: session.user.id,
        listingId: listingId || null,
        rating: Number(rating),
        text: text || ''
      }
    })

    // Update seller rating
    const allReviews = await prisma.review.findMany({ where: { sellerId } })
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length

    await prisma.user.update({
      where: { id: sellerId },
      data: { 
        rating: avgRating,
        reviewsCount: allReviews.length
      }
    })

    return NextResponse.json({ message: 'Відгук додано успішно', review }, { status: 201 })
  } catch (error) {
    console.error('Review error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
