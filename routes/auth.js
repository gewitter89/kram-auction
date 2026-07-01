const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { OAuth2Client } = require('google-auth-library');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const db = require('../database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const { sendEmail } = require('../services/email');

const router = express.Router();
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: { error: 'Забагато спроб. Спробуйте через 15 хвилин.' }
});

router.post('/register', async (req, res) => {
    const { username, email, password, firstName, lastName, phone, city } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Логін, email та пароль обов\'язкові' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'Пароль має бути мінімум 8 символів' });
    }
    if (username.length < 3) {
        return res.status(400).json({ error: 'Логін має бути мінімум 3 символи' });
    }

    const existing = await db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing) {
        return res.status(409).json({ error: 'Користувач з таким логіном або email вже існує' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const emailToken = crypto.randomBytes(32).toString('hex');
    const result = await db.prepare(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, phone, city, email_token, email_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(username, email, passwordHash, firstName || null, lastName || null, phone || null, city || null, emailToken);

    sendEmail(email, 'welcomeVerify', { user: { username }, params: { token: emailToken } });

    const token = jwt.sign(
        { id: result.lastInsertRowid, username, email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.status(201).json({
        message: 'Перевірте email для підтвердження',
        token,
        user: { id: result.lastInsertRowid, username, email, firstName, lastName }
    });
});

router.post('/login', async (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return res.status(400).json({ error: 'Введіть логін/email та пароль' });
    }

    const user = await db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(login, login);
    if (!user) {
        return res.status(401).json({ error: 'Невірний логін або пароль' });
    }

    if (!(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Невірний логін або пароль' });
    }

    if (!user.is_active) {
        return res.status(403).json({ error: 'Акаунт заблоковано' });
    }

    if (!user.email_verified) {
        return res.status(403).json({ error: 'Email не підтверджено. Перевірте пошту.' });
    }

    if (user.two_factor_enabled) {
        return res.json({ require2FA: true, tempToken: jwt.sign({ id: user.id, type: '2fa' }, JWT_SECRET, { expiresIn: '5m' }) });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.cookie('csrf_token', crypto.randomBytes(32).toString('hex'), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
        message: 'Вхід успішний!',
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            rating: user.rating,
            reviewsCount: user.reviews_count,
            city: user.city
        }
    });
});

router.get('/me', authenticateToken, async (req, res) => {
    const user = await db.prepare(`
        SELECT id, username, email, first_name, last_name, phone, city, bio,
               avatar, rating, reviews_count, created_at, is_verified
        FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
        return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    res.json(user);
});

router.put('/profile', authenticateToken, async (req, res) => {
    const { firstName, lastName, phone, city, bio } = req.body;

    await db.prepare(`
        UPDATE users SET first_name = ?, last_name = ?, phone = ?, city = ?, bio = ?
        WHERE id = ?
    `).run(firstName, lastName, phone, city, bio, req.user.id);

    res.json({ message: 'Профіль оновлено' });
});

router.put('/password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Введіть поточний та новий пароль' });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Новий пароль має бути мінімум 8 символів' });
    }

    const user = await db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
        return res.status(401).json({ error: 'Невірний поточний пароль' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

    res.json({ message: 'Пароль змінено' });
});

router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email обов\'язковий' });
    }

    const user = await db.prepare('SELECT id, username FROM users WHERE email = ?').get(email);
    if (!user) {
        return res.json({ message: 'Якщо email зареєстровано, посилання надіслано.' });
    }
    const token = jwt.sign({ id: user.id, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
    await db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = datetime("now", "+1 hour") WHERE id = ?')
        .run(token, user.id);

    const resetLink = `${process.env.BASE_URL || 'https://kram.ua'}/reset-password.html?token=${token}`;
    sendEmail(email, 'passwordReset', { user, params: { resetLink } });

    res.json({ message: 'Якщо email зареєстровано, посилання для відновлення надіслано.' });
});

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Токен і новий пароль обов\'язкові' });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Пароль має бути мінімум 8 символів' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.type !== 'reset') {
            return res.status(400).json({ error: 'Невірний токен' });
        }

        const user = await db.prepare('SELECT id, reset_token FROM users WHERE id = ?').get(decoded.id);
        if (!user || user.reset_token !== token) {
            return res.status(400).json({ error: 'Токен недійсний або вже використаний' });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        await db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?')
            .run(hash, decoded.id);

        res.json({ message: 'Пароль успішно змінено. Увійдіть з новим паролем.' });
    } catch (e) {
        return res.status(400).json({ error: 'Токен прострочений або недійсний' });
    }
});

router.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ error: 'Токен відсутній' });
    }

    const user = await db.prepare('SELECT id FROM users WHERE email_token = ?').get(token);
    if (!user) {
        return res.status(400).json({ error: 'Невірний або вже використаний токен' });
    }

    await db.prepare('UPDATE users SET email_verified = 1, email_token = NULL WHERE id = ?').run(user.id);
    res.json({ message: 'Email підтверджено! Тепер ви можете увійти.' });
});

router.post('/telegram-link', authenticateToken, async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Telegram username обов\'язковий' });
    }

    const code = crypto.randomBytes(12).toString('hex');
    await db.prepare('UPDATE users SET telegram_chat_id = ? WHERE id = ?').run(code, req.user.id);

    res.json({ message: 'Код прив\'язки створено', code });
});

// Google OAuth
router.get('/google', (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(501).json({ error: 'Google OAuth не налаштовано' });
    }
    const url = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email'],
        prompt: 'select_account',
    });
    res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) return res.redirect('/login.html?error=no_code');

        const { tokens } = await googleClient.getToken(code);
        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        let user = await db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
        if (!user) {
            user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
            if (user) {
                await db.prepare('UPDATE users SET google_id = ?, email_verified = 1 WHERE id = ?').run(googleId, user.id);
            } else {
                const username = (email.split('@')[0] + '_' + Date.now().toString(36)).substring(0, 30);
                const result = await db.prepare(`
                    INSERT INTO users (username, email, password_hash, first_name, last_name, avatar, google_id, email_verified)
                    VALUES (?, ?, '', ?, ?, ?, ?, 1)
                `).run(username, email, name?.split(' ')[0] || '', name?.split(' ').slice(1).join(' ') || '', picture || '', googleId);
                user = { id: result.lastInsertRowid, username, email };
            }
        }

        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.redirect(`/cabinet.html?token=${token}`);
    } catch (e) {
        console.error('[GOOGLE] Auth error:', e.message);
        res.redirect('/login.html?error=google_auth_failed');
    }
});

// 2FA Setup
router.get('/2fa/setup', authenticateToken, async (req, res) => {
    const secret = speakeasy.generateSecret({ name: `KRAM.UA:${req.user.username}` });
    await db.prepare('UPDATE users SET two_factor_secret = ? WHERE id = ?').run(secret.base32, req.user.id);
    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ secret: secret.base32, qrDataUrl });
});

router.post('/2fa/verify', authenticateToken, async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Код обов\'язковий' });

    const user = await db.prepare('SELECT two_factor_secret FROM users WHERE id = ?').get(req.user.id);
    if (!user?.two_factor_secret) return res.status(400).json({ error: '2FA не налаштовано' });

    const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token,
        window: 1,
    });

    if (!verified) return res.status(400).json({ error: 'Невірний код' });

    await db.prepare('UPDATE users SET two_factor_enabled = 1 WHERE id = ?').run(req.user.id);
    res.json({ message: '2FA активовано' });
});

router.post('/2fa/disable', authenticateToken, async (req, res) => {
    await db.prepare('UPDATE users SET two_factor_secret = NULL, two_factor_enabled = 0 WHERE id = ?').run(req.user.id);
    res.json({ message: '2FA вимкнено' });
});

router.post('/2fa/login', async (req, res) => {
    const { tempToken, token } = req.body;
    if (!tempToken || !token) return res.status(400).json({ error: 'Тимчасовий токен і код 2FA обов\'язкові' });

    let decoded;
    try { decoded = jwt.verify(tempToken, JWT_SECRET); } catch(e) { return res.status(401).json({ error: 'Час вийшов, увійдіть знову' }); }
    if (decoded.type !== '2fa') return res.status(401).json({ error: 'Невірний токен' });

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });

    const verified = speakeasy.totp.verify({ secret: user.two_factor_secret, encoding: 'base32', token, window: 1 });
    if (!verified) return res.status(401).json({ error: 'Невірний код 2FA' });

    const jwtToken = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Вхід успішний!', token: jwtToken, user: { id: user.id, username: user.username, email: user.email } });
});

module.exports = router;
