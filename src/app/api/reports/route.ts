import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    const { listingId, reason } = await request.json()

    if (!reason) {
      return NextResponse.json({ error: 'Вкажіть причину' }, { status: 400 })
    }

    const report = await prisma.report.create({
      data: {
        userId: session.user.id,
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
