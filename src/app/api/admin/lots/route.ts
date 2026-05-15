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

export async function GET() {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const lots = await prisma.listing.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      seller: { select: { name: true, email: true } },
      _count: { select: { bids: true } }
    }
  })

  return NextResponse.json(lots)
}

export async function DELETE(request: Request) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { lotId } = await request.json()

  // We should probably mark as deleted instead of actual delete, but for now...
  await prisma.listing.delete({
    where: { id: lotId }
  })

  return NextResponse.json({ success: true })
}
