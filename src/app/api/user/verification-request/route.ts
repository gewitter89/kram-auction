import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { isRateLimited } from '@/lib/rateLimit'
import { assertUserAllowed, restrictionErrorMessage } from '@/lib/user-restrictions'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    const email = session?.user?.email

    if (!userId || !email) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    await assertUserAllowed(userId, 'verification')

    if (await isRateLimited(`seller-verification:${userId}`, 3, 60 * 60_000)) {
      return NextResponse.json({ error: 'Запит уже надіслано. Спробуйте пізніше або напишіть у підтримку.' }, { status: 429 })
    }

    const body = await request.json().catch(() => ({}))
    const city = typeof body.city === 'string' ? body.city.trim().slice(0, 80) : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 40) : ''
    const goods = typeof body.goods === 'string' ? body.goods.trim().slice(0, 500) : ''

    if (goods.length < 10) {
      return NextResponse.json({ error: 'Опишіть, які товари плануєте продавати (мінімум 10 символів).' }, { status: 400 })
    }

    const recent = await prisma.report.findFirst({
      where: {
        userId,
        listingId: null,
        reason: 'seller_verification_request',
        status: { in: ['pending', 'reviewed'] },
      },
      select: { id: true, status: true },
      orderBy: { createdAt: 'desc' },
    })

    if (recent) {
      return NextResponse.json({ success: true, alreadyExists: true, reportId: recent.id, status: recent.status })
    }

    const report = await prisma.report.create({
      data: {
        userId,
        listingId: null,
        reason: 'seller_verification_request',
        comment: JSON.stringify({ email, city, phone, goods }),
        status: 'pending',
      },
      select: { id: true },
    })

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(city ? { city } : {}),
        ...(phone ? { phone } : {}),
        ...(goods ? { bio: goods } : {}),
      },
      select: { id: true },
    }).catch(() => {})

    await prisma.$executeRawUnsafe('UPDATE "User" SET "verificationStatus" = $1 WHERE id = $2', 'MANUAL_REVIEW', userId).catch(() => {})

    await prisma.notification.create({
      data: {
        userId,
        type: 'verification',
        title: 'Запит на верифікацію прийнято',
        message: 'Модератор перевірить профіль продавця та повідомить про результат.',
      }
    }).catch(() => {})

    return NextResponse.json({ success: true, reportId: report.id })
  } catch (error) {
    const restrictionMessage = restrictionErrorMessage(error)
    if (restrictionMessage) return NextResponse.json({ error: restrictionMessage }, { status: 403 })
    console.error('Seller verification request error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
