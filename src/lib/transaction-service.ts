import { prisma } from './prisma'
import { logAuditEvent } from './logger'
import { sendTelegramMessage } from './telegram'
import { absoluteUrl } from './site-url'

// Transaction Status Types
export const TransactionStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  TERMS_AGREED: 'TERMS_AGREED',
  PAID_HELD: 'PAID_HELD', // legacy/LiqPay status kept for older records
  SELLER_SHIPPED: 'SELLER_SHIPPED',
  BUYER_RECEIVED: 'BUYER_RECEIVED',
  COMPLETED: 'COMPLETED',
  DISPUTED: 'DISPUTED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const

export const PaymentStatus = {
  NOT_PAID: 'NOT_PAID',
  PENDING: 'PENDING',
  PAID: 'PAID',
  HELD: 'HELD',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
} as const

export const DeliveryStatus = {
  NOT_SHIPPED: 'NOT_SHIPPED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CONFIRMED: 'CONFIRMED',
} as const

export const TransactionEventType = {
  TRANSACTION_CREATED: 'TRANSACTION_CREATED',
  TRANSACTION_TERMS_AGREED: 'TRANSACTION_TERMS_AGREED',
  TRANSACTION_MARKED_PAID: 'TRANSACTION_MARKED_PAID', // legacy event name
  TRANSACTION_SHIPPED: 'TRANSACTION_SHIPPED',
  TRANSACTION_RECEIVED: 'TRANSACTION_RECEIVED',
  TRANSACTION_COMPLETED: 'TRANSACTION_COMPLETED',
  TRANSACTION_DISPUTED: 'TRANSACTION_DISPUTED',
  TRANSACTION_CANCELLED: 'TRANSACTION_CANCELLED',
  TRANSACTION_REFUNDED: 'TRANSACTION_REFUNDED',
  TRANSACTION_DISPUTE_RESOLVED_RELEASE: 'TRANSACTION_DISPUTE_RESOLVED_RELEASE',
  TRANSACTION_DISPUTE_RESOLVED_REFUND: 'TRANSACTION_DISPUTE_RESOLVED_REFUND',
  DELIVERY_UPDATE: 'DELIVERY_UPDATE',
} as const

// Helper to create transaction event
export async function createTransactionEvent(
  transactionId: string,
  type: string,
  actorId: string | null,
  fromStatus: string | null,
  toStatus: string | null,
  message?: string,
  metadata?: unknown
) {
  try {
    await prisma.transactionEvent.create({
      data: {
        transactionId,
        actorId,
        type,
        fromStatus,
        toStatus,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })
  } catch (error) {
    console.error('Failed to create transaction event:', error)
  }
}

// Helper to create notification
async function createNotification(userId: string, type: string, title: string, message: string, listingId?: string) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        listingId,
      },
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

// Helper to send Telegram notification to user
async function notifyUserTelegram(userId: string, message: string) {
  try {
    const sub = await prisma.telegramSubscription.findFirst({
      where: { userId, isActive: true },
    })
    if (sub) {
      await sendTelegramMessage(sub.chatId, message)
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error)
  }
}

