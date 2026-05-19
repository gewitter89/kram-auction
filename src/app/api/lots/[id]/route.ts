import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { createLotSchema, validateBody } from '@/lib/validation'
import { analyzeListingRisk } from '@/lib/listing-risk'

// GET /api/lots/[id] - Get single listing by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            bids: true,
            favorites: true,
          },
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Лот не знайдено' }, { status: 404 })
    }

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Get lot error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}


export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const lot = await prisma.listing.findUnique({
      where: { id },
      include: { _count: { select: { bids: true, transactions: true } } }
    })
    if (!lot) return NextResponse.json({ error: 'Лот не знайдено' }, { status: 404 })
    if (lot.sellerId !== userId && session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (lot._count.bids > 0 || lot._count.transactions > 0) {
      return NextResponse.json({ error: 'Лот зі ставками або угодами не можна редагувати.' }, { status: 400 })
    }
    if (!['rejected', 'pending_review', 'cancelled'].includes(lot.status) && session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Активний лот не можна редагувати через цей endpoint.' }, { status: 400 })
    }

    const body = await request.json()
    const validation = validateBody(createLotSchema, body)
    if (validation.error) return NextResponse.json({ error: validation.error }, { status: 400 })

    const data = validation.data!
    const category = await prisma.category.findFirst({ where: { OR: [{ name: data.categoryId }, { slug: data.categoryId }] } })
    if (!category) return NextResponse.json({ error: 'Категорію не знайдено' }, { status: 400 })

    const images = data.images || []
    const risk = analyzeListingRisk({
      title: data.title,
      description: data.description,
      startPrice: Number(data.startPrice),
      buyNowPrice: data.buyNowPrice ? Number(data.buyNowPrice) : null,
      images,
      existingListingsCount: 0,
    })

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || '',
        images: JSON.stringify(images),
        categoryId: category.id,
        condition: data.condition || 'used',
        city: data.city || '',
        type: data.buyNowPrice ? 'both' : 'auction',
        startPrice: Number(data.startPrice),
        currentPrice: Number(data.startPrice),
        buyNowPrice: data.buyNowPrice ? Number(data.buyNowPrice) : null,
        reservePrice: data.reservePrice ? Number(data.reservePrice) : null,
        minIncrement: Number(data.minIncrement) || 10,
        duration: Number(data.duration),
        delivery: data.delivery || 'nova_poshta',
        featured: Boolean(data.featured),
        status: 'pending_review',
        endsAt: new Date(Date.now() + Number(data.duration) * 24 * 60 * 60 * 1000),
      }
    })

    await prisma.report.create({
      data: {
        userId,
        listingId: id,
        reason: 'listing_moderation_required',
        comment: JSON.stringify({ reasons: risk.reasons.length ? risk.reasons : ['Повторна відправка після редагування'] }),
        status: 'pending',
      }
    }).catch(() => {})

    return NextResponse.json({ success: true, id: updated.id, status: updated.status, moderationReasons: risk.reasons })
  } catch (error) {
    console.error('Update lot error:', error)
    return NextResponse.json({ error: 'Помилка сервера при оновленні лота' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const lot = await prisma.listing.findUnique({
      where: { id },
      include: { _count: { select: { bids: true, transactions: true } } }
    })
    if (!lot) {
      return NextResponse.json({ error: 'Лот не знайдено' }, { status: 404 })
    }

    if (lot.sellerId !== userId && session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Production-safe behaviour: keep audit/history for lots with activity.
    if (lot._count.bids > 0 || lot._count.transactions > 0) {
      await prisma.listing.update({ where: { id }, data: { status: 'cancelled' } })
      return NextResponse.json({ message: 'Лот з історією ставок/угод приховано, а не видалено.' })
    }

    await prisma.favorite.deleteMany({ where: { listingId: id } })
    await prisma.message.updateMany({ where: { listingId: id }, data: { listingId: null } })
    await prisma.notification.deleteMany({ where: { listingId: id } })
    await prisma.report.deleteMany({ where: { listingId: id } })
    await prisma.review.deleteMany({ where: { listingId: id } })
    await prisma.listing.delete({ where: { id } })

    return NextResponse.json({ message: 'Лот видалено успішно' })
  } catch (error) {
    console.error('Delete lot error:', error)
    return NextResponse.json({ error: 'Помилка сервера при видаленні' }, { status: 500 })
  }
}
