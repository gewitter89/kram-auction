import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { sendVerificationSms } from '@/lib/sms-service'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    const { phone } = await req.json()

    if (typeof phone !== 'string') {
      return NextResponse.json({ error: 'Некоректний номер телефону' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 12 || !cleanPhone.startsWith('380')) {
      return NextResponse.json({ error: 'Некоректний номер телефону (формат 380XXXXXXXXX)' }, { status: 400 })
    }

    // Check if phone is already used by another user
    const existing = await prisma.user.findFirst({
      where: { phone: cleanPhone, verified: true, id: { not: session.user.id } }
    })
    
    if (existing) {
      return NextResponse.json({ error: 'Цей номер вже використовується іншим користувачем' }, { status: 400 })
    }

    // Rate Limiting and Max Attempts
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phoneVerificationAttempts: true, phoneVerificationLastSent: true }
    })

    if (user?.phoneVerificationAttempts && user.phoneVerificationAttempts >= 5) {
      return NextResponse.json({ error: 'Перевищено ліміт спроб. Зверніться до підтримки.' }, { status: 429 })
    }

    if (user?.phoneVerificationLastSent) {
      const msSinceLast = Date.now() - new Date(user.phoneVerificationLastSent).getTime()
      if (msSinceLast < 60000) { // 1 minute cooldown
        return NextResponse.json({ error: 'Зачекайте 1 хвилину перед наступною відправкою' }, { status: 429 })
      }
    }

    // Generate random 4-digit code (Mock ONLY in non-production)
    const isDemo = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === 'true'
    const code = isDemo ? '0000' : Math.floor(1000 + Math.random() * 9000).toString()

    // Save code and increment attempts
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phoneVerificationCode: code,
        phoneVerificationExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
        phoneVerificationAttempts: { increment: 1 },
        phoneVerificationLastSent: new Date()
      }
    })

    // Send SMS via service
    const success = await sendVerificationSms(cleanPhone, code)
    if (!success) {
      return NextResponse.json({ error: 'Не вдалося відправити SMS. Перевірте номер або спробуйте пізніше.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Код відправлено' })
  } catch (error: any) {
    console.error('Send verification error:', error)
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 })
  }
}
