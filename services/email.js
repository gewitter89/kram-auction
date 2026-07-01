const nodemailer = require('nodemailer');
const db = require('../database');

let transporter = null;
let smtpReady = false;

async function initTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[EMAIL] No SMTP config — emails logged to console');
    }
    return;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
  });

  try {
    await transporter.verify();
    smtpReady = true;
    console.log('[EMAIL] SMTP connection verified');
  } catch (err) {
    console.error(`[EMAIL] SMTP verify failed: ${err.message}`);
    smtpReady = false;
  }
}

const templates = {
  welcome: (user) => ({
    subject: 'Ласкаво просимо на KRAM.UA!',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0f0f23;color:#e0e0e0;border-radius:12px">
        <h1 style="color:#6c5ce7;">KRAM.UA</h1>
        <h2>Вітаємо, ${user.username}!</h2>
        <p>Ваш акаунт успішно створено. Тепер ви можете:</p>
        <ul>
          <li>Робити ставки на аукціонах</li>
          <li>Створювати власні лоти</li>
          <li>Додавати лоти в обране</li>
        </ul>
        <a href="${process.env.DOMAIN || 'http://localhost:3000'}"
           style="display:inline-block;padding:12px 24px;background:#6c5ce7;color:white;text-decoration:none;border-radius:8px;margin-top:16px;">
          Перейти на сайт
        </a>
        <p style="color:#666;margin-top:24px;font-size:12px;">
          Якщо ви не реєструвались — ігноруйте цей лист.
        </p>
      </div>
    `
  }),

  bidOutbid: (user, lotTitle, newPrice, lotId) => ({
    subject: `Вашу ставку перебито: ${lotTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0f0f23;color:#e0e0e0;border-radius:12px">
        <h1 style="color:#6c5ce7;">KRAM.UA</h1>
        <h2 style="color:#f56565;">Вашу ставку перебито!</h2>
        <p><strong>${lotTitle}</strong></p>
        <p>Нова ціна: <strong style="color:#f56565;">${newPrice} грн.</strong></p>
        <a href="${process.env.DOMAIN || 'http://localhost:3000'}/lot.html?id=${lotId}"
           style="display:inline-block;padding:12px 24px;background:#f56565;color:white;text-decoration:none;border-radius:8px;margin-top:16px;">
          Зробити нову ставку
        </a>
      </div>
    `
  }),

  auctionWon: (user, lotTitle, amount, lotId) => ({
    subject: `Вітаємо! Ви виграли: ${lotTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0f0f23;color:#e0e0e0;border-radius:12px">
        <h1 style="color:#6c5ce7;">KRAM.UA</h1>
        <h2 style="color:#48bb78;">Ви виграли аукціон!</h2>
        <p><strong>${lotTitle}</strong></p>
        <p>Фінальна ціна: <strong style="color:#48bb78;">${amount} грн.</strong></p>
        <p>Перейдіть в кабінет для оплати.</p>
        <a href="${process.env.DOMAIN || 'http://localhost:3000'}/cabinet.html#purchases"
           style="display:inline-block;padding:12px 24px;background:#48bb78;color:#fff;text-decoration:none;border-radius:8px;margin-top:16px;">
          Оплатити
        </a>
      </div>
    `
  }),

  lotSold: (user, lotTitle, amount) => ({
    subject: `Ваш лот продано: ${lotTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0f0f23;color:#e0e0e0;border-radius:12px">
        <h1 style="color:#6c5ce7;">KRAM.UA</h1>
        <h2 style="color:#48bb78;">Ваш лот продано!</h2>
        <p><strong>${lotTitle}</strong></p>
        <p>Сума: <strong style="color:#48bb78;">${amount} грн.</strong></p>
        <p>Очікуйте оплату від покупця.</p>
      </div>
    `
  }),

  paymentReceived: (user, lotTitle, amount) => ({
    subject: `Оплата отримана: ${lotTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0f0f23;color:#e0e0e0;border-radius:12px">
        <h1 style="color:#6c5ce7;">KRAM.UA</h1>
        <h2 style="color:#48bb78;">Оплата отримана!</h2>
        <p><strong>${lotTitle}</strong></p>
        <p>Сума: <strong>${amount} грн.</strong></p>
        <p>Будь ласка, відправте товар та вкажіть ТТН.</p>
      </div>
    `
  }),

  welcomeVerify: (user, token) => ({
    subject: 'Підтвердження email — KRAM.UA',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0f0f23;color:#e0e0e0;border-radius:12px">
        <h1 style="color:#6c5ce7;">KRAM.UA</h1>
        <h2>Підтвердження email</h2>
        <p>Вітаємо, ${user.username}! Для завершення реєстрації підтвердьте ваш email:</p>
        <a href="${process.env.BASE_URL || 'http://localhost:3000'}/verify-email.html?token=${token}"
           style="display:inline-block;padding:12px 24px;background:#6c5ce7;color:white;text-decoration:none;border-radius:8px;margin-top:16px;">
          Підтвердити email
        </a>
        <p style="color:#666;margin-top:24px;font-size:12px;">
          Якщо ви не реєструвались — ігноруйте цей лист.
        </p>
      </div>
    `
  }),

  endingSoon: (user, lotTitle, lotId) => ({
    subject: `Лот завершується: ${lotTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0f0f23;color:#e0e0e0;border-radius:12px">
        <h1 style="color:#6c5ce7;">KRAM.UA</h1>
        <h2 style="color:#f56565;">Лот завершується менш ніж за годину!</h2>
        <p><strong>${lotTitle}</strong></p>
        <a href="${process.env.DOMAIN || 'http://localhost:3000'}/lot.html?id=${lotId}"
           style="display:inline-block;padding:12px 24px;background:#f56565;color:white;text-decoration:none;border-radius:8px;margin-top:16px;">
          Переглянути лот
        </a>
      </div>
    `
  }),

  passwordReset: (user, resetLink) => ({
    subject: 'Відновлення пароля — KRAM.UA',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0f0f23;color:#e0e0e0;border-radius:12px">
        <h1 style="color:#6c5ce7;">KRAM.UA</h1>
        <h2>Відновлення пароля</h2>
        <p>Ви запросили відновлення пароля. Натисніть кнопку нижче:</p>
        <a href="${resetLink}"
           style="display:inline-block;padding:12px 24px;background:#6c5ce7;color:white;text-decoration:none;border-radius:8px;margin-top:16px;">
          Відновити пароль
        </a>
        <p style="color:#666;margin-top:24px;font-size:12px;">
          Посилання дійсне 1 годину. Якщо ви не запитували відновлення — ігноруйте лист.
        </p>
      </div>
    `
  }),
};

async function sendEmail(to, templateName, data) {
  if (!to) return;

  if (!smtpReady || !transporter) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[EMAIL] Dev log: ${templateName} -> ${to}`);
    }
    return;
  }

  try {
    const args = [data.user, ...Object.values(data.params || {})];
    const template = templates[templateName](...args);
    if (!template) {
      console.error(`[EMAIL] Unknown template: ${templateName}`);
      return;
    }

    await transporter.sendMail({
      from: `"KRAM.UA" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[EMAIL] Sent: ${templateName} -> ${to}`);
    }
  } catch (err) {
    console.error(`[EMAIL] Failed (${templateName} -> ${to}): ${err.message}`);
    // Queue for retry
    await queueFailedEmail(to, templateName, data);
  }
}

async function queueFailedEmail(to, templateName, data) {
  try {
    await db.prepare(`
      INSERT INTO email_queue (recipient, template, data_json, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(to, templateName, JSON.stringify(data));
  } catch (e) {
    console.error(`[EMAIL] Failed to queue: ${e.message}`);
  }
}

async function retryFailedEmails() {
  if (!smtpReady) return;

  const MAX_RETRIES = 3;
  const pending = await db.prepare(`
    SELECT * FROM email_queue WHERE retries < ? AND status = 'pending'
    ORDER BY created_at LIMIT 20
  `).all(MAX_RETRIES);

  for (const item of pending) {
    try {
      const data = JSON.parse(item.data_json);
      const args = [data.user, ...Object.values(data.params || {})];
      const template = templates[item.template](...args);

      await transporter.sendMail({
        from: `"KRAM.UA" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: item.recipient,
        subject: template.subject,
        html: template.html,
      });

      await db.prepare(`DELETE FROM email_queue WHERE id = ?`).run(item.id);
    } catch (err) {
      await db.prepare(`
        UPDATE email_queue SET retries = retries + 1, status = CASE WHEN retries + 1 >= ? THEN 'failed' ELSE 'pending' END
        WHERE id = ?
      `).run(MAX_RETRIES, item.id);
    }
  }
}

// Retry every 5 minutes (skip in test mode)
if (process.env.NODE_ENV !== 'test') {
  setInterval(retryFailedEmails, 5 * 60 * 1000);
}

// Init on require
initTransporter();

module.exports = { sendEmail, templates };
