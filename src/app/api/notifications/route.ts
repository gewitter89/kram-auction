import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

export async function GET(request: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)

  // Fast path for header badge
  if (searchParams.get('unreadCount') === '1') {
    const unread = await prisma.notification.count({
      where: { userId: userId, read: false }
    })
    return NextResponse.json({ unread })
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  const unreadCount = await prisma.notification.count({
    where: { userId: userId, read: false }
  })

  return NextResponse.json({ notifications, unreadCount })
}

export async function PUT(request: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, all } = await request.json()
  
  if (all) {
    await prisma.notification.updateMany({
      where: { userId: userId, read: false },
      data: { read: true }
    })
  } else if (id) {
    await prisma.notification.updateMany({
      where: { id, userId: userId },
      data: { read: true }
    })
  }

  return NextResponse.json({ message: 'Updated' })
}
