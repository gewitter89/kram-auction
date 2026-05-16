import { prisma } from './prisma'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

export async function sendTelegramMessage(chatId: string, text: string, options?: any) {
  if (!BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN not set')
    return
  }

  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        ...options
      })
    })
  } catch (error) {
    console.error('Failed to send Telegram message:', error)
  }
}

export async function notifyNewLot(listing: { title: string; startingPrice: number; id: string }) {
  const subscribers = await prisma.telegramSubscription.findMany({
    where: { isActive: true }
  })

  const message = `
🔔 <b>Новий лот на KRAM!</b>

📦 <b>${listing.title}</b>
💰 Стартова ціна: ${listing.startingPrice} грн

<a href="https://kram-auction.vercel.app/lot/${listing.id}">Переглянути лот →</a>
  `.trim()

  for (const sub of subscribers) {
    await sendTelegramMessage(sub.chatId, message, { disable_web_page_preview: false })
  }
}

export async function notifyBidOutbid(bid: { userId: string; listingTitle: string; newAmount: number; listingId: string }) {
  const userSub = await prisma.telegramSubscription.findFirst({
    where: { userId: bid.userId, isActive: true }
  })

  if (!userSub) return

  const message = `
⚠️ <b>Вашу ставку перебили!</b>

📦 ${bid.listingTitle}
💰 Нова ціна: ${bid.newAmount} грн

<a href="https://kram-auction.vercel.app/lot/${bid.listingId}">Підняти ставку →</a>
  `.trim()

  await sendTelegramMessage(userSub.chatId, message)
}

export async function notifyAuctionEnding(listing: { title: string; id: string; currentPrice: number }, hoursLeft: number) {
  const message = `
⏰ <b>Аукціон завершується через ${hoursLeft} год!</b>

📦 ${listing.title}
💰 Поточна ціна: ${listing.currentPrice} грн

<a href="https://kram-auction.vercel.app/lot/${listing.id}">Зробити ставку →</a>
  `.trim()

  const subscribers = await prisma.telegramSubscription.findMany({
    where: { isActive: true }
  })

  for (const sub of subscribers) {
    await sendTelegramMessage(sub.chatId, message)
  }
}

export async function notifyWinner(winner: { userId: string; listingTitle: string; finalPrice: number; listingId: string }) {
  const userSub = await prisma.telegramSubscription.findFirst({
    where: { userId: winner.userId, isActive: true }
  })

  if (!userSub) return

  const message = `
🎉 <b>Ви перемогли в аукціоні!</b>

📦 ${winner.listingTitle}
💰 Фінальна ціна: ${winner.finalPrice} грн

<a href="https://kram-auction.vercel.app/lot/${winner.listingId}">Перейти до оплати →</a>
  `.trim()

  await sendTelegramMessage(userSub.chatId, message)
}

export async function setWebhook() {
  if (!BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN not set, skipping webhook setup')
    return null
  }

  const webhookUrl = `https://kram-auction.vercel.app/api/telegram/webhook`

  try {
    const response = await fetch(`${TELEGRAM_API}/setWebhook?url=${encodeURIComponent(webhookUrl)}`)
    return await response.json()
  } catch (error) {
    console.error('Failed to set webhook:', error)
    return null
  }
}
