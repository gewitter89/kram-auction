import { prisma } from './prisma'
import { logAuditEvent } from './logger'
import { sendTelegramMessage } from './telegram'

// Transaction Status Types
export const TransactionStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID_HELD: 'PAID_HELD',
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
  TRANSACTION_MARKED_PAID: 'TRANSACTION_MARKED_PAID',
  TRANSACTION_SHIPPED: 'TRANSACTION_SHIPPED',
  TRANSACTION_RECEIVED: 'TRANSACTION_RECEIVED',
  TRANSACTION_COMPLETED: 'TRANSACTION_COMPLETED',
  TRANSACTION_DISPUTED: 'TRANSACTION_DISPUTED',
  TRANSACTION_CANCELLED: 'TRANSACTION_CANCELLED',
  TRANSACTION_REFUNDED: 'TRANSACTION_REFUNDED',
  TRANSACTION_DISPUTE_RESOLVED_RELEASE: 'TRANSACTION_DISPUTE_RESOLVED_RELEASE',
  TRANSACTION_DISPUTE_RESOLVED_REFUND: 'TRANSACTION_DISPUTE_RESOLVED_REFUND',
} as const

// Helper to create transaction event
async function createTransactionEvent(
  transactionId: string,
  type: string,
  actorId: string | null,
  fromStatus: string | null,
  toStatus: string | null,
  message?: string,
  metadata?: any
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
  ip?: string,
  userAgent?: string
) {
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

  // Create event
  await createTransactionEvent(
    transaction.id,
    TransactionEventType.TRANSACTION_CREATED,
    buyerId,
    null,
    TransactionStatus.PENDING_PAYMENT,
    'Транзакцію створено через Купити зараз',
    { source: 'buy_now', amount: listing.buyNowPrice }
  )

  // Audit log
  await logAuditEvent({
    userId: buyerId,
    action: 'transaction_created_buy_now',
    ip,
    userAgent,
    metadata: { transactionId: transaction.id, listingId, amount: listing.buyNowPrice },
  })

  // Notifications
  await createNotification(
    transaction.sellerId,
    'sold',
    '💰 Лот куплено!',
    `Ваш лот "${transaction.listing.title}" куплено за ${transaction.amount} ₴. Очікуйте підтвердження оплати.`,
    listingId
  )

  await createNotification(
    buyerId,
    'purchase',
    '✅ Покупка успішна',
    `Ви купили "${transaction.listing.title}" за ${transaction.amount} ₴. Підтвердіть оплату для продовження.`,
    listingId
  )

  // Telegram notifications
  await notifyUserTelegram(
    transaction.sellerId,
    `💰 <b>Лот куплено!</b>\n\n📦 "${transaction.listing.title}"\n💰 ${transaction.amount} ₴\n👤 Покупець: ${transaction.buyer.name}\n\n<a href="https://kram-auction.vercel.app/cabinet">Перейти в кабінет →</a>`
  )

  await notifyUserTelegram(
    buyerId,
    `✅ <b>Покупка успішна!</b>\n\n📦 "${transaction.listing.title}"\n💰 ${transaction.amount} ₴\n\nПідтвердіть оплату в кабінеті, щоб продавець міг відправити товар.\n\n<a href="https://kram-auction.vercel.app/cabinet">Підтвердити оплату →</a>`
  )

  return transaction
}

