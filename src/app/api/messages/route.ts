import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const withUserId = searchParams.get('with')

  // Fast path for header badge
  if (searchParams.get('unreadCount') === '1') {
    const unread = await prisma.message.count({
      where: { receiverId: session.user.id, read: false }
    })
    return NextResponse.json({ unread })
  }

  if (withUserId) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: withUserId },
          { senderId: withUserId, receiverId: session.user.id },
        ]
      },
      orderBy: { createdAt: 'asc' }
    })
    await prisma.message.updateMany({
      where: { senderId: withUserId, receiverId: session.user.id, read: false },
      data: { read: true }
    })
    return NextResponse.json({ messages })
  }

  // Get all conversations
  const all = await prisma.message.findMany({
    where: {
      OR: [{ senderId: session.user.id }, { receiverId: session.user.id }]
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
      listing: { select: { id: true, title: true } }
    }
  })

  // Group by conversation partner
  const conversations: any = {}
  for (const msg of all) {
    const partnerId = msg.senderId === session.user.id ? msg.receiverId : msg.senderId
    if (!conversations[partnerId]) {
      const partner = msg.senderId === session.user.id ? msg.receiver : msg.sender
      conversations[partnerId] = {
        partnerId,
        partner,
        lastMessage: msg,
        unread: 0,
        listing: msg.listing
      }
    }
    if (msg.receiverId === session.user.id && !msg.read) {
      conversations[partnerId].unread++
    }
  }

  return NextResponse.json({ conversations: Object.values(conversations) })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { receiverId, text, listingId } = await request.json()
  if (!receiverId || !text) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      receiverId,
      text,
      listingId: listingId || null
    }
  })

  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: 'message',
      title: 'Нове повідомлення',
      message: `${session.user.name}: ${text.slice(0, 60)}`,
    }
  })

  return NextResponse.json({ message })
}
