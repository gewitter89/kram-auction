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

## Другий пакет правок — professional marketplace hardening

Додано після аналізу патернів eBay/OLX/classified-аукціонів: trust signals above the fold, seller verification, report flow, moderation queue, transparent fees, mobile tap targets, readiness checklist.

### Зроблено у другому пакеті

- Додано `src/lib/marketplace-checks.ts`:
  - список обовʼязкових core-категорій;
  - auto-create базових категорій;
  - production readiness checklist.
- Додано admin API:
  - `GET /api/admin/readiness` — перевірка готовності production;
  - `POST /api/admin/categories/ensure` — створення базових категорій без ручного seed.
- Розширено `/admin` dashboard:
  - блок Production readiness;
  - перевірки Cloudinary, CRON_SECRET, AUTH_SECRET, admin user, категорій, pending reports, expired auctions;
  - кнопка створення базових категорій.
- Покращено створення лотів:
  - якщо категорії відсутні, API автоматично створює core-набір;
  - після створення лота запускається best-effort Telegram notification через `notifyNewLot`.
- Покращено купівлю “Купити зараз”:
  - перехід на `requireAuth`;
  - rate limit для buy flow;
  - валідація `listingId`.
- Покращено report flow:
  - reason і comment тепер передаються окремо;
  - виправлено callbackUrl при спробі поскаржитись без логіну.
- Покращено bidding service:
  - прибрано дубльований rate-limit у service layer, щоб один клік ставки не рахувався двічі.
- Покращено mobile catalog UX:
  - фільтри/toolbar краще складаються на телефоні;
  - select не розпирає ширину.
- Прибрано beta-позиционирование из пользовательских текстов и заменено на модель “прямые договоренности / classified”.
- Оставлены demo/test элементы только там, где они скрыты env-флагом или относятся к admin cleanup/payment sandbox.

### Ориентир по похожим площадкам

Для KRAM сейчас правильная production-модель — не обещать escrow/гарантию платежа, если платформа реально не принимает деньги. Поэтому UI должен честно показывать:

- seller verification/status;
- рейтинг и количество сделок;
- прозрачную историю ставок;
- простую кнопку жалобы;
- предупреждения против предоплаты и сторонних ссылок;
- понятный кабинет сделки;
- модерацию и readiness-проверку для администратора.


## Третій пакет правок — mobile uploads, cabinet cleanup, moderation controls

### Зроблено у третьому пакеті

- Додано client-side image compression для фото з телефону:
  - `src/lib/image-compression.ts`;
  - фото стискаються до ~1600px і до 4MB перед відправкою;
  - зменшує ризик 413/body limit і помилок при завантаженні з iPhone/Android.
- Форма створення лота тепер завантажує вже стиснутий файл, але показує preview одразу.
- Прибрано sandbox/mock payment UX з кабінету покупця в classified-моделі:
  - `PurchasesTab` більше не імпортує `MockPaymentModal`/LiqPay-кнопку;
  - замість цього показує чесний банер: оплата напряму з продавцем, рекомендовано післяплатою.
- Посилено адмінську модерацію лотів:
  - `PATCH /api/admin/lots` з діями `hide`, `restore`, `end`, `feature`, `unfeature`;
  - адмін може сховати/відновити/VIP-нути лот без фізичного видалення;
  - фізичне видалення залишено окремою дією;
  - дії пишуться в `AuditLog` best-effort.
- Текст кнопки видалення seed/demo-лотів уточнено як `seed/test`, щоб це не виглядало як частина публічного продукту.

### Чому це важливо

Для реального marketplace найболючіші місця перед запуском — фото з телефону, доверие к сделке, и аккуратная модерация. Этот пакет закрывает именно эти риски: фото меньше падают, покупателю не показывается фейковая sandbox-оплата, админ может модерировать без разрушительного удаления.

## Четвертий пакет правок — launch preflight and production QA

### Зроблено у четвертому пакеті

- Додано production preflight script:
  - `scripts/production-preflight.ts`;
  - npm-команда `npm run preflight:prod`;
  - перевіряє env, DB connectivity, readiness, Cloudinary, cron secret, auth secret, admin, categories, pending reports, expired auctions, obvious test users/listings.
- Додано public smoke Playwright test:
  - `tests/public-smoke.spec.ts`;
  - npm-команда `npm run test:smoke`;
  - перевіряє головні публічні сторінки, відсутність beta/demo/test positioning, мобільний overflow, mobile catalog filters.
- Додано `LIVE_LAUNCH_CHECKLIST.md` з чітким порядком запуску в production.
- Зроблено production-safe delete для лотів:
  - якщо у лота вже є ставки або угоди, delete більше не стирає історію;
  - такий лот переводиться в `cancelled`/hidden state;
  - повне видалення залишається тільки для лотів без історії.

### Чому це важливо

Перед публічним запуском потрібен не тільки build, а контроль готовности среды. Этот пакет добавляет gate перед запуском: env, база, фото-хранилище, категории, admin, cron, отсутствие тестового мусора и smoke-тест публичного UI.

## Пʼятий оперативний пакет — live production cleanup after merge

Після merge PR #5 live-перевірка показала, що production вже отримав нові тексти і mobile overflow виправлений, але публічні блоки ще показували seed/smoke лоти з production DB (`Smoke Test...`, `Test Seller`) і label `Демо-лот` у hero preview.

### Зроблено

- Додано `src/lib/public-listing-filters.ts` з фільтрами seed/test/smoke лотів.
- `/api/lots` тепер за замовчуванням не повертає лоти з назвами `Smoke Test`, `QA`, `Test`; для адмін/діагностики можна передати `includeSeed=1`.
- `/api/stats` рахує public activeLots без seed/test/smoke лотів.
- Hero preview label `Демо-лот` замінено на нейтральне `Приклад`.
- Placeholder `Демонстраційний товар` у live-card fallback замінено на `Фото очікується`.

### Навіщо

Навіть якщо в production DB залишились тестові записи, публічний каталог/головна не должны выглядеть как demo. Это временная защита UI/API до полной очистки production DB через admin/preflight.