// Create transaction from Buy Now
export async function createTransactionFromBuyNow(
  listingId: string,
  buyerId: string,
  deliveryInfo?: {
    recipientName: string;
    recipientPhone: string;
    deliveryCity: string;
    deliveryWarehouse: string;
    deliveryAddress?: string;
  },
  ip?: string,
  userAgent?: string,
  idempotencyKey?: string
) {
  // Check idempotency first
  if (idempotencyKey) {
    const existingByKey = await prisma.transaction.findFirst({
      where: { idempotencyKey },
    })
    if (existingByKey) {
      // Return existing transaction instead of error
      return existingByKey
    }
  }

  // Check for existing active transaction on this listing
  const existing = await prisma.transaction.findFirst({
    where: {
      listingId,
      status: { notIn: ['COMPLETED', 'CANCELLED', 'REFUNDED'] },
    },
  })

  if (existing) {
    throw new Error('TRANSACTION_EXISTS')
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { seller: { select: { id: true, name: true } } },
  })

  if (!listing) {
    throw new Error('LISTING_NOT_FOUND')
  }

  if (!listing.buyNowPrice) {
    throw new Error('NO_BUY_NOW_PRICE')
  }

  if (listing.sellerId === buyerId) {
    throw new Error('CANNOT_BUY_OWN')
  }

  if (listing.status !== 'active') {
    throw new Error('LISTING_NOT_ACTIVE')
  }

  // Update listing
  await prisma.listing.update({
    where: { id: listingId },
    data: { status: 'sold', currentPrice: listing.buyNowPrice },
  })

  // Create transaction with new status
  const transaction = await prisma.transaction.create({
    data: {
      listingId,
      buyerId,
      sellerId: listing.sellerId,
      amount: listing.buyNowPrice,
      currency: 'UAH',
      status: TransactionStatus.PENDING_PAYMENT,
      paymentStatus: PaymentStatus.NOT_PAID,
      deliveryStatus: DeliveryStatus.NOT_SHIPPED,
      recipientName: deliveryInfo?.recipientName,
      recipientPhone: deliveryInfo?.recipientPhone,
      deliveryCity: deliveryInfo?.deliveryCity,
      deliveryWarehouse: deliveryInfo?.deliveryWarehouse,
      deliveryAddress: deliveryInfo?.deliveryAddress,
      idempotencyKey,
    },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, id: true } },
      seller: { select: { name: true, id: true } },
    },
  })

  // Create bid for history
  await prisma.bid.create({
    data: {
      listingId,
      userId: buyerId,
      amount: listing.buyNowPrice,
    },
  })

  // Create event (best-effort)
  try {
    await createTransactionEvent(
      transaction.id,
      TransactionEventType.TRANSACTION_CREATED,
      buyerId,
      null,
      TransactionStatus.PENDING_PAYMENT,
      'Транзакцію створено через Купити зараз',
      { source: 'buy_now', amount: listing.buyNowPrice }
    )
  } catch (e) { console.error('Failed to create event:', e) }

  // Audit log (best-effort)
  try {
    await logAuditEvent({
      userId: buyerId,
      action: 'transaction_created_buy_now',
      ip,
      userAgent,
      metadata: { transactionId: transaction.id, listingId, amount: listing.buyNowPrice },
    })
  } catch (e) { console.error('Failed to log audit:', e) }

  // Notifications (best-effort)
  try {
    await createNotification(
      transaction.sellerId,
      'sold',
      '✅ Лот зарезервовано!',
      `Покупець зарезервував "${transaction.listing.title}" за ${transaction.amount} ₴. Узгодьте оплату й доставку напряму.`,
      listingId
    )
  } catch (e) { console.error('Failed to notify seller:', e) }

  try {
    await createNotification(
      buyerId,
      'purchase',
      '✅ Лот зарезервовано',
      `Ви зарезервували "${transaction.listing.title}" за ${transaction.amount} ₴. Узгодьте оплату й доставку з продавцем.`,
      listingId
    )
  } catch (e) { console.error('Failed to notify buyer:', e) }

  // Telegram notifications (best-effort)
  try {
    await notifyUserTelegram(
      transaction.sellerId,
      `✅ <b>Лот зарезервовано!</b>\n\n📦 "${transaction.listing.title}"\n💰 ${transaction.amount} ₴\n👤 Покупець: ${transaction.buyer.name}\n\n<a href="${absoluteUrl('/cabinet?tab=sales')}">Перейти в кабінет →</a>`
    )
  } catch (e) { console.error('Failed to send Telegram to seller:', e) }

  try {
    await notifyUserTelegram(
      buyerId,
      `✅ <b>Лот зарезервовано!</b>\n\n📦 "${transaction.listing.title}"\n💰 ${transaction.amount} ₴\n\nУзгодьте оплату й доставку з продавцем у чаті.\n\n<a href="${absoluteUrl('/cabinet?tab=purchases')}">Перейти в кабінет →</a>`
    )
  } catch (e) { console.error('Failed to send Telegram to buyer:', e) }

  return transaction
}

