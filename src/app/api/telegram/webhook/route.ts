import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

async function sendMessage(chatId: number, text: string, options?: any) {
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
}

async function sendWelcomeMessage(chatId: number) {
  const welcomeText = `
<b>👋 Вітаємо у KRAM Auction!</b>

Тут ви отримуватимете:
• 🔔 Нові лоти щойно додані
• 💰 Сповіщення, якщо вашу ставку перебили
• ⏰ Нагадування про фінальні 5 хвилин аукціону
• 🏆 Переможців аукціонів

<b>🔗 Швидкі дії:</b>
<a href="https://kram-auction.vercel.app/catalog">Переглянути лоти</a>
<a href="https://kram-auction.vercel.app/sell">Продати товар</a>

<b>💡 Підказка:</b> Авторизуйтесь на сайті, щоб отримувати персоналізовані сповіщення про ваші лоти та ставки.
  `.trim()

  await sendMessage(chatId, welcomeText, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🌐 Відкрити KRAM', url: 'https://kram-auction.vercel.app' }],
        [{ text: '📋 Каталог лотів', url: 'https://kram-auction.vercel.app/catalog' }],
        [{ text: '➕ Продати товар', url: 'https://kram-auction.vercel.app/sell' }]
      ]
    }
  })
}

async function sendHelpMessage(chatId: number) {
  const helpText = `
<b>ℹ️ Довідка KRAM Bot</b>

<b>Команди:</b>
/start — Почати роботу з ботом
/help — Ця довідка
/catalog — Посилання на каталог
/sell — Створити лот на продаж

<b>Автоматичні сповіщення:</b>
• Нові лоти в обраних категоріях
• Перебиття вашої ставки
• Закінчення аукціону (перемога/поразка)
• Повідомлення від покупців/продавців

<b>Питання?</b> Звертайтесь: @kram_support
  `.trim()

  await sendMessage(chatId, helpText)
}

export async function POST(request: Request) {
  try {
    const update = await request.json()

    if (update.message) {
      const { chat, text, from } = update.message
      const chatId = chat.id
      const username = from?.username || from?.first_name || 'Користувач'

      // Save or update user subscription
      await prisma.telegramSubscription.upsert({
        where: { chatId: chatId.toString() },
        update: {
          username: username,
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          chatId: chatId.toString(),
          username: username,
          isActive: true
        }
      }).catch(() => {
        // Table might not exist yet, ignore
      })

      // Handle commands
      switch (text?.toLowerCase()) {
        case '/start':
          await sendWelcomeMessage(chatId)
          break
        case '/help':
          await sendHelpMessage(chatId)
          break
        case '/catalog':
          await sendMessage(chatId, '📋 <a href="https://kram-auction.vercel.app/catalog">Перейти до каталогу лотів</a>', { disable_web_page_preview: true })
          break
        case '/sell':
          await sendMessage(chatId, '➕ <a href="https://kram-auction.vercel.app/sell">Створити лот на продаж</a>', { disable_web_page_preview: true })
          break
        default:
          // Echo for unrecognized messages
          await sendMessage(chatId, `Ви написали: <b>${text}</b>\n\nВикористовуйте /help для списку команд.`)
      }
    }

    if (update.callback_query) {
      const { data, message } = update.callback_query
      const chatId = message?.chat?.id

      if (data === 'open_catalog') {
        await sendMessage(chatId, '🔗 <a href="https://kram-auction.vercel.app/catalog">Відкрити каталог</a>', { disable_web_page_preview: true })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}

// For setting webhook
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'setWebhook') {
    const webhookUrl = `https://kram-auction.vercel.app/api/telegram/webhook`
    const response = await fetch(`${TELEGRAM_API}/setWebhook?url=${encodeURIComponent(webhookUrl)}`)
    const result = await response.json()
    return NextResponse.json(result)
  }

  if (action === 'getInfo') {
    const response = await fetch(`${TELEGRAM_API}/getMe`)
    const result = await response.json()
    return NextResponse.json(result)
  }

  return NextResponse.json({
    status: 'Telegram Bot Webhook Active',
    endpoints: {
      setWebhook: '/api/telegram/webhook?action=setWebhook',
      getInfo: '/api/telegram/webhook?action=getInfo'
    }
  })
}
