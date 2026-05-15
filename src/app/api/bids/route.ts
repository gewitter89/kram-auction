import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { eventBus } from '@/lib/eventBus'
import { isRateLimited } from '@/lib/rateLimit'
import { sendOutbidEmail, sendNewBidNotifyEmail } from '@/lib/email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    if (isRateLimited(`bid:${userId}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Забагато ставок. Зачекайте хвилину.' }, { status: 429 })
    }

    const { listingId, amount, isAuto, autoMax } = await request.json()

    if (!listingId || !amount) {
      return NextResponse.json({ error: 'Вкажіть лот та суму' }, { status: 400 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: { select: { id: true, name: true, email: true } } }
    })
    
    if (!listing || listing.status !== 'active') {
      return NextResponse.json({ error: 'Лот не знайдено або завершено' }, { status: 404 })
    }

    if (new Date(listing.endsAt) <= new Date()) {
      await prisma.listing.update({ where: { id: listingId }, data: { status: 'ended' } })
      return NextResponse.json({ error: 'Аукціон завершено' }, { status: 400 })
    }

    if (listing.sellerId === userId) {
      return NextResponse.json({ error: 'Не можна робити ставку на свій лот' }, { status: 400 })
    }

    const minIncrement = listing.minIncrement || 10
    const minBid = listing.currentPrice + minIncrement
    
    if (Number(amount) < minBid) {
      return NextResponse.json({ error: `Мінімальна ставка: ${minBid} ₴` }, { status: 400 })
    }

    if (isAuto && (!autoMax || Number(autoMax) < Number(amount) + minIncrement)) {
      return NextResponse.json({ error: `Максимальна сума для авто-ставки має бути більшою за вашу ставку` }, { status: 400 })
    }

    // Get previous top bid to notify them later
    const previousTopBid = await prisma.bid.findFirst({
      where: { listingId, userId: { not: userId } },
      orderBy: { amount: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    })

    // Calculate sniper battle
    let finalAmount = Number(amount)
    let finalUserId = userId
    const finalIsAuto = Boolean(isAuto)
    const finalAutoMax = finalIsAuto ? Number(autoMax) : null

    // Find the highest existing auto-bid from a competitor
    const topCompetitor = await prisma.bid.findFirst({
      where: { 
        listingId, 
        isAuto: true, 
        userId: { not: userId },
        autoMax: { gte: finalAmount } // Only care if they can match or beat the base amount
      },
      orderBy: { autoMax: 'desc' }
    })

    const newBidsToCreate: any[] =  []

    // Register the base bid from the current user
    newBidsToCreate.push({
      listingId,
      userId: finalUserId,
      amount: finalAmount,
      isAuto: finalIsAuto,
      autoMax: finalAutoMax
    })

    if (topCompetitor && topCompetitor.autoMax) {
      const compMax = topCompetitor.autoMax
      
      if (finalIsAuto && finalAutoMax) {
        // Auto vs Auto battle
        if (compMax >= finalAutoMax) {
          // Competitor wins
          finalUserId = topCompetitor.userId
          finalAmount = Math.min(compMax, finalAutoMax + minIncrement)
          
          // Current user bid exhausted at finalAutoMax
          newBidsToCreate.push({
            listingId, userId: userId, amount: finalAutoMax, isAuto: true, autoMax: finalAutoMax
          })
          
          // Competitor counter-bid
          newBidsToCreate.push({
            listingId, userId: finalUserId, amount: finalAmount, isAuto: true, autoMax: compMax
          })
        } else {
          // Current user wins
          finalUserId = userId
          finalAmount = Math.min(finalAutoMax, compMax + minIncrement)
          
          // Competitor exhausted at compMax
          newBidsToCreate.push({
            listingId, userId: topCompetitor.userId, amount: compMax, isAuto: true, autoMax: compMax
          })
          
          // Current user counter-bid
          newBidsToCreate.push({
            listingId, userId: finalUserId, amount: finalAmount, isAuto: true, autoMax: finalAutoMax
          })
        }
      } else {
        // Auto vs Manual
        if (compMax >= finalAmount) {
          // Competitor outbids manual immediately
          finalUserId = topCompetitor.userId
          finalAmount = Math.min(compMax, finalAmount + minIncrement)
          
          newBidsToCreate.push({
            listingId, userId: finalUserId, amount: finalAmount, isAuto: true, autoMax: compMax
          })
        }
      }
    }

    let newlyCreatedBid: any = null

    // Execute in transaction
    await prisma.$transaction(async (tx) => {
      // Create all history bids
      for (const b of newBidsToCreate) {
        const created = await tx.bid.create({ data: b })
        if (b.amount === finalAmount) newlyCreatedBid = created // The actual final winning bid
      }

      // Extend time (Anti-sniping)
      const timeLeft = new Date(listing.endsAt).getTime() - Date.now()
      let finalEndsAt = listing.endsAt
      if (timeLeft < 30000 && timeLeft > 0) {
        finalEndsAt = new Date(Date.now() + 2 * 60 * 1000)
      }

      // Update listing
      await tx.listing.update({
        where: { id: listingId },
        data: { currentPrice: finalAmount, endsAt: finalEndsAt }
      })
    })

    // Real-time SSE
    eventBus.emit(`lot_${listingId}`, {
      type: 'new_bid',
      amount: finalAmount,
      endsAt: listing.endsAt.toISOString(),
      bid: newlyCreatedBid ? {
        id: newlyCreatedBid.id,
        amount: finalAmount,
        createdAt: new Date().toISOString(),
        user: { name: (finalUserId === userId ? session?.user?.name : 'Авто-ставка') || 'Учасник' }
      } : null
    })

    eventBus.emit('global', {
      type: 'bid',
      name: listing.title,
      amount: `+${(finalAmount - listing.currentPrice).toLocaleString('uk-UA')} ₴`,
      user: (session?.user?.name || 'Учасник').slice(0, 3) + '***' + userId.slice(-2)
    })

    // Outbid Notification
    if (previousTopBid?.userId && previousTopBid.userId !== finalUserId) {
      await prisma.notification.create({
        data: {
          userId: previousTopBid.userId,
          type: 'outbid',
          title: 'Ставку перебито!',
          message: `Вашу ставку на "${listing.title}" перебито. Нова ціна: ${finalAmount} ₴`,
          listingId
        }
      })
      const lotUrl = `${APP_URL}/lot/${listingId}`
      if (previousTopBid.user?.email) {
        sendOutbidEmail({
          to: previousTopBid.user.email,
          name: previousTopBid.user.name || '',
          lotTitle: listing.title,
          lotUrl,
          yourBid: previousTopBid.amount,
          newBid: finalAmount,
        }).catch(console.error)
      }
    }

    const message = finalUserId === userId 
      ? 'Ставку прийнято! Ви лідер.'
      : 'Вашу ставку було миттєво перебито авто-ставкою іншого учасника.'

    return NextResponse.json({ message, newPrice: finalAmount }, { status: 201 })
  } catch (error) {
    console.error('Bid error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
