import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { createLotSchema, validateBody } from '@/lib/validation'
import { ensureCoreCategories } from '@/lib/marketplace-checks'
import { notifyNewLot } from '@/lib/telegram'
import { publicActiveListingWhere } from '@/lib/public-listing-filters'
import { analyzeListingRisk } from '@/lib/listing-risk'
import { notifySavedSearchMatches } from '@/lib/saved-searches'
import { assertUserAllowed, restrictionErrorMessage } from '@/lib/user-restrictions'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20
    
    const includeSeed = searchParams.get('includeSeed') === '1'
    const where: any = publicActiveListingWhere(includeSeed)


    // Text search
    const search = searchParams.get('search')
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Category filter
    const categorySlug = searchParams.get('category')
    if (categorySlug && categorySlug !== 'all') {
      where.category = { slug: categorySlug }
    }

    // Price range filters
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice || maxPrice) {
      where.currentPrice = {}
      if (minPrice) where.currentPrice.gte = parseFloat(minPrice)
      if (maxPrice) where.currentPrice.lte = parseFloat(maxPrice)
    }

    // City filter
    const city = searchParams.get('city')
    if (city) {
      where.city = { equals: city, mode: 'insensitive' }
    }

    // Condition filter
    const condition = searchParams.get('condition')
    if (condition) {
      where.condition = condition
    }

    // Sale type filter
    const type = searchParams.get('type')
    if (type) {
      if (type === 'auction') {
        where.type = { in: ['auction', 'both'] }
      } else if (type === 'buy_now') {
        where.type = { in: ['buy_now', 'both'] }
      } else if (type === 'both') {
        where.type = 'both'
      }
    }

    // Sorting
    const sort = searchParams.get('sort') || 'ending'
    let orderBy: any = { endsAt: 'asc' } // default "ending" (soonest first)

    if (sort === 'new') {
      orderBy = { createdAt: 'desc' }
    } else if (sort === 'price-asc') {
      orderBy = { currentPrice: 'asc' }
    } else if (sort === 'price-desc') {
      orderBy = { currentPrice: 'desc' }
    } else if (sort === 'bids') {
      orderBy = { bids: { _count: 'desc' } }
    }

    // Fetch listings
    const lots = await prisma.listing.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            verified: true,
            avatar: true
          }
        },
        _count: {
          select: { bids: true }
        }
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    })
    
    const total = await prisma.listing.count({ where })

    return NextResponse.json({ lots, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error: any) {
    console.error('Get lots error:', error)
    return NextResponse.json({ 
      error: 'Помилка сервера', 
      message: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    await assertUserAllowed(userId, 'sell')

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { verified: true }
    })
    if (!user || !user.verified) {
      return NextResponse.json({ error: 'Ваш акаунт не верифіковано для продажу товарів.' }, { status: 403 })
    }

    const body = await request.json()
    const validation = validateBody(createLotSchema, body)
    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { title, description, categoryId, condition, startPrice, buyNowPrice, reservePrice, featured, minIncrement, duration, city, delivery, images } = validation.data!

    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { name: categoryId },
          { slug: categoryId },
        ]
      }
    })
    if (!category) {
      await ensureCoreCategories()
      category = await prisma.category.findFirst({
        where: {
          OR: [
            { name: categoryId },
            { slug: categoryId },
          ]
        }
      })
    }
    if (!category) category = await prisma.category.findFirst()
    if (!category) {
      return NextResponse.json({ error: 'Категорії не налаштовані. Зверніться до адміністратора.' }, { status: 500 })
    }

    const existingListingsCount = await prisma.listing.count({ where: { sellerId: userId } })
    const risk = analyzeListingRisk({
      title,
      description,
      startPrice: Number(startPrice),
      buyNowPrice: buyNowPrice ? Number(buyNowPrice) : null,
      images: images || [],
      existingListingsCount,
    })
    const requiresModeration = risk.requiresModeration
    const endsAt = new Date(Date.now() + Number(duration) * 24 * 60 * 60 * 1000)

    const listing = await prisma.listing.create({
      data: {
        title,
        description: description || '',
        images: JSON.stringify(images || []),
        categoryId: category.id,
        sellerId: userId,
        condition: condition || 'used',
        city: city || '',
        type: buyNowPrice ? 'both' : 'auction',
        startPrice: Number(startPrice),
        currentPrice: Number(startPrice),
        buyNowPrice: buyNowPrice ? Number(buyNowPrice) : null,
        reservePrice: reservePrice ? Number(reservePrice) : null,
        minIncrement: Number(minIncrement) || 10,
        duration: Number(duration),
        delivery: delivery || 'nova_poshta',
        featured: Boolean(featured),
        endsAt,
        status: requiresModeration ? 'pending_review' : 'active',
      }
    })

    if (requiresModeration) {
      await prisma.report.create({
        data: {
          userId,
          listingId: listing.id,
          reason: 'listing_moderation_required',
          comment: JSON.stringify({ reasons: risk.reasons }),
          status: 'pending',
        }
      }).catch(() => {})
    } else {
      notifyNewLot({ title: listing.title, startPrice: listing.startPrice, id: listing.id }).catch(console.error)
      notifySavedSearchMatches(listing.id).catch(console.error)
    }

    return NextResponse.json({
      message: requiresModeration ? 'Лот створено та відправлено на модерацію.' : 'Лот створено!',
      id: listing.id,
      status: listing.status,
      pendingReview: requiresModeration,
      moderationReasons: risk.reasons,
    }, { status: 201 })
  } catch (error) {
    const restrictionMessage = restrictionErrorMessage(error)
    if (restrictionMessage) return NextResponse.json({ error: restrictionMessage }, { status: 403 })
    console.error('Create lot error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