// Create transaction from Auction Win
export async function createTransactionFromAuctionWin(
  listingId: string,
  buyerId: string,
  finalPrice: number,
  deliveryInfo?: {
    recipientName: string;
    recipientPhone: string;
    deliveryCity: string;
    deliveryWarehouse: string;
    deliveryAddress?: string;
  },
  actorId: string | null = null, // null for system/cron
  idempotencyKey?: string
) {
  // Check idempotency first
  if (idempotencyKey) {
    const existingByKey = await prisma.transaction.findFirst({
      where: { idempotencyKey },
    })
    if (existingByKey) {
      return existingByKey
    }
  }

  // Check for existing active transaction
  const existing = await prisma.transaction.findFirst({
    where: {
      listingId,
      status: { notIn: ['COMPLETED', 'CANCELLED', 'REFUNDED'] },
    },
  })

  if (existing) {
    throw new Error('TRANSACTION_EXISTS')
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { seller: { select: { id: true, name: true } } },
  })

  if (!listing) {
    throw new Error('LISTING_NOT_FOUND')
  }

  // Update listing
  await prisma.listing.update({
    where: { id: listingId },
    data: { status: 'sold', currentPrice: finalPrice },
  })

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      listingId,
      buyerId,
      sellerId: listing.sellerId,
      amount: finalPrice,
      currency: 'UAH',
      status: TransactionStatus.PENDING_PAYMENT,
      paymentStatus: PaymentStatus.NOT_PAID,
      deliveryStatus: DeliveryStatus.NOT_SHIPPED,
      recipientName: deliveryInfo?.recipientName,
      recipientPhone: deliveryInfo?.recipientPhone,
      deliveryCity: deliveryInfo?.deliveryCity,
      deliveryWarehouse: deliveryInfo?.deliveryWarehouse,
      deliveryAddress: deliveryInfo?.deliveryAddress,
      idempotencyKey,
    },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, id: true } },
      seller: { select: { name: true, id: true } },
    },
  })

  // Side-effects: best-effort
  try {
    await createTransactionEvent(
      transaction.id,
      TransactionEventType.TRANSACTION_CREATED,
      actorId,
      null,
      TransactionStatus.PENDING_PAYMENT,
      'Транзакцію створено після перемоги в аукціоні',
      { source: 'auction_win', amount: finalPrice }
    )
  } catch (e) { console.error('Event failed:', e) }

  try {
    await logAuditEvent({
      userId: actorId || undefined,
      action: 'transaction_created_auction_win',
      metadata: { transactionId: transaction.id, listingId, amount: finalPrice },
    })
  } catch (e) { console.error('Audit failed:', e) }

  try {
    await createNotification(
      transaction.sellerId,
      'sold',
      '🎉 Лот продано на аукціоні!',
      `Ваш лот "${transaction.listing.title}" виграли на аукціоні за ${transaction.amount} ₴. Узгодьте оплату й доставку з покупцем напряму.`,
      listingId
    )
  } catch (e) { console.error('Notification failed:', e) }

  try {
    await createNotification(
      buyerId,
      'won',
      '🎉 Ви виграли аукціон!',
      `Вітаємо! Ви виграли "${transaction.listing.title}" за ${transaction.amount} ₴. Узгодьте оплату й доставку з продавцем.`,
      listingId
    )
  } catch (e) { console.error('Notification failed:', e) }

  try {
    await notifyUserTelegram(
      transaction.sellerId,
      `🎉 <b>Лот продано на аукціоні!</b>\n\n📦 "${transaction.listing.title}"\n💰 ${transaction.amount} ₴\n\n<a href="${absoluteUrl('/cabinet?tab=sales')}">Перейти в кабінет →</a>`
    )
  } catch (e) { console.error('Telegram failed:', e) }

  try {
    await notifyUserTelegram(
      buyerId,
      `🎉 <b>Ви виграли аукціон!</b>\n\n📦 "${transaction.listing.title}"\n💰 ${transaction.amount} ₴\n\nУзгодьте оплату й доставку з продавцем у чаті.\n\n<a href="${absoluteUrl('/cabinet?tab=purchases')}">Перейти в кабінет →</a>`
    )
  } catch (e) { console.error('Telegram failed:', e) }

  return transaction
}

