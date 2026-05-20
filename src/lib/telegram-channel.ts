import { prisma } from '@/lib/prisma'
import { absoluteUrl } from '@/lib/site-url'
import { sendTelegramMessage, sendTelegramPhoto } from '@/lib/telegram'

export function getTelegramChannelId() {
  return process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_ID || ''
}

export async function postListingToTelegramChannel(listingId: string, options: { force?: boolean } = {}) {
  const chatId = getTelegramChannelId()
  if (!chatId) return { ok: false, skipped: true, reason: 'TELEGRAM_CHANNEL_ID not configured' }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { category: { select: { name: true } }, seller: { select: { name: true, verified: true } } },
  })
  if (!listing || listing.status !== 'active') return { ok: false, skipped: true, reason: 'Listing not active' }

  if (!options.force) {
    const already = await prisma.auditLog.findFirst({
      where: { action: 'TELEGRAM_CHANNEL_LOT_POSTED', metadata: { contains: listing.id } },
      select: { id: true },
    })
    if (already) return { ok: true, skipped: true, reason: 'Already posted' }
  }

  let images: string[] = []
  try { images = JSON.parse(listing.images || '[]') } catch {}

  const priceLabel = listing.buyNowPrice
    ? `💰 Старт: <b>${listing.startPrice.toLocaleString('uk-UA')} ₴</b> · Купити зараз: <b>${listing.buyNowPrice.toLocaleString('uk-UA')} ₴</b>`
    : `💰 Стартова ціна: <b>${listing.startPrice.toLocaleString('uk-UA')} ₴</b>`

  const message = `
🔔 <b>Новий лот на KRAM</b>

📦 <b>${escapeHtml(listing.title)}</b>
${priceLabel}
📂 ${escapeHtml(listing.category?.name || 'Каталог')}
📍 ${escapeHtml(listing.city || 'Україна')}
${listing.seller.verified ? '✅ Перевірений продавець' : '👤 Продавець KRAM'}

KRAM не приймає оплату — сторони домовляються напряму. Рекомендуємо післяплату після огляду товару.

<a href="${absoluteUrl(`/lot/${listing.id}`)}">Переглянути лот →</a>
  `.trim()

  let success = false
  if (images.length > 0 && images[0]) {
    success = await sendTelegramPhoto(chatId, images[0], message) || false
  }
  
  if (!success) {
    success = await sendTelegramMessage(chatId, message, { disable_web_page_preview: true }) || false
  }

  if (success) {
    await prisma.auditLog.create({
      data: {
        action: 'TELEGRAM_CHANNEL_LOT_POSTED',
        metadata: JSON.stringify({ listingId: listing.id, chatId, title: listing.title, timestamp: new Date().toISOString() }),
      }
    }).catch(() => {})
  } else {
    return { ok: false, skipped: false, reason: 'Failed to send to Telegram API' }
  }

  return { ok: true, skipped: false, listingId: listing.id }
}

export async function postLatestListingsToTelegramChannel(limit = 5, options: { force?: boolean } = {}) {
  const listings = await prisma.listing.findMany({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 10),
    select: { id: true },
  })

  const results = []
  for (const listing of listings) {
    results.push(await postListingToTelegramChannel(listing.id, options))
  }

  return {
    total: results.length,
    posted: results.filter(result => result.ok && !result.skipped).length,
    skipped: results.filter(result => result.skipped).length,
    results,
  }
}


export async function postDailyDigestToTelegramChannel(options: { force?: boolean } = {}) {
  const chatId = getTelegramChannelId()
  if (!chatId) return { ok: false, skipped: true, reason: 'TELEGRAM_CHANNEL_ID not configured' }

  const dayKey = new Date().toISOString().slice(0, 10)
  if (!options.force) {
    const already = await prisma.auditLog.findFirst({
      where: { action: 'TELEGRAM_CHANNEL_DAILY_DIGEST_POSTED', metadata: { contains: dayKey } },
      select: { id: true },
    })
    if (already) return { ok: true, skipped: true, reason: 'Daily digest already posted today', dayKey }
  }

  const listings = await prisma.listing.findMany({
    where: { status: 'active' },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    take: 5,
    include: {
      category: { select: { name: true } },
      _count: { select: { bids: true } },
    },
  })

  if (listings.length === 0) return { ok: false, skipped: true, reason: 'No active listings' }

  const lines = listings.map((listing, index) => {
    const price = listing.currentPrice.toLocaleString('uk-UA')
    const buyNow = listing.buyNowPrice ? ` · Купити зараз ${listing.buyNowPrice.toLocaleString('uk-UA')} ₴` : ''
    return `${index + 1}. <a href="${absoluteUrl(`/lot/${listing.id}`)}"><b>${escapeHtml(listing.title)}</b></a>\n   💰 ${price} ₴${buyNow} · 📂 ${escapeHtml(listing.category?.name || 'Каталог')} · 🔨 ${listing._count.bids}`
  }).join('\n\n')

  const message = `
🔥 <b>Добірка лотів KRAM на сьогодні</b>

${lines}

KRAM фіксує ставки та домовленості. Оплату й доставку сторони погоджують напряму — рекомендуємо післяплату після огляду.

<a href="${absoluteUrl('/catalog')}">Відкрити весь каталог →</a>
<a href="${absoluteUrl('/sell')}">Додати свій лот →</a>
  `.trim()

  const success = await sendTelegramMessage(chatId, message, { disable_web_page_preview: false }) || false
  if (!success) return { ok: false, skipped: false, reason: 'Failed to send digest to Telegram API' }

  await prisma.auditLog.create({
    data: {
      action: 'TELEGRAM_CHANNEL_DAILY_DIGEST_POSTED',
      metadata: JSON.stringify({ dayKey, listingIds: listings.map(l => l.id), timestamp: new Date().toISOString() }),
    },
  }).catch(() => {})

  return { ok: true, skipped: false, dayKey, listingIds: listings.map(l => l.id), count: listings.length }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
