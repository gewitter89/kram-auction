import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

export async function GET() {
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const lots = await prisma.listing.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { bids: true } }
    }
  })

  return NextResponse.json({ lots })
}