// Buyer confirms that direct payment/delivery terms were agreed (no KRAM escrow/payment)
export async function markTransactionTermsAgreed(
  transactionId: string,
  buyerId: string,
  ip?: string,
  userAgent?: string
) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, id: true } },
      seller: { select: { name: true, id: true } },
    },
  })

  if (!transaction) {
    throw new Error('TRANSACTION_NOT_FOUND')
  }

  if (transaction.buyerId !== buyerId) {
    throw new Error('FORBIDDEN')
  }

  if (transaction.status !== TransactionStatus.PENDING_PAYMENT) {
    throw new Error('INVALID_STATUS')
  }

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: TransactionStatus.TERMS_AGREED,
      paymentStatus: PaymentStatus.NOT_PAID,
      buyerConfirmedAt: new Date(),
    },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, id: true } },
      seller: { select: { name: true, id: true } },
    },
  })

  // Side-effects: best-effort
  try {
    await createTransactionEvent(
      transactionId,
      TransactionEventType.TRANSACTION_TERMS_AGREED,
      buyerId,
      TransactionStatus.PENDING_PAYMENT,
      TransactionStatus.TERMS_AGREED,
      'Покупець підтвердив, що умови оплати й доставки узгоджено',
      { note: 'Пряма домовленість: KRAM не приймає оплату й не утримує кошти' }
    )
  } catch (e) { console.error('Event creation failed:', e) }

  try {
    await logAuditEvent({
      userId: buyerId,
      action: 'transaction_terms_agreed',
      ip,
      userAgent,
      metadata: { transactionId, fromStatus: TransactionStatus.PENDING_PAYMENT, toStatus: TransactionStatus.TERMS_AGREED },
    })
  } catch (e) { console.error('Audit log failed:', e) }

  try {
    await createNotification(
      transaction.sellerId,
      'payment_confirmed',
      '✅ Умови узгоджено!',
      `Покупець підтвердив узгодження умов за "${transaction.listing.title}". Відправте товар узгодженим способом та вкажіть номер накладної.`,
      transaction.listingId
    )
  } catch (e) { console.error('Notification failed:', e) }

  try {
    await notifyUserTelegram(
      transaction.sellerId,
      `✅ <b>Умови узгоджено!</b>\n\n📦 "${transaction.listing.title}"\n💰 ${transaction.amount} ₴\n\nВідправте товар узгодженим способом та вкажіть номер накладної.\n\n<a href="${absoluteUrl('/cabinet?tab=sales')}">Вказати відправлення →</a>`
    )
  } catch (e) { console.error('Telegram failed:', e) }

  return updated
}

