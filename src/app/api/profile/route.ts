import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

export async function PUT(request: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, city, phone, bio } = await request.json()

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "Ім'я занадто коротке" }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name.trim(),
      ...(city !== undefined ? { city: city.trim() } : {}),
      ...(phone !== undefined ? { phone: phone.trim() } : {}),
      ...(bio !== undefined ? { bio: bio.trim() } : {}),
    },
    select: { id: true, name: true, email: true, avatar: true, city: true, phone: true, bio: true }
  })

  return NextResponse.json({ user, message: 'Профіль збережено' })
}

export async function GET() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, avatar: true, city: true, phone: true, bio: true, createdAt: true }
  })

  return NextResponse.json({ user })
}
