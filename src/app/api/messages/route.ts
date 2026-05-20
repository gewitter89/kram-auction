import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { isRateLimited } from '@/lib/rateLimit'
import { messageSchema } from '@/lib/validation'

async function canAttachListingToConversation(listingId: string, senderId: string, receiverId: string) {
  const [listing, receiver, bid, transaction] = await Promise.all([
    prisma.listing.findUnique({ where: { id: listingId }, select: { id: true, sellerId: true, status: true } }),
    prisma.user.findUnique({ where: { id: receiverId }, select: { id: true } }),
    prisma.bid.findFirst({ where: { listingId, userId: { in: [senderId, receiverId] } }, select: { id: true } }),
    prisma.transaction.findFirst({
      where: {
        listingId,
        OR: [
          { buyerId: senderId, sellerId: receiverId },
          { buyerId: receiverId, sellerId: senderId },
        ],
      },
      select: { id: true },
    }),
  ])

  if (!receiver) return { ok: false, status: 404, error: 'Отримувача не знайдено' }
  if (!listing) return { ok: false, status: 404, error: 'Лот не знайдено' }

  const isSellerConversation = listing.sellerId === senderId || listing.sellerId === receiverId
  const isParticipant = isSellerConversation && (Boolean(bid) || Boolean(transaction) || listing.status === 'active')
  const isOwnerToSelf = listing.sellerId === senderId && listing.sellerId === receiverId

  if (!isParticipant && !isOwnerToSelf) {
    return { ok: false, status: 403, error: 'Немає права привʼязати цей лот до розмови' }
  }

  return { ok: true, status: 200, error: '' }
}

export async function GET(request: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const withUserId = searchParams.get('with')
  const listingId = searchParams.get('listing')

  // Fast path for header badge
  if (searchParams.get('unreadCount') === '1') {
    const unread = await prisma.message.count({
      where: { receiverId: userId, read: false }
    })
    return NextResponse.json({ unread })
  }

  if (withUserId) {
    const where = {
      AND: [
        {
          OR: [
            { senderId: userId, receiverId: withUserId },
            { senderId: withUserId, receiverId: userId },
          ],
        },
        ...(listingId ? [{ listingId }] : []),
      ],
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: { listing: { select: { id: true, title: true } } },
    })
    await prisma.message.updateMany({
      where: { senderId: withUserId, receiverId: userId, read: false, ...(listingId ? { listingId } : {}) },
      data: { read: true }
    })
    return NextResponse.json({ messages })
  }

  // Get all conversations
  const all = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }]
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } },
      listing: { select: { id: true, title: true } }
    }
  })

  // Group by conversation partner + listing so deal evidence stays scoped
  const conversations: any = {}
  for (const msg of all) {
    const partnerId: string = msg.senderId === userId ? msg.receiverId : msg.senderId
    const key = `${partnerId}:${msg.listingId || 'direct'}`
    if (!conversations[key]) {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender
      conversations[key] = {
        partnerId,
        partner,
        lastMessage: msg,
        unread: 0,
        listing: msg.listing
      }
    }
    if (msg.receiverId === userId && !msg.read) {
      conversations[key].unread++
    }
  }

  return NextResponse.json({ conversations: Object.values(conversations) })
}

export async function POST(request: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Message rate limit: 30 messages per minute
  if (await isRateLimited(`messages:${userId}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Занадто багато повідомлень. Спробуйте через кілька секунд.' }, { status: 429 })
  }

  const validation = messageSchema.safeParse(await request.json())
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.toString() }, { status: 400 })
  }

  const { receiverId, text, listingId } = validation.data
  if (receiverId === userId) return NextResponse.json({ error: 'Не можна надсилати повідомлення самому собі' }, { status: 400 })

  const receiver = listingId
    ? null
    : await prisma.user.findUnique({ where: { id: receiverId }, select: { id: true } })
  if (!listingId && !receiver) return NextResponse.json({ error: 'Отримувача не знайдено' }, { status: 404 })

  if (listingId) {
    const access = await canAttachListingToConversation(listingId, userId, receiverId)
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const message = await prisma.message.create({
    data: {
      senderId: userId,
      receiverId,
      text: text.trim(),
      listingId: listingId || null
    },
    include: { listing: { select: { id: true, title: true } } },
  })

  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: 'message',
      title: 'Нове повідомлення',
      message: `${session?.user?.name || 'Учасник'}: ${text.trim().slice(0, 60)}`,
      listingId: listingId || undefined,
    }
  })

  return NextResponse.json({ message })
}