// Ship transaction (seller action)
export async function shipTransaction(
  transactionId: string,
  sellerId: string,
  trackingNumber: string,
  deliveryProvider: string,
  ip?: string,
  userAgent?: string
) {
  if (!trackingNumber || !deliveryProvider) {
    throw new Error('MISSING_DELIVERY_INFO')
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, id: true } },
      seller: { select: { name: true, id: true } },
    },
  })

  if (!transaction) {
    throw new Error('TRANSACTION_NOT_FOUND')
  }

  if (transaction.sellerId !== sellerId) {
    throw new Error('FORBIDDEN')
  }

  if (![TransactionStatus.TERMS_AGREED, TransactionStatus.PAID_HELD].includes(transaction.status as any)) {
    throw new Error('INVALID_STATUS')
  }

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: TransactionStatus.SELLER_SHIPPED,
      deliveryStatus: DeliveryStatus.SHIPPED,
      trackingNumber,
      deliveryProvider,
      sellerShippedAt: new Date(),
    },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, id: true } },
      seller: { select: { name: true, id: true } },
    },
  })

  // Side-effects: best-effort
  try {
    await createTransactionEvent(
      transactionId,
      TransactionEventType.TRANSACTION_SHIPPED,
      sellerId,
      transaction.status,
      TransactionStatus.SELLER_SHIPPED,
      `Продавець відправив товар через ${deliveryProvider}`,
      { trackingNumber, deliveryProvider }
    )
  } catch (e) { console.error('Event failed:', e) }

  try {
    await logAuditEvent({
      userId: sellerId,
      action: 'transaction_shipped',
      ip,
      userAgent,
      metadata: { transactionId, trackingNumber, deliveryProvider },
    })
  } catch (e) { console.error('Audit failed:', e) }

  try {
    await createNotification(
      transaction.buyerId,
      'shipped',
      '🚚 Товар відправлено!',
      `Продавець відправив "${transaction.listing.title}" через ${deliveryProvider}. Номер накладної: ${trackingNumber}. Після отримання підтвердіть угоду.`,
      transaction.listingId
    )
  } catch (e) { console.error('Notification failed:', e) }

  try {
    await notifyUserTelegram(
      transaction.buyerId,
      `🚚 <b>Товар відправлено!</b>\n\n📦 "${transaction.listing.title}"\n🚚 ${deliveryProvider}\n📋 Накладна: ${trackingNumber}\n\nПісля отримання підтвердіть угоду в кабінеті.\n\n<a href="${absoluteUrl('/cabinet?tab=purchases')}">Підтвердити отримання →</a>`
    )
  } catch (e) { console.error('Telegram failed:', e) }

  return updated
}

// Confirm received (buyer action)
export async function confirmTransactionReceived(
  transactionId: string,
  buyerId: string,
  ip?: string,
  userAgent?: string
) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, id: true } },
      seller: { select: { name: true, id: true } },
    },
  })

  if (!transaction) {
    throw new Error('TRANSACTION_NOT_FOUND')
  }

  if (transaction.buyerId !== buyerId) {
    throw new Error('FORBIDDEN')
  }

  if (transaction.status !== TransactionStatus.SELLER_SHIPPED) {
    throw new Error('INVALID_STATUS')
  }

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: TransactionStatus.COMPLETED,
      paymentStatus: PaymentStatus.NOT_PAID,
      deliveryStatus: DeliveryStatus.CONFIRMED,
      completedAt: new Date(),
    },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, id: true } },
      seller: { select: { name: true, id: true } },
    },
  })

  // Side-effects: best-effort
  try {
    await createTransactionEvent(
      transactionId,
      TransactionEventType.TRANSACTION_COMPLETED,
      buyerId,
      TransactionStatus.SELLER_SHIPPED,
      TransactionStatus.COMPLETED,
      'Покупець підтвердив отримання, домовленість завершено.'
    )
  } catch (e) { console.error('Event failed:', e) }

  try {
    await logAuditEvent({
      userId: buyerId,
      action: 'transaction_completed',
      ip,
      userAgent,
      metadata: { transactionId },
    })
  } catch (e) { console.error('Audit failed:', e) }

  try {
    await createNotification(
      transaction.sellerId,
      'completed',
      '✅ Угода завершена!',
      `Покупець підтвердив отримання "${transaction.listing.title}". Домовленість завершено.`,
      transaction.listingId
    )
  } catch (e) { console.error('Notification failed:', e) }

  try {
    await createNotification(
      buyerId,
      'completed',
      '✅ Угода завершена!',
      `Ви підтвердили отримання "${transaction.listing.title}". Дякуємо, що користуєтесь KRAM!`,
      transaction.listingId
    )
  } catch (e) { console.error('Notification failed:', e) }

  try {
    await notifyUserTelegram(
      transaction.sellerId,
      `✅ <b>Угода завершена!</b>\n\n📦 "${transaction.listing.title}"\n💰 ${transaction.amount} ₴\n\nПокупець підтвердив отримання. Дякуємо за співпрацю!`
    )
  } catch (e) { console.error('Telegram failed:', e) }

  try {
    await notifyUserTelegram(
      buyerId,
      `✅ <b>Угода завершена!</b>\n\n📦 "${transaction.listing.title}"\n\nЗалиште відгук про продавця після завершеної домовленості.\n\n<a href="${absoluteUrl('/cabinet?tab=purchases')}">Залишити відгук →</a>`
    )
  } catch (e) { console.error('Telegram failed:', e) }

  return updated
}

