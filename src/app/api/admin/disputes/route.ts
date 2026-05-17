import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const disputes = await prisma.transaction.findMany({
      where: { status: 'DISPUTED' },
      include: {
        listing: { select: { title: true, id: true } },
        buyer: { select: { id: true, name: true, email: true, phone: true } },
        seller: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ disputes })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching disputes' }, { status: 500 })
  }
}
