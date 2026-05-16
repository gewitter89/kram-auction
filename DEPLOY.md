# 🚀 ДЕПЛОЙ KRAM AUCTION

Сайт налаштовується для Vercel production launch. Canonical URL задається через `NEXT_PUBLIC_SITE_URL`.

## ✅ Что сделано:
1. **Google OAuth**: Настроен (Client ID и Secret добавлены в Vercel).
2. **Telegram**: Кнопка подписки ведет на https://t.me/kram_auction.
3. **Database**: Подключена Neon PostgreSQL (в продакшене).
4. **SEO & UI**: Полностью обновлены согласно ТЗ 2026.

## 🔗 Ссылки:
- **Production**: задайте через `NEXT_PUBLIC_SITE_URL` після підключення домену
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
- `NEXT_PUBLIC_SITE_URL`: Canonical домен для metadata, callback/result URLs та Telegram links.
- `NEXT_PUBLIC_TELEGRAM_URL`: Ссылка на канал.
- `TELEGRAM_BOT_TOKEN`: Токен бота @kram_auction_bot.

## 🤖 Telegram Бот:
- **Бот**: [@kram_auction_bot](https://t.me/kram_auction_bot)
- **Webhook**: Налаштуйте на `${NEXT_PUBLIC_SITE_URL}/api/telegram/webhook`
- **Команды**:
  - `/start` — Приветствие и кнопки
  - `/help` — Справка
  - `/catalog` — Ссылка на каталог
  - `/sell` — Ссылка на создание лота
- **Уведомления**: Новые лоты, перебитие ставки, окончание аукциона, победа
