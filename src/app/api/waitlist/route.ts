import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/waitlist - Add email to waitlist
export async function POST(request: Request) {
  try {
    const { email, type, source = 'homepage' } = await request.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Вкажіть коректний email' },
        { status: 400 }
      )
    }

    // Validate type
    if (!type || !['seller', 'buyer'].includes(type)) {
      return NextResponse.json(
        { error: 'Вкажіть тип: seller або buyer' },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Check if already exists
    const existing = await (prisma as any).waitlistEmail.findFirst({
      where: {
        email: normalizedEmail,
        type,
      },
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Ви вже в списку очікування!',
        alreadyRegistered: true,
      })
    }

    // Create waitlist entry
    const entry = await (prisma as any).waitlistEmail.create({
      data: {
        email: normalizedEmail,
        type,
        source,
        notified: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Дякуємо! Ви додані до списку очікування.',
      id: entry.id,
    })
  } catch (error: any) {
    console.error('Waitlist error:', error)
    return NextResponse.json(
      { error: 'Помилка збереження. Спробуйте пізніше.' },
      { status: 500 }
    )
  }
}

// GET /api/waitlist - Get waitlist stats (admin only)
export async function GET() {
  try {
    // In production, add auth check here
    const totalSellers = await (prisma as any).waitlistEmail.count({
      where: { type: 'seller' },
    })
    const totalBuyers = await (prisma as any).waitlistEmail.count({
      where: { type: 'buyer' },
    })

    return NextResponse.json({
      stats: {
        sellers: totalSellers,
        buyers: totalBuyers,
        total: totalSellers + totalBuyers,
      },
    })
  } catch (error: any) {
    console.error('Waitlist stats error:', error)
    return NextResponse.json(
      { error: 'Помилка отримання статистики' },
      { status: 500 }
    )
  }
}