// Create transaction from Auction Win
export async function createTransactionFromAuctionWin(
  listingId: string,
  buyerId: string,
  finalPrice: number,
  actorId: string | null = null // null for system/cron
) {
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
    },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, id: true } },
      seller: { select: { name: true, id: true } },
    },
  })

  // Create event
  await createTransactionEvent(
    transaction.id,
    TransactionEventType.TRANSACTION_CREATED,
    actorId,
    null,
    TransactionStatus.PENDING_PAYMENT,
    'Транзакцію створено після перемоги в аукціоні',
    { source: 'auction_win', amount: finalPrice }
  )

  // Audit log
  await logAuditEvent({
    userId: actorId || undefined,
    action: 'transaction_created_auction_win',
    metadata: { transactionId: transaction.id, listingId, amount: finalPrice },
  })

  // Notifications
  await createNotification(
    transaction.sellerId,
    'sold',
    '🎉 Лот продано на аукціоні!',
    `Ваш лот "${transaction.listing.title}" продано на аукціоні за ${transaction.amount} ₴. Очікуйте підтвердження оплати.`,
    listingId
  )

  await createNotification(
    buyerId,
    'won',
    '🎉 Ви виграли аукціон!',
    `Вітаємо! Ви виграли "${transaction.listing.title}" за ${transaction.amount} ₴. Підтвердіть оплату для продовження.`,
    listingId
  )

  // Telegram notifications
  await notifyUserTelegram(
    transaction.sellerId,
    `🎉 <b>Лот продано на аукціоні!</b>\n\n📦 "${transaction.listing.title}"\n💰 ${transaction.amount} ₴\n\n<a href="https://kram-auction.vercel.app/cabinet">Перейти в кабінет →</a>`
  )

  await notifyUserTelegram(
    buyerId,
    `🎉 <b>Ви виграли аукціон!</b>\n\n📦 "${transaction.listing.title}"\n💰 ${transaction.amount} ₴\n\nПідтвердіть оплату в кабінеті.\n\n<a href="https://kram-auction.vercel.app/cabinet">Підтвердити оплату →</a>`
  )

  return transaction
}

