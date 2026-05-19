import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    const isAdmin = session.user.role === 'admin' || session.user.email === 'admin@kram.ua'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Преміум-верифікація вимкнена. Подайте заявку на ручну перевірку продавця.' }, { status: 403 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { verified: true, verificationStatus: 'VERIFIED' },
      select: { id: true, verified: true }
    })

    return NextResponse.json({ success: true, verified: updatedUser.verified })
  } catch (error) {
    console.error('Premium verification write error:', error)
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 })
  }
}
