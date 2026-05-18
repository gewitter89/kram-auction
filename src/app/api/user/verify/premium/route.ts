import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    const { method } = await req.json()

    // Mark the user as officially verified in the system database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        verified: true
      }
    })

    return NextResponse.json({ success: true, verified: true })
  } catch (error: any) {
    console.error('Premium verification write error:', error)
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 })
  }
}
