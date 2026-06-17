# ⚡ МійАукціон

Повноцінна аукціонна платформа (аналог Skylots) на Node.js + SQLite.

## 🚀 Швидкий старт

```bash
# 1. Встановити залежності
npm install

# 2. Налаштувати .env (змінити ключі)
# Відредагуйте файл .env

# 3. Запустити
npm start

# Сайт: http://localhost:3000
```

## 📋 Функціонал

### Для покупців:
- 🔨 Ставки на аукціонах (з антиснайпінгом)
- 🛒 "Купити зараз" за фіксовану ціну
- 🤖 Автоставки (автоматичне підвищення до макс. суми)
- ❤️ Обране
- 💬 Повідомлення продавцю
- 🔔 Сповіщення (перебили ставку, лот завершується)
- ⭐ Відгуки після покупки

### Для продавців:
- 📦 Створення лотів з фото (drag & drop, до 10 фото)
- 💰 Аукціон / Купити зараз / Обидва
- 📊 Статистика (перегляди, ставки)
- 💳 Отримання оплати через LiqPay
- 📦 Підтвердження відправки з ТТН

### Система:
- 🔐 JWT авторизація (bcrypt хешування)
- ⏱ Автозавершення аукціонів (кожні 30 сек)
- 🛡️ Антиснайпінг (+2 хв при ставці в останні 2 хв)
- 💳 LiqPay інтеграція
- 📧 Email сповіщення (nodemailer)
- 🔒 Helmet + Rate Limiting + CORS
- 📱 PWA (встановлюється як додаток)
- 🔍 SEO (Schema.org, sitemap, robots.txt)
- 🗜️ Gzip стиснення

## 🏗️ Структура

```
├── server.js           # Express сервер
├── database.js         # SQLite схема та ініціалізація
├── .env                # Конфігурація (секрети)
├── middleware/
│   └── auth.js         # JWT middleware
├── routes/
│   ├── auth.js         # Реєстрація, вхід, профіль
│   ├── lots.js         # CRUD лотів, фільтри, пошук
│   ├── bids.js         # Ставки, автоставки, купити зараз
│   ├── users.js        # Публічні профілі
│   ├── messages.js     # Чат
│   ├── favorites.js    # Обране
│   ├── purchases.js    # Покупки/продажі
│   ├── payment.js      # LiqPay/Monobank
│   ├── notifications.js # Сповіщення
│   └── reviews.js      # Відгуки
├── services/
│   └── email.js        # Email шаблони
├── public/             # Фронтенд
│   ├── index.html      # Головна
│   ├── lot.html        # Сторінка лота
│   ├── login.html      # Вхід
│   ├── register.html   # Реєстрація
│   ├── cabinet.html    # Кабінет
│   ├── create-lot.html # Створення лота
│   ├── seller.html     # Профіль продавця
│   ├── payment.html    # Оплата
│   ├── manifest.json   # PWA
│   ├── sw.js           # Service Worker
│   └── js/api.js       # API клієнт
├── uploads/            # Фото лотів
└── deploy/
    ├── nginx.conf      # Nginx конфіг
    ├── setup.sh        # Скрипт деплою
    └── ecosystem.config.js # PM2 конфіг
```

## 🌐 Деплой (безкоштовно)

### Fly.io (рекомендовано — безкоштовно + постійний диск)

```bash
# 1. Встановити flyctl
curl -L https://fly.io/install.sh | sh

# 2. Увійти в акаунт
fly auth login

# 3. Запустити (з кореневої папки проєкту)
fly launch

# 4. Створити постійний диск для SQLite
fly volumes create auction_data --region waw --size 1

# 5. Встановити змінну DATA_DIR
fly secrets set DATA_DIR=/data

# 6. Задеплоїти
fly deploy

# 7. Створити admin на сервері
fly ssh console -C "node scripts/seed-admin.js"
```

### Render (безкоштовний тариф — без постійного диска)

1. Запушити на GitHub
2. Зайти на https://render.com → "New Web Service"
3. Підключити репозиторій `kram-auction`
4. Налаштувати:
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Створити

> ⚠️ Безкоштовний тариф без диска — БД скидається при кожному деплої.

### VPS (платний — від $5/міс)

1. Купити VPS (DigitalOcean, Hetzner, від $5/міс)
2. Купити домен
3. Завантажити файли на сервер
4. Запустити `bash deploy/setup.sh`
5. Замінити `your-domain.com` в nginx.conf та .env
6. SSL автоматично через Let's Encrypt

## 💳 Налаштування оплати

### LiqPay:
1. Зареєструватись на https://www.liqpay.ua
2. Отримати public_key та private_key
3. Вписати в .env

### Monobank:
1. Зареєструвати мерчант на https://api.monobank.ua
2. Або використовувати ручний переказ на картку

## 📧 Email сповіщення

Для Gmail:
1. Увімкнути 2FA
2. Створити App Password: https://myaccount.google.com/apppasswords
3. Вписати в .env SMTP_USER та SMTP_PASS

## 🔒 Безпека

- Паролі хешуються bcrypt (10 раундів)
- JWT токени з терміном 7 днів
- Rate limiting (200 req/15min, 10 auth/15min)
- Helmet security headers
- Input validation на всіх ендпоінтах
- SQL injection захист (prepared statements)
- CSRF захист через JWT (не cookies)