// Open dispute (buyer or seller)
export async function openTransactionDispute(
  transactionId: string,
  actorId: string,
  reason: string,
  ip?: string,
  userAgent?: string
) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, id: true } },
      seller: { select: { name: true, id: true } },
    },
  })

  if (!transaction) {
    throw new Error('TRANSACTION_NOT_FOUND')
  }

  // Only buyer or seller can open dispute
  if (transaction.buyerId !== actorId && transaction.sellerId !== actorId) {
    throw new Error('FORBIDDEN')
  }

  // Can only dispute after terms are agreed or shipment started
  const disputableStatuses: string[] = [TransactionStatus.TERMS_AGREED, TransactionStatus.PAID_HELD, TransactionStatus.SELLER_SHIPPED]
  if (!disputableStatuses.includes(transaction.status)) {
    throw new Error('INVALID_STATUS')
  }

  const isBuyer = transaction.buyerId === actorId
  const otherPartyId = isBuyer ? transaction.sellerId : transaction.buyerId
  const actorType = isBuyer ? 'Покупець' : 'Продавець'

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: TransactionStatus.DISPUTED,
      disputedAt: new Date(),
    },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, id: true } },
      seller: { select: { name: true, id: true } },
    },
  })

  // Side-effects: best-effort
  try {
    await createTransactionEvent(
      transactionId,
      TransactionEventType.TRANSACTION_DISPUTED,
      actorId,
      transaction.status,
      TransactionStatus.DISPUTED,
      `${actorType} відкрив спір: ${reason}`,
      { reason, openedBy: isBuyer ? 'buyer' : 'seller' }
    )
  } catch (e) { console.error('Event failed:', e) }

  try {
    await logAuditEvent({
      userId: actorId,
      action: 'transaction_disputed',
      ip,
      userAgent,
      metadata: { transactionId, reason, openedBy: isBuyer ? 'buyer' : 'seller' },
    })
  } catch (e) { console.error('Audit failed:', e) }

  try {
    await createNotification(
      otherPartyId,
      'disputed',
      '⚠️ Відкрито спір!',
      `${actorType} відкрив спір за угодою "${transaction.listing.title}". Причина: ${reason}. Команда KRAM розгляне ситуацію.`,
      transaction.listingId
    )
  } catch (e) { console.error('Notification failed:', e) }

  try {
    await notifyUserTelegram(
      otherPartyId,
      `⚠️ <b>Відкрито спір!</b>\n\n📦 "${transaction.listing.title}"\n👤 ${actorType}\n📝 Причина: ${reason}\n\nКоманда KRAM розгляне ситуацію та зв'яжеться з вами.`
    )
  } catch (e) { console.error('Telegram failed:', e) }

  return updated
}

