import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const lot = await prisma.listing.findUnique({ where: { id } })
    if (!lot) {
      return NextResponse.json({ error: 'Лот не знайдено' }, { status: 404 })
    }

    if (lot.sellerId !== userId && session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Since we might have bids, favorites, messages related to this lot, 
    // it's better to perform a soft delete or cascade delete.
    // If Prisma schema doesn't have cascade delete configured, we might need to delete related records first.
    // Let's delete related records manually to be safe.
    await prisma.bid.deleteMany({ where: { listingId: id } })
    await prisma.favorite.deleteMany({ where: { listingId: id } })
    await prisma.message.updateMany({ where: { listingId: id }, data: { listingId: null } })
    await prisma.notification.deleteMany({ where: { listingId: id } })

    await prisma.listing.delete({ where: { id } })

    return NextResponse.json({ message: 'Лот видалено успішно' })
  } catch (error) {
    console.error('Delete lot error:', error)
    return NextResponse.json({ error: 'Помилка сервера при видаленні' }, { status: 500 })
  }
}
