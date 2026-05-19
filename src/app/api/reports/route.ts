import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { isRateLimited } from '@/lib/rateLimit'

const MAX_REASON_LENGTH = 120
const MAX_COMMENT_LENGTH = 500

function cleanText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    // Rate limit to max 3 reports per minute per user
    if (await isRateLimited(`report:${userId}`, 3, 60_000)) {
      return NextResponse.json({ error: 'Занадто багато скарг. Спробуйте через кілька секунд.' }, { status: 429 })
    }

    const payload = await request.json()
    const listingId = cleanText(payload.listingId, 80)
    const targetUserId = cleanText(payload.targetUserId, 80)
    const reason = cleanText(payload.reason, MAX_REASON_LENGTH)
    const comment = cleanText(payload.comment, MAX_COMMENT_LENGTH)

    if (!reason) {
      return NextResponse.json({ error: 'Вкажіть причину' }, { status: 400 })
    }

    if (!listingId && !targetUserId) {
      return NextResponse.json({ error: 'Вкажіть лот або користувача для скарги' }, { status: 400 })
    }

    let normalizedReason = reason
    let normalizedComment = comment || null
    let finalListingId: string | null = null

    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { id: true, sellerId: true, title: true }
      })

      if (!listing) {
        return NextResponse.json({ error: 'Лот не знайдено' }, { status: 404 })
      }

      if (listing.sellerId === userId) {
        return NextResponse.json({ error: 'Не можна скаржитись на власний лот' }, { status: 400 })
      }

      finalListingId = listing.id
    } else if (targetUserId) {
      if (targetUserId === userId) {
        return NextResponse.json({ error: 'Не можна скаржитись на власний профіль' }, { status: 400 })
      }

      const target = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, name: true }
      })

      if (!target) {
        return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 404 })
      }

      normalizedReason = `user:${target.id}:${reason}`.slice(0, MAX_REASON_LENGTH)
      normalizedComment = [
        `Скарга на користувача: ${target.name || 'Користувач'} (${target.id})`,
        comment || null,
      ].filter(Boolean).join('\n').slice(0, MAX_COMMENT_LENGTH)
    }

    const duplicate = await prisma.report.findFirst({
      where: {
        userId,
        listingId: finalListingId,
        reason: normalizedReason,
        status: 'pending',
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }
      },
      select: { id: true }
    })

    if (duplicate) {
      return NextResponse.json({ error: 'Схожа скарга вже очікує перевірки' }, { status: 409 })
    }

    const report = await prisma.report.create({
      data: {
        userId,
        listingId: finalListingId,
        reason: normalizedReason,
        comment: normalizedComment,
        status: 'pending'
      }
    })

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
