# 🚀 ДЕПЛОЙ KRAM AUCTION

Сайт успешно настроен и задеплоен на Vercel.

## ✅ Что сделано:
1. **Google OAuth**: Настроен (Client ID и Secret добавлены в Vercel).
2. **Telegram**: Кнопка подписки ведет на https://t.me/kram_auction.
3. **Database**: Подключена Neon PostgreSQL (в продакшене).
4. **SEO & UI**: Полностью обновлены согласно ТЗ 2026.

## 🔗 Ссылки:
- **Production**: [https://kram-auction.vercel.app](https://kram-auction.vercel.app)
- **Vercel Dashboard**: [https://vercel.com/torupa2010-7458s-projects/kram-auction](https://vercel.com/torupa2010-7458s-projects/kram-auction)

## 🛠 Обновление сайта:
Если ты внес изменения в код локально, просто выполни:
```bash
vercel --prod
```

## ⚠️ Важные переменные (уже в Vercel):
- `AUTH_SECRET`: Секретный ключ для сессий.
- `AUTH_GOOGLE_ID`: Client ID от Google.
- `AUTH_GOOGLE_SECRET`: Client Secret от Google.
- `DATABASE_URL`: Строка подключения к базе Neon.
- `NEXT_PUBLIC_TELEGRAM_URL`: Ссылка на канал.
