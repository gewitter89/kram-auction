# KRAM — аудит і доведення до production

Дата: 2026-05-19
Виконавець: OpenClaw assistant

## Що вже зроблено сьогодні

- Склонував репозиторій `gewitter89/kram-auction` у робоче середовище.
- Перевірив живий сайт `https://kram-auction.vercel.app/` у браузері, включно з мобільним viewport 390×844.
- Проклікав головну, каталог, сторінку лота, логін, перехід до створення лота.
- Прогнав базові перевірки: `npm run typecheck`, `npm run lint`, `npm run build`.
- Знайшов причину проблем з фото: production-завантаження залежить від Cloudinary, але deploy-документація не вимагала `CLOUDINARY_URL`; fallback у `public/uploads` непридатний для Vercel production.
- Почав перший пакет production-правок:
  - зробив upload route явним і безпечним для Vercel: у production без Cloudinary повертається зрозуміла 503-помилка замість тихого запису в ephemeral storage;
  - додав підтримку `CLOUDINARY_URL` і split-перемінних `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET`;
  - синхронізував валідацію лота з формою створення;
  - виправив допустимі стани `for_parts`, delivery `both`, ліміт фото 8;
  - додав серверну валідацію створення лота через `createLotSchema`;
  - додав серверну валідацію ставок через `bidSchema`;
  - виправив typo в повідомленні ставки: `Лот не знайдено або завершено`;
  - виправив неправильне поле `startingPrice` → `startPrice` у графіку ставок/Telegram helper;
  - додав viewport `width=device-width`, `initialScale`;
  - додав CSS-захист від горизонтального overflow на мобільних;
  - прибрав автоматичне видалення Service Worker/Cache на кожному завантаженні; тепер це тільки emergency-перемикач `NEXT_PUBLIC_DISABLE_PWA=true`;
  - оновив документацію env/deploy для Cloudinary.

## Що ще треба сделать перед запуском в люди

### Критично

- Налаштувати production env у Vercel:
  - `DATABASE_URL`
  - `AUTH_SECRET`
  - `AUTH_URL` або коректний `NEXT_PUBLIC_SITE_URL`
  - `CLOUDINARY_URL` або split Cloudinary variables
  - `CRON_SECRET`
  - Telegram/Email/SMS keys лише якщо ці функції реально ввімкнені
- Перевірити production DB: категорії, admin user, реальні seller/buyer акаунти, відсутність seed/demo лотів.
- Перевірити повний сценарій після redeploy:
  1. реєстрація;
  2. login/logout;
  3. верифікація продавця;
  4. створення лота з 1–8 фото;
  5. перегляд лота;
  6. ставка іншим користувачем;
  7. auto-bid;
  8. завершення аукціону cron-задачею;
  9. кабінет покупця/продавця;
  10. скарга/модерація адміном.

### Важливо для production-рівня

- Прибрати або заховати всі demo/test згадки, якщо проект більше не позиціонується як beta.
- Пройти мобільний UI по сторінках: home, catalog, lot, sell, cabinet, admin.
- Додати e2e smoke-тести для upload/create lot/bid/admin moderation.
- Перевірити legal тексти під реальну модель бізнесу: classified без платежів або escrow/payment product.
- Налаштувати регулярний cron для завершення аукціонів.
- Додати моніторинг помилок (Sentry/Logtail/Vercel logs policy).

## Поточний статус

Перший пакет правок у процесі. Після нього треба прогнати:

```bash
npm run typecheck
npm run lint
npm run build
```

Після успішних перевірок — commit, push/PR, redeploy на Vercel і повторний live QA.
