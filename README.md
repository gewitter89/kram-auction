# ⚡ LOTVA — Український маркетплейс аукціонів

> Купуй вигідно. Продавай швидко. Торгуй чесно.

Сучасний аукціонний маркетплейс рівня OLX + eBay + Allegro з UX якістю Monobank.

## 🚀 Запуск

```bash
# 1. Встановити залежності
npm install

# 2. Створити базу даних
npx prisma db push

# 3. Заповнити тестовими даними
npm run seed

# 4. Запустити
npm run dev

# Відкрити: http://localhost:3000
```

## 🔑 Тестові акаунти

| Роль | Email | Пароль |
|------|-------|--------|
| Admin | admin@lotva.ua | password123 |
| Seller | tech@test.com | password123 |
| Buyer | ivan@test.com | password123 |

## 🔐 Авторизація

Email/password вхід працює одразу без додаткових налаштувань.

### Як включити Google OAuth:

1. Відкрити [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Створити OAuth 2.0 Client ID
3. Тип: Web application
4. Authorized JavaScript origins: `http://localhost:3000`
5. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Скопіювати Client ID та Client Secret
7. Вставити в `.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
   ```
8. Перезапустити dev server

### Apple OAuth:

Apple Sign In вимагає Apple Developer Account ($99/рік).
Поки ключі не налаштовані — кнопка показує "Скоро" і неактивна.

1. Відкрити [Apple Developer](https://developer.apple.com/account/resources/identifiers)
2. Створити Services ID
3. Налаштувати Sign in with Apple
4. Вставити ключі в `.env`

## 🛠 Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS 4, Lucide Icons
- **Backend:** Next.js API Routes
- **Database:** SQLite (Prisma ORM) — легко мігрувати на PostgreSQL
- **Auth:** Custom JWT + bcrypt
- **Icons:** Lucide React

## 📋 Функціонал

### Реалізовано:
- ✅ Головна сторінка (hero, категорії, гарячі лоти, як це працює, безпека)
- ✅ Картки лотів з таймером зворотного відліку
- ✅ Категорії з іконками
- ✅ API: реєстрація, вхід, JWT авторизація
- ✅ API: створення лотів, список з фільтрами
- ✅ API: ставки з антиснайпінгом (+2 хв)
- ✅ API: сповіщення при перебитті ставки
- ✅ Seed: 12 категорій, 10 юзерів, 30 лотів, 92 ставки
- ✅ Mobile-first responsive дизайн
- ✅ Bottom navigation для мобільних
- ✅ PWA-ready структура
- ✅ Prisma ORM з повною схемою (User, Listing, Bid, Favorite, Message, Notification, Review, Report, Transaction)

### Roadmap:
- 🔲 Сторінка лота (gallery, bid form, seller card)
- 🔲 Каталог з фільтрами
- 🔲 Профіль користувача
- 🔲 Кабінет продавця
- 🔲 Чат між покупцем і продавцем
- 🔲 Admin panel (/admin)
- 🔲 Сторінка оплати (LiqPay/Monobank)
- 🔲 Сторінка створення лота (wizard)
- 🔲 Пошук з автокомплітом
- 🔲 i18n (UA/RU/EN)
- 🔲 WebSocket для real-time ставок
- 🔲 Email сповіщення
- 🔲 Pricing page

## 📁 Структура проекту

```
lotva/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Головна
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Стилі
│   │   └── api/
│   │       ├── auth/login/       # POST /api/auth/login
│   │       ├── auth/register/    # POST /api/auth/register
│   │       ├── lots/             # GET/POST /api/lots
│   │       └── bids/             # POST /api/bids
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── CategoriesSection.tsx
│   │   │   ├── AuctionGrid.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   └── TrustSection.tsx
│   │   └── lots/
│   │       └── LotCard.tsx
│   └── lib/
│       ├── prisma.ts             # DB client
│       ├── auth.ts               # JWT helpers
│       └── utils.ts              # Formatters
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Seed data
│   └── dev.db                    # SQLite database
└── package.json
```

## 🎨 Дизайн-система

| Token | Value | Usage |
|-------|-------|-------|
| Primary Dark | #0B1220 | Header, dark sections |
| Blue | #2563EB | CTA, links, active |
| Green | #10B981 | Success, trust |
| Amber | #F59E0B | Warnings, stars |
| Red | #EF4444 | Danger, timer |
| Background | #F8FAFC | Page bg |
| Card | #FFFFFF | Cards |
| Text | #0F172A | Primary text |
| Text Secondary | #64748B | Secondary text |
| Border | #E2E8F0 | Borders |

## 📄 Ліцензія

MIT
