# **KRAM Auction — Controlled Beta Testing / AI Agent ТЗ**

## **1. Цель**

Обеспечить безопасное тестирование и валидацию всех функций платформы KRAM Auction на изолированной тестовой базе PostgreSQL.
**Никаких изменений в продакшн UI, Trust Layer, LiqPay / TurboSMS или рейтингах пользователей.**

---

## **2. Разрешено AI**

* Работа только с **тестовой PostgreSQL** (Docker `postgres:15` или Neon test branch).
* Запуск и проверка:
  * E2E сценариев (`scripts/e2e-local-qa.ts`)
  * QA Seed (`prisma/seed.ts`)
  * Локальних тестових даних (QA users и QA lot)
* Поддержка и обновление документации:
  * `docs/e2e-local-qa.md` — инструкции, шаги PASS/FAIL
  * `docs/beta-release-status.md` — статус релиза, ограничения
* Контроль безопасности Git:
  * `.env.test.local` и секреты **не коммитить**
  * Удаление временных scratch-файлов

---

## **3. Запрещено AI**

* Использовать **production DATABASE_URL**
* Использовать **SQLite или любую фейковую БД**
* Изменять:
  * UI / Hero / Footer / Legal Pages
  * LiqPay / TurboSMS
  * Trust Layer badges и рейтинги пользователей
* Создавать фейковые отчёты или тестовые записи в продакшн

---

## **4. Подготовка тестовой среды**

1. Создать локальный Docker-контейнер PostgreSQL: `postgres:15` (порт 5433)
2. Создать файл `.env.test.local` с переменной `DATABASE_URL` для тестовой БД
3. Применить схему Prisma:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Запустить QA seed:
   ```bash
   $env:ALLOW_QA_SEED="true"
   $env:QA_SEED_PASSWORD="<your-local-password>"
   npx prisma db seed
   ```
5. Запустить локальный dev сервер:
   ```bash
   $env:NEXTAUTH_SECRET="test-secret"
   $env:AUTH_SECRET="test-secret"
   npm run dev
   ```

---

## **5. E2E тестирование**

* Запуск скрипта:
  ```bash
  npx tsx scripts/e2e-local-qa.ts
  ```
* Проверить все 12 ключевых шагов:
  1. QA users verification
  2. QA lot verification
  3. Seller own bid test
  4. Min bid validation
  5. Valid bid creation
  6. Ended auction test
  7. Report creation
  8. Admin moderation
  9. AuditLog test
  10. Admin user verification
  11. Rate-limit protection
  12. SSE realtime updates

---

## **6. QA проверки**

| Команда             | Ожидаемый результат      |
| ------------------- | ------------------------ |
| `npm run lint`      | 0 ошибок ESLint          |
| `npm run typecheck` | Типы TypeScript валидны  |
| `npm run build`     | Build успешно без ошибок |
| E2E скрипт          | 12 PASS, 0 FAIL          |

---

## **7. Контроль ограничений**

* Rate limit и SSE работают только на тестовой среде (`in-memory`)
* Продакшн Trust Layer и рейтинги пользователей **не изменяются**
* Любые предложения по апгрейду: Upstash Redis, Pusher, Ably, Supabase Realtime — только документировать

---

## **8. Отчётность**

* Обновить и зафиксировать:
  * `docs/e2e-local-qa.md` — шаги, PASS/FAIL, скриншоты
  * `docs/beta-release-status.md` — текущий статус релиза и ограничения
* Формат отчёта: **Category → Status → Evidence**
* **Формулировки:** использовать только «Ready for controlled beta testing, with in-memory realtime/rate-limit limitations.»

---

## **9. Критерий готовности**

1.  Локальный E2E прогон — полностью PASS (12/12)
2.  Trust Layer / UI — без изменений
3.  Документация — обновлена и зафиксирована
4.  Репозиторий — безопасен, секреты не коммитятся

---

## **10. Production**

* Продакшн сайт не трогать
* Любые действия только на локальном тестовом контейнере или отдельной тестовой базе PostgreSQL

---

## **11. Покроковий візуальний чек-лист для Агента (QA Checklist)**

Цей чек-лист призначений для послідовного заповнення майбутнім ШІ-агентом під час прогону локальних тестів. Агент повинен копіювати цей блок у свій фінальний звіт, зазначаючи реальний статус перевірки:

### **Крок 1: Ініціалізація інфраструктури**
- [ ] **1.1. Статус Docker Engine:** Перевірити, що Docker Desktop запущено (`docker ps`).
- [ ] **1.2. Контейнер PostgreSQL:** Контейнер `kram-test-db` запущено на порту `5433` (`Up`).
- [ ] **1.3. Тестові змінні:** Файл `.env.test.local` створено, значення `DATABASE_URL` вказує на локальну тестову БД.

### **Крок 2: Синхронізація та Seed бази даних**
- [ ] **2.1. Prisma Schema:** Схема синхронізована через `npx prisma db push` без помилок.
- [ ] **2.2. QA Seed:** Виконано `npx prisma db seed` з прапорцем `ALLOW_QA_SEED=true`.
- [ ] **2.3. Користувачі:** Акаунти `qa-seller`, `qa-buyer` та `qa-admin` успішно створено.
- [ ] **2.4. Лот:** "Тестовий QA-лот KRAM" успішно додано до каталогу.

### **Крок 3: Перевірка E2E Сценаріїв (`scripts/e2e-local-qa.ts`)**
- [ ] **3.1. User Check:** QA користувачі існують у базі даних (PASS/FAIL).
- [ ] **3.2. Lot Check:** Тестовий лот існує у базі даних (PASS/FAIL).
- [ ] **3.3. Seller Self-Bid:** Ставка продавця на власний лот успішно заблокована (PASS/FAIL).
- [ ] **3.4. Minimum Increment:** Ставка нижче мінімального кроку відхилена (PASS/FAIL).
- [ ] **3.5. Valid Bid:** Ставка успішно створює запис `Bid` та оновлює ціну лота (PASS/FAIL).
- [ ] **3.6. Past Auction:** Ставки на закриті лоти блокуються (PASS/FAIL).
- [ ] **3.7. User Complaint:** Скарги створюються зі статусом `PENDING` та коментарями (PASS/FAIL).
- [ ] **3.8. Moderation Status:** Статус скарги успішно змінюється на `REVIEWED` (PASS/FAIL).
- [ ] **3.9. System Audit:** Логи модерації успішно пишуться до `AuditLog` (PASS/FAIL).
- [ ] **3.10. Verification Flag:** Верифікація профілю продавця успішно оновлюється адміном (PASS/FAIL).

### **Крок 4: Збірка та Якість коду**
- [ ] **4.1. Linter:** `npm run lint` завершено без жодної помилки.
- [ ] **4.2. Compiler:** `npm run typecheck` пройдено успішно (0 помилок TypeScript).
- [ ] **4.3. Next.js Build:** `npm run build` завершено, статичні та динамічні маршрути оптимізовані.
