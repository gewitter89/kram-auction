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

    if (!phone || phone.length < 10) {
      return NextResponse.json({ error: 'Некоректний номер телефону' }, { status: 400 })
    }

    // In a real app, you would verify the OTP code here via Twilio / TurboSMS
    if (code !== '0000' && code !== '1234') {
      return NextResponse.json({ error: 'Невірний код. Для тесту використовуйте 0000 або 1234' }, { status: 400 })
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        phone: phone,
        verified: true 
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
