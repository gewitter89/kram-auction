import { prisma } from '@/lib/prisma'
import { eventBus } from '@/lib/eventBus'
import { isRateLimited } from '@/lib/rateLimit'
import { sendOutbidEmail } from '@/lib/email'
import type { Bid, Prisma } from '@prisma/client'

const APP_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

interface PlaceBidResult {
  success: boolean
  message?: string
  newPrice?: number
  error?: string
}

/**
 * Core business logic for placing a bid
 * Handles all validation, anti-sniping, notifications, and SSE events in a transactionally secure way.
 */
export async function placeBid(params: {
  userId: string
  listingId: string
  amount: number
  isAuto?: boolean
  autoMax?: number
}): Promise<PlaceBidResult> {
  const { userId, listingId, amount, isAuto, autoMax } = params

  // Rate limiting
  if (isRateLimited(`bid:${userId}`, 10, 60_000)) {
    return { success: false, error: 'Забагато ставок. Зачекайте хвилину.' }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get listing with seller info
      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        include: { seller: { select: { id: true, name: true, email: true } } }
      })

      if (!listing || listing.status !== 'active') {
        throw new Error('NOT_FOUND_OR_ENDED')
      }

      // Check if auction has ended
      if (new Date(listing.endsAt) <= new Date()) {
        await tx.listing.update({ 
          where: { id: listingId }, 
          data: { status: 'ended' } 
        })
        throw new Error('AUCTION_ENDED')
      }

      // Prevent owner from bidding on own lot
      if (listing.sellerId === userId) {
        throw new Error('CANNOT_BID_OWN')
      }

      // Calculate minimum bid
      const minIncrement = listing.minIncrement || 10
      const minBid = listing.currentPrice + minIncrement

      if (amount < minBid) {
        throw new Error(`MIN_BID:${minBid}`)
      }

      // Validate auto-bid parameters
      if (isAuto && (!autoMax || autoMax < amount + minIncrement)) {
        throw new Error(`AUTO_MAX_INVALID:${amount + minIncrement}`)
      }

      // Get previous top bid for notification
      const previousTopBid = await tx.bid.findFirst({
        where: { listingId, userId: { not: userId } },
        orderBy: { amount: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      })

      // Calculate sniper battle
      let finalAmount = amount
      let finalUserId = userId
      const finalIsAuto = Boolean(isAuto)
      const finalAutoMax = finalIsAuto ? autoMax : null

      // Find highest existing auto-bid from competitor
      const topCompetitor = await tx.bid.findFirst({
        where: { 
          listingId, 
          isAuto: true, 
          userId: { not: userId },
          autoMax: { gte: finalAmount }
        },
        orderBy: { autoMax: 'desc' }
      })

      const newBidsToCreate: Prisma.BidUncheckedCreateInput[] = []

      // Register the base bid from current user
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
            
            newBidsToCreate.push({
              listingId, userId: userId, amount: finalAutoMax, isAuto: true, autoMax: finalAutoMax
            })
            
            newBidsToCreate.push({
              listingId, userId: finalUserId, amount: finalAmount, isAuto: true, autoMax: compMax
            })
          } else {
            // Current user wins
            finalUserId = userId
            finalAmount = Math.min(finalAutoMax, compMax + minIncrement)
            
            newBidsToCreate.push({
              listingId, userId: topCompetitor.userId, amount: compMax, isAuto: true, autoMax: compMax
            })
            
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

      let newlyCreatedBid: Bid | null = null
      let finalEndsAt = listing.endsAt

      // Create all history bids
      for (const b of newBidsToCreate) {
        const created = await tx.bid.create({ data: b })
        if (b.amount === finalAmount) newlyCreatedBid = created
      }

      // Anti-sniping: extend time if less than 2 minutes remaining
      const timeLeft = new Date(listing.endsAt).getTime() - Date.now()
      if (timeLeft < 120000 && timeLeft > 0) {
        finalEndsAt = new Date(Date.now() + 2 * 60 * 1000)
      }

      // Update listing with OPTIMISTIC LOCK checking!
      const updateResult = await tx.listing.updateMany({
        where: { 
          id: listingId,
          currentPrice: listing.currentPrice // Check original currentPrice to prevent lost update race conditions!
        },
        data: { currentPrice: finalAmount, endsAt: finalEndsAt }
      })

      if (updateResult.count === 0) {
        throw new Error('CONCURRENCY_CONFLICT')
      }

      return {
        listing,
        newlyCreatedBid,
        finalAmount,
        finalEndsAt,
        finalUserId,
        previousTopBid
      }
    })

    // Transaction succeeded! Run best-effort async side-effects outside of transaction
    const { listing, newlyCreatedBid, finalAmount, finalEndsAt, finalUserId, previousTopBid } = result

    // Real-time SSE events
    eventBus.emit(`lot_${listingId}`, {
      type: 'new_bid',
      amount: finalAmount,
      endsAt: finalEndsAt.toISOString(),
      userId: finalUserId,
      bid: newlyCreatedBid ? {
        id: newlyCreatedBid.id,
        amount: finalAmount,
        createdAt: new Date().toISOString(),
        user: { name: finalUserId === userId ? 'Ви' : 'Авто-ставка' }
      } : null
    })

    eventBus.emit('global', {
      type: 'bid',
      name: listing.title,
      amount: `+${(finalAmount - listing.currentPrice).toLocaleString('uk-UA')} ₴`,
    })

    // Outbid notification
    if (previousTopBid?.userId && previousTopBid.userId !== finalUserId) {
      // Real-time user alert
      eventBus.emit(`user_${previousTopBid.userId}`, {
        type: 'outbid',
        listingId,
        lotTitle: listing.title,
        amount: finalAmount,
        minIncrement: listing.minIncrement,
      })

      prisma.notification.create({
        data: {
          userId: previousTopBid.userId,
          type: 'outbid',
          title: 'Ставку перебито!',
          message: `Вашу ставку на "${listing.title}" перебито. Нова ціна: ${finalAmount} ₴`,
          listingId
        }
      }).catch(console.error)

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

    return { success: true, message, newPrice: finalAmount }

  } catch (error) {
    if (error instanceof Error) {
      const msg = error.message
      if (msg === 'CONCURRENCY_CONFLICT') {
        return { success: false, error: 'Ставку перебито іншим користувачем. Будь ласка, спробуйте ще раз.' }
      }
      if (msg === 'NOT_FOUND_OR_ENDED') {
        return { success: false, error: 'Лот не знавно або завершено' }
      }
      if (msg === 'AUCTION_ENDED') {
        return { success: false, error: 'Аукціон завершено' }
      }
      if (msg === 'CANNOT_BID_OWN') {
        return { success: false, error: 'Не можна робити ставку на свій лот' }
      }
      if (msg.startsWith('MIN_BID:')) {
        const val = msg.split(':')[1]
        return { success: false, error: `Мінімальна ставка: ${val} ₴` }
      }
      if (msg.startsWith('AUTO_MAX_INVALID:')) {
        return { success: false, error: `Максимальна сума для авто-ставки має бути більшою за вашу ставку` }
      }
    }
    console.error('Bid error:', error)
    return { success: false, error: 'Помилка сервера' }
  }
}
