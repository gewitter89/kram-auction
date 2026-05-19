import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, type, source, meta } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Некоректний email' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedType = type || 'buyer'
    const metaSummary = meta && typeof meta === 'object'
      ? `${source || 'homepage'}:${JSON.stringify(meta).slice(0, 180)}`
      : (source || 'homepage')

    const waitlist = await prisma.waitlistEmail.upsert({
      where: {
        email_type: {
          email: normalizedEmail,
          type: normalizedType
        }
      },
      update: {
        source: metaSummary
      },
      create: {
        email: normalizedEmail,
        type: normalizedType,
        source: metaSummary
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
