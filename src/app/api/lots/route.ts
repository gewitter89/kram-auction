import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20
    
    // Ultra simple query - no includes
    const lots = await (prisma as any).listing.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })
    
    const total = await (prisma as any).listing.count({ where: { status: 'active' } })

    return NextResponse.json({ lots, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error: any) {
    console.error('Get lots error:', error)
    return NextResponse.json({ 
      error: 'Помилка сервера', 
      message: error?.message || 'Unknown error',
      code: error?.code || 'NO_CODE'
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
