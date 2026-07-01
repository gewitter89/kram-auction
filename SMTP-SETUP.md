# SMTP Настройка (Google App Password)

Проблема: `535-5.7.8 Username and Password not accepted`

## Решение

1. Включите 2-факторную аутентификацию в Google аккаунте:
   - https://myaccount.google.com/security
   - 2-Step Verification → Enable

2. Создайте App Password:
   - https://myaccount.google.com/apppasswords
   - App name: `KRAM.UA`
   - Скопируйте сгенерированный 16-символьный пароль

3. Обновите `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcd-efgh-ijkl-mnop   ← App Password
   SMTP_FROM="KRAM.UA <your-email@gmail.com>"
   ```

4. Перезапустите сервер: `node server.js`

## Альтернативы

- **Mailtrap** (для dev): регистрируетесь на mailtrap.io, берёте credentials из inbox
- **SendGrid**: бесплатный tier 100 писем/день
- **Resend**: бесплатный tier 3000 писем/месяц

Google App Password — самый простой вариант для продакшена.
