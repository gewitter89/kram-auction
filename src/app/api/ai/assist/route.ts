import { NextRequest, NextResponse } from "next/server";
import { readSessionToken, COOKIE_NAME } from "@/lib/session";

const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  phones: ["iphone", "samsung", "xiaomi", "телефон", "смартфон"],
  laptops: ["macbook", "ноутбук", "laptop", "thinkpad", "dell", "lenovo", "asus", "hp"],
  games: ["playstation", "ps4", "ps5", "xbox", "nintendo", "steam deck", "консоль"],
  electronics: ["airpods", "навушники", "планшет", "ipad", "монітор", "годинник", "проектор"],
  fashion: ["кросівки", "adidas", "nike", "куртка", "джинси", "сумка", "одяг", "взуття"],
  home: ["диван", "ліжко", "холодильник", "пральна", "кавомашина", "телевізор", "меблі"],
  auto: ["авто", "автомобіль", "мотоцикл", "шини", "запчастини"],
  sport: ["велосипед", "самокат", "тренажер", "лижі", "байк", "гантелі"],
  tools: ["шуруповерт", "дриль", "перфоратор", "makita", "bosch", "інструменти"],
  books: ["книга", "підручник", "роман", "комікс"],
  kids: ["коляска", "автокрісло", "lego", "іграшка", "дитяче"],
  collections: ["картина", "монети", "антикваріат", "марки", "вінтаж", "колекційний", "rolex"],
};

const CATEGORY_NAMES: Record<string, string> = {
  phones: "Телефони",
  laptops: "Ноутбуки та ПК",
  electronics: "Електроніка",
  games: "Ігри та консолі",
  fashion: "Одяг та взуття",
  home: "Дім та побут",
  auto: "Авто та мото",
  sport: "Спорт та туризм",
  tools: "Інструменти",
  books: "Книги",
  kids: "Дитячі товари",
  collections: "Колекції та антикваріат",
};

function fallbackCategory(title: string) {
  const lower = title.toLowerCase();
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some((k) => lower.includes(k))) return cat;
  }
  return "electronics";
}

function fallbackResult(title: string, condition = "used", description = "") {
  const catSlug = fallbackCategory(title);
  const defaults: Record<string, number> = {
    phones: 8000,
    laptops: 20000,
    electronics: 5000,
    games: 8000,
    fashion: 2000,
    home: 5000,
    auto: 260000,
    sport: 4000,
    tools: 2000,
    books: 200,
    kids: 2000,
    collections: 3000,
  };
  const market = defaults[catSlug] || 5000;
  return {
    source: "fallback",
    category: { slug: catSlug, name: CATEGORY_NAMES[catSlug] || "Електроніка" },
    description:
      description?.trim() ||
      `${title}. Стан: ${condition === "new" ? "новий" : "вживаний"}. Продаю через KRAM із прозорою історією ставок та безпечною комунікацією в чаті. За запитом надам додаткові фото та деталі комплектації.`,
    price: {
      market,
      suggestedStart: Math.round(market * 0.35),
      suggestedBuyNow: Math.round(market),
      confidence: "low",
      hint: `Орієнтовна ціна: ~${market.toLocaleString("uk-UA")} ₴`,
    },
    tips: ["Додайте 3-5 якісних фото", "Опишіть стан і комплектацію", "Вкажіть зручний спосіб доставки"],
  };
}

async function callDeepSeek(title: string, condition: string, description: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;

  const prompt = `Ти — експерт з оцінки товарів для українського онлайн-аукціону KRAM.
Проаналізуй лот і відповідай ТІЛЬКИ JSON без markdown.

Товар: "${title}"
Стан: ${condition || "used"}
Опис: ${description || ""}

JSON schema:
{
  "category": "phones|laptops|electronics|games|fashion|home|auto|sport|tools|books|kids|collections",
  "categoryName": "назва українською",
  "marketPrice": 1000,
  "suggestedStart": 350,
  "suggestedBuyNow": 950,
  "confidence": "high|medium|low",
  "priceHint": "коротка фраза",
  "generatedDescription": "3-5 речень українською",
  "tips": ["порада 1", "порада 2", "порада 3"]
}`;

  const resp = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: DEEPSEEK_MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.3, max_tokens: 800 }),
    signal: AbortSignal.timeout(12000),
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content || "";
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

export async function POST(request: NextRequest) {
  try {
    const user = readSessionToken(request.cookies.get(COOKIE_NAME)?.value);
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, condition, description } = await request.json();
    if (!title || title.trim().length < 3) return NextResponse.json({ error: "Назва занадто коротка" }, { status: 400 });

    const ai = await callDeepSeek(title, condition || "used", description || "");
    if (ai) {
      return NextResponse.json({
        source: "deepseek",
        category: { slug: ai.category, name: ai.categoryName || CATEGORY_NAMES[ai.category] || "Електроніка" },
        description: ai.generatedDescription,
        price: {
          market: Math.round(ai.marketPrice),
          suggestedStart: Math.round(ai.suggestedStart),
          suggestedBuyNow: Math.round(ai.suggestedBuyNow),
          confidence: ai.confidence,
          hint: ai.priceHint,
        },
        tips: ai.tips || [],
      });
    }

    return NextResponse.json(fallbackResult(title, condition, description));
  } catch (error) {
    console.error("AI assist error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