// Cancel transaction (buyer, seller, or admin — before shipment)
export async function cancelTransaction(
  transactionId: string,
  actorId: string,
  actorRole: string,
  ip?: string,
  userAgent?: string
) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, id: true } },
      seller: { select: { name: true, id: true } },
    },
  })

  if (!transaction) {
    throw new Error('TRANSACTION_NOT_FOUND')
  }

  // Only buyer, seller, or admin can cancel
  const isBuyer = transaction.buyerId === actorId
  const isSeller = transaction.sellerId === actorId
  const isAdmin = actorRole === 'admin'

  if (!isBuyer && !isSeller && !isAdmin) {
    throw new Error('FORBIDDEN')
  }

  // Can only cancel before shipment/dispute/completion
  const cancellableStatuses: string[] = [TransactionStatus.PENDING_PAYMENT, TransactionStatus.TERMS_AGREED, TransactionStatus.PAID_HELD]
  if (!cancellableStatuses.includes(transaction.status)) {
    throw new Error('INVALID_STATUS')
  }

  // Update transaction
  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: TransactionStatus.CANCELLED,
      cancelledAt: new Date(),
    },
  })

  // Optionally reactivate listing
  await prisma.listing.update({
    where: { id: transaction.listingId },
    data: { status: 'active' },
  })

  // Side-effects: best-effort
  try {
    await createTransactionEvent(
      transactionId,
      TransactionEventType.TRANSACTION_CANCELLED,
      actorId,
      transaction.status,
      TransactionStatus.CANCELLED,
      `Угоду скасовано ${isAdmin ? 'адміністратором' : isBuyer ? 'покупцем' : 'продавцем'}`
    )
  } catch (e) { console.error('Event failed:', e) }

  try {
    await logAuditEvent({
      userId: actorId,
      action: 'transaction_cancelled',
      ip,
      userAgent,
      metadata: { transactionId, cancelledBy: isAdmin ? 'admin' : isBuyer ? 'buyer' : 'seller' },
    })
  } catch (e) { console.error('Audit failed:', e) }

  // Notify other party
  const otherPartyId = isBuyer ? transaction.sellerId : transaction.buyerId
  const actorName = isAdmin ? 'Адміністратор' : isBuyer ? 'Покупець' : 'Продавець'

  try {
    await createNotification(
      otherPartyId,
      'cancelled',
      '❌ Угоду скасовано',
      `${actorName} скасував угоду за "${transaction.listing.title}". Лот знову доступний.`,
      transaction.listingId
    )
  } catch (e) { console.error('Notification failed:', e) }

  try {
    await notifyUserTelegram(
      otherPartyId,
      `❌ <b>Угоду скасовано</b>\n\n📦 "${transaction.listing.title}"\n\n${actorName} скасував угоду. Лот знову доступний у каталозі.`
    )
  } catch (e) { console.error('Telegram failed:', e) }

  return updated
}

