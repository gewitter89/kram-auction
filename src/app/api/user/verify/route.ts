import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    const { phone, code } = await req.json()

    if (typeof phone !== 'string' || typeof code !== 'string') {
      return NextResponse.json({ error: 'Некоректні дані для верифікації' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 12 || !cleanPhone.startsWith('380')) {
      return NextResponse.json({ error: 'Некоректний номер телефону (формат 380XXXXXXXXX)' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        phoneVerificationCode: true,
        phoneVerificationExpiry: true,
        phoneVerificationAttempts: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 404 })
    }

    if (!user.phoneVerificationCode || !user.phoneVerificationExpiry) {
      return NextResponse.json({ error: 'Код не був відправлений' }, { status: 400 })
    }

    if (user.phoneVerificationAttempts >= 5) {
      return NextResponse.json({ error: 'Перевищено ліміт спроб. Надішліть новий код пізніше.' }, { status: 429 })
    }

    if (user.phoneVerificationExpiry < new Date()) {
      return NextResponse.json({ error: 'Час дії коду минув. Надішліть новий код.' }, { status: 400 })
    }

    const isDemo = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === 'true'
    const validCodes = isDemo ? ['0000', '1234', user.phoneVerificationCode] : [user.phoneVerificationCode]

    if (!validCodes.includes(code)) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { phoneVerificationAttempts: { increment: 1 } }
      })
      return NextResponse.json({ error: 'Невірний код' }, { status: 400 })
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        phone: cleanPhone,
        verified: true,
        phoneVerificationCode: null,
        phoneVerificationExpiry: null,
        phoneVerificationAttempts: 0
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Verification error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Цей номер вже використовується' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 })
  }
}