// Mark transaction as paid (buyer action)
export async function markTransactionPaid(
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
      status: TransactionStatus.PAID_HELD,
      paymentStatus: PaymentStatus.HELD,
      buyerConfirmedAt: new Date(),
    },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, id: true } },
      seller: { select: { name: true, id: true } },
    },
  })

  // Create event
  await createTransactionEvent(
    transactionId,
    TransactionEventType.TRANSACTION_MARKED_PAID,
    buyerId,
    TransactionStatus.PENDING_PAYMENT,
    TransactionStatus.PAID_HELD,
    'Покупець підтвердив оплату (MVP)',
    { note: 'MVP ручне підтвердження, реальний платіж буде інтегровано пізніше' }
  )

  // Audit log
  await logAuditEvent({
    userId: buyerId,
    action: 'transaction_marked_paid',
    ip,
    userAgent,
    metadata: { transactionId, fromStatus: TransactionStatus.PENDING_PAYMENT, toStatus: TransactionStatus.PAID_HELD },
  })

  // Notify seller
  await createNotification(
    transaction.sellerId,
    'payment_confirmed',
    '💳 Оплата підтверджена!',
    `Покупець підтвердив оплату за "${transaction.listing.title}". Відправте товар та вкажіть номер накладної.`,
    transaction.listingId
  )

  await notifyUserTelegram(
    transaction.sellerId,
    `💳 <b>Оплата підтверджена!</b>\n\n📦 "${transaction.listing.title}"\n💰 ${transaction.amount} ₴\n\nВідправте товар та вкажіть номер накладної.\n\n<a href="https://kram-auction.vercel.app/cabinet">Вказати відправлення →</a>`
  )

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

  if (transaction.status !== TransactionStatus.PAID_HELD) {
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

  // Create event
  await createTransactionEvent(
    transactionId,
    TransactionEventType.TRANSACTION_SHIPPED,
    sellerId,
    TransactionStatus.PAID_HELD,
    TransactionStatus.SELLER_SHIPPED,
    `Продавець відправив товар через ${deliveryProvider}`,
    { trackingNumber, deliveryProvider }
  )

  // Audit log
  await logAuditEvent({
    userId: sellerId,
    action: 'transaction_shipped',
    ip,
    userAgent,
    metadata: { transactionId, trackingNumber, deliveryProvider },
  })

  // Notify buyer
  await createNotification(
    transaction.buyerId,
    'shipped',
    '🚚 Товар відправлено!',
    `Продавець відправив "${transaction.listing.title}" через ${deliveryProvider}. Номер накладної: ${trackingNumber}. Після отримання підтвердіть угоду.`,
    transaction.listingId
  )

  await notifyUserTelegram(
    transaction.buyerId,
    `🚚 <b>Товар відправлено!</b>\n\n📦 "${transaction.listing.title}"\n🚚 ${deliveryProvider}\n📋 Накладна: ${trackingNumber}\n\nПісля отримання підтвердіть угоду в кабінеті.\n\n<a href="https://kram-auction.vercel.app/cabinet">Підтвердити отримання →</a>`
  )

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
      paymentStatus: PaymentStatus.RELEASED,
      deliveryStatus: DeliveryStatus.CONFIRMED,
      completedAt: new Date(),
    },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, id: true } },
      seller: { select: { name: true, id: true } },
    },
  })

  // Create event
  await createTransactionEvent(
    transactionId,
    TransactionEventType.TRANSACTION_COMPLETED,
    buyerId,
    TransactionStatus.SELLER_SHIPPED,
    TransactionStatus.COMPLETED,
    'Покупець підтвердив отримання, угоду завершено'
  )

  // Audit log
  await logAuditEvent({
    userId: buyerId,
    action: 'transaction_completed',
    ip,
    userAgent,
    metadata: { transactionId },
  })

  // Notifications
  await createNotification(
    transaction.sellerId,
    'completed',
    '✅ Угода завершена!',
    `Покупець підтвердив отримання "${transaction.listing.title}". Угоду завершено, кошти будуть перераховані (MVP: реальні виплати інтегруються пізніше).`,
    transaction.listingId
  )

  await createNotification(
    buyerId,
    'completed',
    '✅ Угода завершена!',
    `Ви підтвердили отримання "${transaction.listing.title}". Дякуємо за покупку!`,
    transaction.listingId
  )

  // Telegram
  await notifyUserTelegram(
    transaction.sellerId,
    `✅ <b>Угода завершена!</b>\n\n📦 "${transaction.listing.title}"\n💰 ${transaction.amount} ₴\n\nПокупець підтвердив отримання. Дякуємо за співпрацю!`
  )

  await notifyUserTelegram(
    buyerId,
    `✅ <b>Угода завершена!</b>\n\n📦 "${transaction.listing.title}"\n\nДякуємо за покупку! Залиште відгук про продавця.\n\n<a href="https://kram-auction.vercel.app/cabinet">Залишити відгук →</a>`
  )

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

  // Can only dispute from PAID_HELD or SELLER_SHIPPED
  if (![TransactionStatus.PAID_HELD, TransactionStatus.SELLER_SHIPPED].includes(transaction.status)) {
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

  // Create event
  await createTransactionEvent(
    transactionId,
    TransactionEventType.TRANSACTION_DISPUTED,
    actorId,
    isBuyer ? TransactionStatus.PAID_HELD : TransactionStatus.SELLER_SHIPPED,
    TransactionStatus.DISPUTED,
    `${actorType} відкрив спір: ${reason}`,
    { reason, openedBy: isBuyer ? 'buyer' : 'seller' }
  )

  // Audit log
  await logAuditEvent({
    userId: actorId,
    action: 'transaction_disputed',
    ip,
    userAgent,
    metadata: { transactionId, reason, openedBy: isBuyer ? 'buyer' : 'seller' },
  })

  // Notify other party
  await createNotification(
    otherPartyId,
    'disputed',
    '⚠️ Відкрито спір!',
    `${actorType} відкрив спір за угодою "${transaction.listing.title}". Причина: ${reason}. Команда KRAM розгляне ситуацію.`,
    transaction.listingId
  )

  await notifyUserTelegram(
    otherPartyId,
    `⚠️ <b>Відкрито спір!</b>\n\n📦 "${transaction.listing.title}"\n👤 ${actorType}\n📝 Причина: ${reason}\n\nКоманда KRAM розгляне ситуацію та зв'яжеться з вами.`
  )

  return updated
}

