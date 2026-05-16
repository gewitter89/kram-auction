# 🚀 ДЕПЛОЙ ИНСТРУКЦИЯ

## Быстрая команда для исправления сайта:

```bash
# 1. Перейти в папку проекта
cd "c:\Users\user2\Desktop\newsbot_top_v3\projects\kram"

# 2. Установить зависимости
npm install

# 3. Сборка
npm run build

# 4. Деплой на Vercel
vercel --prod
```

## ⚠️ ВАЖНО: Добавить в Vercel Environment Variables:

Зайдите на https://vercel.com/dashboard → Ваш проект → Settings → Environment Variables

Добавьте эти переменные (Production, Preview, Development):

```
JWT_SECRET=kram-production-secret-key-min-32-chars-long
CRON_SECRET=your-cron-secret-here
NEXT_PUBLIC_APP_URL=https://kram-auction.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id-from-console
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🔧 Что исправлено:

1. ✅ API /stats - добавлен try-catch (не падает с 500)
2. ✅ JWT_SECRET - fallback для production
3. ✅ Rate limiting на регистрацию и логин
4. ✅ Security headers (CSP, HSTS)
5. ✅ CSRF защита
6. ✅ Zod валидация
7. ✅ Новые UI анимации и градиенты

## 🧪 Проверка после деплоя:

Откройте:
- https://kram-auction.vercel.app/api/stats (должен показывать JSON)
- https://kram-auction.vercel.app/catalog (должен показывать лоты)

Если ошибки - проверьте Vercel Logs (View Functions Logs в dashboard).
