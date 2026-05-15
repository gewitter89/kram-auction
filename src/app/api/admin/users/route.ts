import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== 'admin' && user?.email !== 'admin@lotva.ua' && user?.email !== 'admin@kram.ua') return null
  return user
}

export async function GET(request: Request) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { email: { contains: query } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      verified: true,
      rating: true,
      createdAt: true,
      _count: {
        select: { listings: true, bids: true }
      }
    }
  })

  return NextResponse.json(users)
}

export async function PATCH(request: Request) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, action, value } = await request.json()

  if (action === 'setRole') {
    await prisma.user.update({
      where: { id: userId },
      data: { role: value }
    })
  } else if (action === 'setVerified') {
    await prisma.user.update({
      where: { id: userId },
      data: { verified: value }
    })
  }

  return NextResponse.json({ success: true })
}
