import { NextResponse } from 'next/server'
import { placeBid } from '@/server/auction/placeBid'
import { bidSchema, validateBody } from '@/lib/validation'
import { requireAuth } from '@/lib/getCurrentUser'
import { isRateLimited } from '@/lib/rateLimit'

export async function POST(request: Request) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // IP rate limit: 20 attempts per minute for anonymous/failed requests
    // This protects against brute force before heavy Prisma operations
    if (await isRateLimited(`bid-ip:${ip}`, 20, 60_000)) {
      return NextResponse.json({ error: 'Занадто багато спроб. Спробуйте через кілька секунд.' }, { status: 429 })
    }
    
    // Rate limit: 10 bids per minute per user
    const user = await requireAuth()
    
    // Check rate limit after auth to have userId
    if (await isRateLimited(`bid:${user.id}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Занадто багато спроб. Спробуйте через кілька секунд.' }, { status: 429 })
    }
    const body = await request.json()
    const validation = validateBody(bidSchema, {
      ...body,
      amount: Number(body?.amount),
      autoMax: body?.autoMax === null || body?.autoMax === '' || body?.autoMax === undefined ? undefined : Number(body.autoMax),
      isAuto: Boolean(body?.isAuto),
    })
    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { listingId, amount, isAuto, autoMax } = validation.data!

    const result = await placeBid({
      userId: user.id,
      listingId,
      amount,
      isAuto: Boolean(isAuto),
      autoMax
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
