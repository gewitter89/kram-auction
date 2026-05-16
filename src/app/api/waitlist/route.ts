import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, type, source } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Некоректний email' }, { status: 400 })
    }

    const waitlist = await prisma.waitlistEmail.upsert({
      where: {
        email_type: {
          email: email.toLowerCase(),
          type: type || 'buyer'
        }
      },
      update: {
        source: source || 'homepage'
      },
      create: {
        email: email.toLowerCase(),
        type: type || 'buyer',
        source: source || 'homepage'
      }
    })

    return NextResponse.json({ success: true, id: waitlist.id })
  } catch (error: any) {
    console.error('Waitlist API error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ success: true, message: 'Вже у списку' })
    }
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
