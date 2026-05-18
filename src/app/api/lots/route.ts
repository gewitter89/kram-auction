import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20
    
    const where: any = { status: 'active' }

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

    const data = await request.json()
    const { title, description, categoryId, condition, startPrice, buyNowPrice, reservePrice, featured, minIncrement, duration, city, delivery, images } = data

    if (!title || !startPrice || !duration) {
      return NextResponse.json({ error: "Заповніть обовʼязкові поля" }, { status: 400 })
    }

    let category = await prisma.category.findFirst({ where: { name: categoryId } })
    if (!category) category = await prisma.category.findFirst()

    const endsAt = new Date(Date.now() + Number(duration) * 24 * 60 * 60 * 1000)

    const listing = await prisma.listing.create({
      data: {
        title,
        description: description || '',
        images: JSON.stringify(images || []),
        categoryId: category!.id,
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
      }
    })

    return NextResponse.json({ message: 'Лот створено!', id: listing.id }, { status: 201 })
  } catch (error) {
    console.error('Create lot error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
