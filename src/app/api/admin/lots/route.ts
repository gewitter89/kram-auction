import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/getCurrentUser'
import { notifyNewLot } from '@/lib/telegram'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const lots = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { name: true, email: true } },
        _count: { select: { bids: true } }
      }
    })

    return NextResponse.json(lots)
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


export async function PATCH(request: Request) {
  try {
    await requireAdmin()

    const { lotId, action } = await request.json()
    if (!lotId || typeof lotId !== 'string') {
      return NextResponse.json({ error: 'lotId is required' }, { status: 400 })
    }

    const existingLot = await prisma.listing.findUnique({ where: { id: lotId }, select: { duration: true, title: true, startPrice: true, status: true } })
    if (!existingLot) return NextResponse.json({ error: 'Lot not found' }, { status: 404 })

    const actionMap: Record<string, { status?: string; featured?: boolean; endsAt?: Date }> = {
      hide: { status: 'cancelled' },
      restore: { status: 'active' },
      end: { status: 'ended' },
      approve: { status: 'active', endsAt: new Date(Date.now() + Number(existingLot.duration || 7) * 24 * 60 * 60 * 1000) },
      reject: { status: 'rejected' },
      feature: { featured: true },
      unfeature: { featured: false },
    }

    const data = actionMap[action]
    if (!data) {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    const lot = await prisma.listing.update({
      where: { id: lotId },
      data,
    })

    if (action === 'approve') {
      notifyNewLot({ title: lot.title, startPrice: lot.startPrice, id: lot.id }).catch(console.error)
      await prisma.notification.create({
        data: {
          userId: lot.sellerId,
          type: 'listing_approved',
          title: 'Лот опубліковано',
          message: `Ваш лот "${lot.title}" пройшов модерацію та доступний у каталозі.`,
          listingId: lot.id,
        }
      }).catch(() => {})
    }

    if (action === 'reject') {
      await prisma.notification.create({
        data: {
          userId: lot.sellerId,
          type: 'listing_rejected',
          title: 'Лот відхилено модератором',
          message: `Ваш лот "${lot.title}" не пройшов модерацію. Оновіть опис/фото або зверніться в підтримку.`,
          listingId: lot.id,
        }
      }).catch(() => {})
    }

    await prisma.auditLog.create({
      data: {
        action: `admin_lot_${action}`,
        metadata: JSON.stringify({ lotId, status: lot.status, featured: lot.featured }),
      }
    }).catch(() => {})

    return NextResponse.json({ success: true, lot })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('Patch lot error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json().catch(() => ({}))
    const { lotId, deleteAllFake } = body

    if (deleteAllFake) {
      const testEmails = [
        'admin@kram.ua',
        'tech@test.com',
        'apple@test.com',
        'game@test.com',
        'home@test.com',
        'ivan@test.com',
        'maria@test.com',
        'drone@test.com',
        'bike@test.com',
        'alex@test.com',
        'admin@lotva.ua',
      ]

      const testUsers = await prisma.user.findMany({
        where: { email: { in: testEmails } },
        select: { id: true }
      })
      const testUserIds = testUsers.map(u => u.id)

      const testListings = await prisma.listing.findMany({
        where: { sellerId: { in: testUserIds } },
        select: { id: true }
      })
      const testListingIds = testListings.map(l => l.id)

      await prisma.$transaction(async (tx) => {
        await tx.bid.deleteMany({ where: { listingId: { in: testListingIds } } })
        await tx.favorite.deleteMany({ where: { listingId: { in: testListingIds } } })
        await tx.message.deleteMany({ where: { listingId: { in: testListingIds } } })
        await tx.report.deleteMany({ where: { listingId: { in: testListingIds } } })
        await tx.transaction.deleteMany({ where: { listingId: { in: testListingIds } } })
        await tx.review.deleteMany({ where: { listingId: { in: testListingIds } } })
        await tx.listing.deleteMany({ where: { id: { in: testListingIds } } })
      })

      return NextResponse.json({ success: true, countDeleted: testListings.length })
    }

    if (!lotId) {
      return NextResponse.json({ error: 'lotId is required' }, { status: 400 })
    }

    // Cascade delete related records
    await prisma.$transaction(async (tx) => {
      await tx.bid.deleteMany({ where: { listingId: lotId } })
      await tx.favorite.deleteMany({ where: { listingId: lotId } })
      await tx.message.deleteMany({ where: { listingId: lotId } })
      await tx.report.deleteMany({ where: { listingId: lotId } })
      await tx.transaction.deleteMany({ where: { listingId: lotId } })
      await tx.review.deleteMany({ where: { listingId: lotId } })
      await tx.listing.delete({ where: { id: lotId } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('Delete lot error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
