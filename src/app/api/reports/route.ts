import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { isRateLimited } from '@/lib/rateLimit'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    // Rate limit to max 3 reports per minute per user
    if (isRateLimited(`report:${userId}`, 3, 60_000)) {
      return NextResponse.json({ error: 'Занадто багато скарг. Спробуйте через кілька секунд.' }, { status: 429 })
    }

    const { listingId, reason } = await request.json()


    if (!reason) {
      return NextResponse.json({ error: 'Вкажіть причину' }, { status: 400 })
    }

    const report = await prisma.report.create({
      data: {
        userId: userId,
        listingId: listingId || '', // Empty string for verification requests
        reason,
        status: 'pending'
      }
    })

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
