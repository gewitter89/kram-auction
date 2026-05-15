import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

// Fallback category detection if AI fails
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  phones: ['iphone', 'samsung galaxy', 'xiaomi', 'redmi', 'poco', 'pixel', 'huawei', 'oppo', 'телефон', 'смартфон'],
  laptops: ['macbook', 'ноутбук', 'laptop', 'thinkpad', 'dell', 'lenovo', 'asus', 'hp', 'acer', 'msi'],
  games: ['playstation', 'ps4', 'ps5', 'xbox', 'nintendo switch', 'steam deck', 'ігрова консоль'],
  electronics: ['airpods', 'навушники', 'планшет', 'ipad', 'монітор', 'годинник', 'dyson', 'проектор'],
  fashion: ['кросівки', 'adidas', 'nike', 'куртка', 'джинси', 'сумка', 'черевики', 'одяг', 'взуття'],
  home: ['диван', 'ліжко', 'холодильник', 'пральна', 'кавомашина', 'телевізор', 'меблі', 'посуд'],
  auto: ['авто', 'автомобіль', 'мотоцикл', 'шини', 'запчастини'],
  sport: ['велосипед', 'самокат', 'тренажер', 'лижі', 'байк', 'гантелі'],
  tools: ['шуруповерт', 'дриль', 'перфоратор', 'makita', 'bosch', 'інструменти'],
  books: ['книга', 'підручник', 'роман', 'комікс'],
  kids: ['коляска', 'автокрісло', 'lego', 'іграшка', 'дитяче'],
  collections: ['картина', 'монети', 'антикваріат', 'марки', 'вінтаж', 'колекційний'],
}

const CATEGORY_NAMES: Record<string, string> = {
  phones: 'Телефони', laptops: 'Ноутбуки та ПК', electronics: 'Електроніка',
  games: 'Ігри', fashion: 'Одяг та взуття', home: 'Дім та побут', auto: 'Авто та мото',
  sport: 'Спорт та туризм', tools: 'Інструменти', books: 'Книги', kids: 'Дитячі товари',
  collections: 'Колекції та антикваріат',
}

function fallbackCategory(title: string): string {
  const lower = title.toLowerCase()
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some(k => lower.includes(k))) return cat
  }
  return 'electronics'
}

async function callDeepSeek(title: string, condition: string, description: string): Promise<{
  category: string
  categoryName: string
  marketPrice: number
  suggestedStart: number
  suggestedBuyNow: number
  confidence: string
  priceHint: string
  generatedDescription: string
  tips: string[]
} | null> {
  if (!DEEPSEEK_API_KEY) return null

  const conditionLabel: Record<string, string> = {
    new: 'Новий (не використовувався)',
    like_new: 'Як новий (використовувався мінімально)',
    used: 'Вживаний (є сліди використання)',
    for_parts: 'На запчастини (є дефекти або не працює)',
  }

  const prompt = `Ти — експерт з оцінки товарів для українського онлайн-аукціону KRAM. 
Твоє завдання — проаналізувати оголошення та надати точну оцінку.

Товар: "${title}"
Стан: ${conditionLabel[condition] || 'Вживаний'}
${description ? `Опис (якщо є): ${description}` : ''}

Відповідай ТІЛЬКИ у форматі JSON (без \`\`\`json обгортки):
{
  "category": "slug категорії (одне з: phones, laptops, electronics, games, fashion, home, auto, sport, tools, books, kids, collections)",
  "categoryName": "назва категорії українською",
  "marketPrice": число (середня ринкова ціна в гривнях на ринку України 2025-2026, для вживаних речей враховуй знижку 20-50% від нової),
  "suggestedStart": число (рекомендована стартова ціна = 30-40% від ринкової, щоб залучити більше учасників),
  "suggestedBuyNow": число (ціна "Купити зараз" = 90-100% від ринкової),
  "confidence": "high" або "medium" або "low" (наскільки впевнений у ціні),
  "priceHint": "коротка фраза про ціну (макс 60 символів), наприклад: 'Ринкова ціна: ~12 000 ₴'",
  "generatedDescription": "готовий опис для оголошення (3-5 речень українською, від першої особи, без шаблонних фраз типу 'якісний товар')",
  "tips": ["порада 1 для кращого продажу", "порада 2", "порада 3"]
}

Важливо:
- Ціни мають бути реалістичними для ВЖИВАНОГО ринку України 2025-2026
- Враховуй курс долара ~41-42 грн/$
- Для електроніки враховуй знецінення: нові флагмани iPhone 16 Pro = ~55000 грн, iPhone 14 Pro = ~28000 грн
- Для авто медіана ринку $6200 = ~260000 грн
- Для одягу: Nike/Adidas б/у = 500-3000 грн, люкс = 5000-20000 грн
- Якщо назва незрозуміла — роби найкращу оцінку на основі контексту`

  try {
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 600,
      }),
      signal: AbortSignal.timeout(12000),
    })

    if (!resp.ok) return null
    const data = await resp.json()
    const content = data.choices?.[0]?.message?.content || ''
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch (e) {
    console.error('DeepSeek error:', e)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, condition, description } = await request.json()
    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: 'Назва занадто коротка' }, { status: 400 })
    }

    // Try DeepSeek first
    const aiResult = await callDeepSeek(title, condition || 'used', description || '')

    if (aiResult) {
      return NextResponse.json({
        source: 'deepseek',
        category: {
          slug: aiResult.category,
          name: aiResult.categoryName || CATEGORY_NAMES[aiResult.category] || 'Електроніка',
        },
        description: aiResult.generatedDescription,
        price: {
          market: Math.round(aiResult.marketPrice),
          suggestedStart: Math.round(aiResult.suggestedStart),
          suggestedBuyNow: Math.round(aiResult.suggestedBuyNow),
          confidence: aiResult.confidence,
          hint: aiResult.priceHint,
        },
        tips: aiResult.tips || [],
      })
    }

    // Fallback: local logic
    const catSlug = fallbackCategory(title)
    const DEFAULTS: Record<string, number> = {
      phones: 8000, laptops: 20000, electronics: 5000, games: 8000,
      fashion: 2000, home: 5000, auto: 260000, sport: 4000,
      tools: 2000, books: 200, kids: 2000, collections: 3000,
    }
    const market = DEFAULTS[catSlug] || 5000

    return NextResponse.json({
      source: 'fallback',
      category: { slug: catSlug, name: CATEGORY_NAMES[catSlug] || 'Електроніка' },
      description: `${title}. Стан: ${condition === 'new' ? 'новий' : 'вживаний'}. Продаю через апгрейд. Торг доречний.`,
      price: {
        market,
        suggestedStart: Math.round(market * 0.35),
        suggestedBuyNow: Math.round(market * 1.0),
        confidence: 'low',
        hint: `Орієнтовна ціна: ~${market.toLocaleString('uk-UA')} ₴`,
      },
      tips: ['Додайте якісні фото', 'Опишіть стан детально', 'Вкажіть комплектність'],
    })
  } catch (error) {
    console.error('AI assist error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