// Cancel transaction (buyer, seller, or admin — only from PENDING_PAYMENT)
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

  // Can only cancel from PENDING_PAYMENT
  if (transaction.status !== TransactionStatus.PENDING_PAYMENT) {
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

  // Create event
  await createTransactionEvent(
    transactionId,
    TransactionEventType.TRANSACTION_CANCELLED,
    actorId,
    TransactionStatus.PENDING_PAYMENT,
    TransactionStatus.CANCELLED,
    `Угоду скасовано ${isAdmin ? 'адміністратором' : isBuyer ? 'покупцем' : 'продавцем'}`
  )

  // Audit log
  await logAuditEvent({
    userId: actorId,
    action: 'transaction_cancelled',
    ip,
    userAgent,
    metadata: { transactionId, cancelledBy: isAdmin ? 'admin' : isBuyer ? 'buyer' : 'seller' },
  })

  // Notify other party
  const otherPartyId = isBuyer ? transaction.sellerId : transaction.buyerId
  const actorName = isAdmin ? 'Адміністратор' : isBuyer ? 'Покупець' : 'Продавець'

  await createNotification(
    otherPartyId,
    'cancelled',
    '❌ Угоду скасовано',
    `${actorName} скасував угоду за "${transaction.listing.title}". Лот знову доступний.`,
    transaction.listingId
  )

  await notifyUserTelegram(
    otherPartyId,
    `❌ <b>Угоду скасовано</b>\n\n📦 "${transaction.listing.title}"\n\n${actorName} скасував угоду. Лот знову доступний у каталозі.`
  )

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
        paymentStatus: PaymentStatus.RELEASED,
        completedAt: new Date(),
      },
    })
    eventType = TransactionEventType.TRANSACTION_DISPUTE_RESOLVED_RELEASE
    resolutionText = 'Спір вирішено: кошти перераховано продавцю'
  } else if (resolution === 'REFUND') {
    updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.REFUNDED,
        paymentStatus: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
      },
    })
    eventType = TransactionEventType.TRANSACTION_DISPUTE_RESOLVED_REFUND
    resolutionText = 'Спір вирішено: кошти повернуто покупцю'
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

  // Create event
  await createTransactionEvent(
    transactionId,
    eventType,
    adminId,
    TransactionStatus.DISPUTED,
    updated.status,
    resolutionText,
    { adminNote, resolution }
  )

  // Audit log
  await logAuditEvent({
    userId: adminId,
    action: 'transaction_dispute_resolved',
    ip,
    userAgent,
    metadata: { transactionId, resolution, adminNote },
  })

  // Notify both parties
  await createNotification(
    transaction.buyerId,
    'dispute_resolved',
    '⚖️ Спір вирішено',
    `Спір за "${transaction.listing.title}" вирішено адміністратором: ${resolutionText}.`,
    transaction.listingId
  )

  await createNotification(
    transaction.sellerId,
    'dispute_resolved',
    '⚖️ Спір вирішено',
    `Спір за "${transaction.listing.title}" вирішено адміністратором: ${resolutionText}.`,
    transaction.listingId
  )

  await notifyUserTelegram(
    transaction.buyerId,
    `⚖️ <b>Спір вирішено</b>\n\n📦 "${transaction.listing.title}"\n\n${resolutionText}\n\n${adminNote ? `Примітка: ${adminNote}` : ''}`
  )

  await notifyUserTelegram(
    transaction.sellerId,
    `⚖️ <b>Спір вирішено</b>\n\n📦 "${transaction.listing.title}"\n\n${resolutionText}\n\n${adminNote ? `Примітка: ${adminNote}` : ''}`
  )

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
