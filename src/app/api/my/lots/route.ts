import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const lots = await prisma.listing.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { bids: true } }
    }
  })

  return NextResponse.json({ lots })
}
