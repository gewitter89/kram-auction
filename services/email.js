const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Email templates
const templates = {
    welcome: (user) => ({
        subject: 'Ласкаво просимо на МійАукціон!',
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h1 style="color:#1a73e8;">⚡ МійАукціон</h1>
                <h2>Вітаємо, ${user.username}!</h2>
                <p>Ваш акаунт успішно створено. Тепер ви можете:</p>
                <ul>
                    <li>🔨 Робити ставки на аукціонах</li>
                    <li>📦 Створювати власні лоти</li>
                    <li>❤️ Додавати лоти в обране</li>
                </ul>
                <a href="${process.env.DOMAIN || 'http://localhost:3000'}" 
                   style="display:inline-block;padding:12px 24px;background:#1a73e8;color:white;text-decoration:none;border-radius:6px;margin-top:16px;">
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
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h1 style="color:#1a73e8;">⚡ МійАукціон</h1>
                <h2 style="color:#dc3545;">❌ Вашу ставку перебито!</h2>
                <p><strong>${lotTitle}</strong></p>
                <p>Нова ціна: <strong style="color:#ff6b00;">${newPrice} грн.</strong></p>
                <a href="${process.env.DOMAIN || 'http://localhost:3000'}/lot.html?id=${lotId}" 
                   style="display:inline-block;padding:12px 24px;background:#ff6b00;color:white;text-decoration:none;border-radius:6px;margin-top:16px;">
                    Зробити нову ставку
                </a>
            </div>
        `
    }),

    auctionWon: (user, lotTitle, amount, lotId) => ({
        subject: `Вітаємо! Ви виграли: ${lotTitle}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h1 style="color:#1a73e8;">⚡ МійАукціон</h1>
                <h2 style="color:#28a745;">🎉 Ви виграли аукціон!</h2>
                <p><strong>${lotTitle}</strong></p>
                <p>Фінальна ціна: <strong style="color:#28a745;">${amount} грн.</strong></p>
                <p>Перейдіть в кабінет для оплати.</p>
                <a href="${process.env.DOMAIN || 'http://localhost:3000'}/cabinet.html#purchases" 
                   style="display:inline-block;padding:12px 24px;background:#28a745;color:white;text-decoration:none;border-radius:6px;margin-top:16px;">
                    Оплатити
                </a>
            </div>
        `
    }),

    lotSold: (user, lotTitle, amount) => ({
        subject: `Ваш лот продано: ${lotTitle}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h1 style="color:#1a73e8;">⚡ МійАукціон</h1>
                <h2 style="color:#28a745;">💰 Ваш лот продано!</h2>
                <p><strong>${lotTitle}</strong></p>
                <p>Сума: <strong style="color:#28a745;">${amount} грн.</strong></p>
                <p>Очікуйте оплату від покупця.</p>
            </div>
        `
    }),

    paymentReceived: (user, lotTitle, amount) => ({
        subject: `Оплата отримана: ${lotTitle}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h1 style="color:#1a73e8;">⚡ МійАукціон</h1>
                <h2 style="color:#28a745;">✅ Оплата отримана!</h2>
                <p><strong>${lotTitle}</strong></p>
                <p>Сума: <strong>${amount} грн.</strong></p>
                <p>Будь ласка, відправте товар та вкажіть ТТН.</p>
            </div>
        `
    }),

    endingSoon: (user, lotTitle, lotId) => ({
        subject: `Лот завершується: ${lotTitle}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h1 style="color:#1a73e8;">⚡ МійАукціон</h1>
                <h2 style="color:#dc3545;">⏱ Лот завершується менш ніж за годину!</h2>
                <p><strong>${lotTitle}</strong></p>
                <a href="${process.env.DOMAIN || 'http://localhost:3000'}/lot.html?id=${lotId}" 
                   style="display:inline-block;padding:12px 24px;background:#dc3545;color:white;text-decoration:none;border-radius:6px;margin-top:16px;">
                    Переглянути лот
                </a>
            </div>
        `
    })
};

// Send email function
async function sendEmail(to, templateName, data) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`[EMAIL] Skipped (no SMTP config): ${templateName} -> ${to}`);
        return;
    }

    try {
        const template = templates[templateName](data.user, ...Object.values(data.params || {}));
        await transporter.sendMail({
            from: `"МійАукціон" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to,
            subject: template.subject,
            html: template.html
        });
        console.log(`[EMAIL] Sent: ${templateName} -> ${to}`);
    } catch (err) {
        console.error(`[EMAIL] Error: ${err.message}`);
    }
}

module.exports = { sendEmail, templates };