// Resolve dispute (admin only)
export async function resolveTransactionDispute(
  transactionId: string,
  adminId: string,
  resolution: 'RELEASE' | 'REFUND' | 'CANCEL',
  adminNote?: string,
  ip?: string,
  userAgent?: string
) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, id: true } },
      seller: { select: { name: true, id: true } },
    },
  })

  if (!transaction) {
    throw new Error('TRANSACTION_NOT_FOUND')
  }

  if (transaction.status !== TransactionStatus.DISPUTED) {
    throw new Error('INVALID_STATUS')
  }

  let updated
  let eventType: string
  let resolutionText: string

  if (resolution === 'RELEASE') {
    updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.COMPLETED,
        paymentStatus: PaymentStatus.NOT_PAID,
        completedAt: new Date(),
      },
    })
    eventType = TransactionEventType.TRANSACTION_DISPUTE_RESOLVED_RELEASE
    resolutionText = 'Спір вирішено: домовленість завершено на користь продавця'
  } else if (resolution === 'REFUND') {
    updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.REFUNDED,
        paymentStatus: PaymentStatus.NOT_PAID,
        refundedAt: new Date(),
      },
    })
    eventType = TransactionEventType.TRANSACTION_DISPUTE_RESOLVED_REFUND
    resolutionText = 'Спір вирішено: угоду скасовано на користь покупця'
  } else {
    updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    })
    eventType = TransactionEventType.TRANSACTION_CANCELLED
    resolutionText = 'Спір вирішено: угоду скасовано'
  }

  // Side-effects: best-effort
  try {
    await createTransactionEvent(
      transactionId,
      eventType,
      adminId,
      TransactionStatus.DISPUTED,
      updated.status,
      resolutionText,
      { adminNote, resolution }
    )
  } catch (e) { console.error('Event failed:', e) }

  try {
    await logAuditEvent({
      userId: adminId,
      action: 'transaction_dispute_resolved',
      ip,
      userAgent,
      metadata: { transactionId, resolution, adminNote },
    })
  } catch (e) { console.error('Audit failed:', e) }

  try {
    await createNotification(
      transaction.buyerId,
      'dispute_resolved',
      '⚖️ Спір вирішено',
      `Спір за "${transaction.listing.title}" вирішено адміністратором: ${resolutionText}.`,
      transaction.listingId
    )
  } catch (e) { console.error('Notification failed:', e) }

  try {
    await createNotification(
      transaction.sellerId,
      'dispute_resolved',
      '⚖️ Спір вирішено',
      `Спір за "${transaction.listing.title}" вирішено адміністратором: ${resolutionText}.`,
      transaction.listingId
    )
  } catch (e) { console.error('Notification failed:', e) }

  try {
    await notifyUserTelegram(
      transaction.buyerId,
      `⚖️ <b>Спір вирішено</b>\n\n📦 "${transaction.listing.title}"\n\n${resolutionText}\n\n${adminNote ? `Примітка: ${adminNote}` : ''}`
    )
  } catch (e) { console.error('Telegram failed:', e) }

  try {
    await notifyUserTelegram(
      transaction.sellerId,
      `⚖️ <b>Спір вирішено</b>\n\n📦 "${transaction.listing.title}"\n\n${resolutionText}\n\n${adminNote ? `Примітка: ${adminNote}` : ''}`
    )
  } catch (e) { console.error('Telegram failed:', e) }

  return updated
}

// Get transaction with full details
export async function getTransactionWithDetails(transactionId: string, userId: string, userRole?: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          images: true,
          condition: true,
        },
      },
      buyer: {
        select: {
          id: true,
          name: true,
          avatar: true,
          email: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true,
          email: true,
        },
      },
      events: {
        orderBy: { createdAt: 'asc' },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  })

  if (!transaction) {
    throw new Error('TRANSACTION_NOT_FOUND')
  }

  // Check access
  const isBuyer = transaction.buyerId === userId
  const isSeller = transaction.sellerId === userId
  const isAdmin = userRole === 'admin'

  if (!isBuyer && !isSeller && !isAdmin) {
    throw new Error('FORBIDDEN')
  }

  return {
    ...transaction,
    currentUserId: userId,
    role: isBuyer ? 'buyer' : isSeller ? 'seller' : 'admin',
  }
}

// List transactions for user
export async function listUserTransactions(
  userId: string,
  role?: 'buyer' | 'seller',
  status?: string
) {
  const where: any = {}

  if (role === 'buyer') {
    where.buyerId = userId
  } else if (role === 'seller') {
    where.sellerId = userId
  } else {
    where.OR = [{ buyerId: userId }, { sellerId: userId }]
  }

  if (status) {
    where.status = status
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          images: true,
        },
      },
      buyer: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  })

  return transactions.map((t: typeof transactions[0] & { buyerId: string; sellerId: string }) => ({
    ...t,
    role: t.buyerId === userId ? 'buyer' : 'seller',
  }))
}
