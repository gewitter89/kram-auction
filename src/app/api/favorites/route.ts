import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

export async function GET() {
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const favorites = await prisma.favorite.findMany({
    where: { userId: userId },
    include: {
      listing: {
        include: {
          seller: { select: { id: true, name: true, rating: true } },
          category: { select: { name: true, slug: true } },
          _count: { select: { bids: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ favorites: favorites.map(f => f.listing) })
}

export async function POST(request: Request) {
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listingId } = await request.json()
  if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 })

  try {
    await prisma.favorite.create({
      data: { userId: userId, listingId }
    })
    return NextResponse.json({ message: 'Added to favorites' })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ message: 'Already in favorites' })
    }
    throw e
  }
}

export async function DELETE(request: Request) {
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listingId } = await request.json()
  await prisma.favorite.deleteMany({
    where: { userId: userId, listingId }
  })
  return NextResponse.json({ message: 'Removed' })
}
