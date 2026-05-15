import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'ending'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const city = searchParams.get('city')
    const condition = searchParams.get('condition')
    const type = searchParams.get('type')

    const where: any = { status: 'active' }
    if (category) where.category = { slug: category }
    if (search) where.title = { contains: search }
    if (city) where.city = city
    if (condition) where.condition = condition
    if (type) where.type = type
    if (minPrice || maxPrice) {
      where.currentPrice = {}
      if (minPrice) where.currentPrice.gte = Number(minPrice)
      if (maxPrice) where.currentPrice.lte = Number(maxPrice)
    }

    let baseOrderBy: any = { endsAt: 'asc' }
    if (sort === 'price-asc') baseOrderBy = { currentPrice: 'asc' }
    if (sort === 'price-desc') baseOrderBy = { currentPrice: 'desc' }
    if (sort === 'new') baseOrderBy = { createdAt: 'desc' }
    if (sort === 'bids') baseOrderBy = { bids: { _count: 'desc' } }

    const orderBy = [
      { featured: 'desc' },
      baseOrderBy
    ]

    const [lots, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          seller: { select: { id: true, name: true, rating: true, verified: true } },
          category: { select: { name: true, slug: true } },
          _count: { select: { bids: true } }
        }
      }),
      prisma.listing.count({ where })
    ])

    return NextResponse.json({ lots, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error('Get lots error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
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
        sellerId: session.user.id,
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
