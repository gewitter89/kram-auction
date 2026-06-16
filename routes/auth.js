const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
    const { username, email, password, firstName, lastName, phone, city } = req.body;

    // Validation
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Логін, email та пароль обов\'язкові' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'Пароль має бути мінімум 8 символів' });
    }
    if (username.length < 3) {
        return res.status(400).json({ error: 'Логін має бути мінімум 3 символи' });
    }

    // Check if user exists
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing) {
        return res.status(409).json({ error: 'Користувач з таким логіном або email вже існує' });
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Create user
    const result = db.prepare(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, phone, city)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(username, email, passwordHash, firstName || null, lastName || null, phone || null, city || null);

    // Generate token
    const token = jwt.sign(
        { id: result.lastInsertRowid, username, email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.status(201).json({
        message: 'Реєстрація успішна!',
        token,
        user: {
            id: result.lastInsertRowid,
            username,
            email,
            firstName,
            lastName
        }
    });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return res.status(400).json({ error: 'Введіть логін/email та пароль' });
    }

    // Find user by username or email
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(login, login);
    if (!user) {
        return res.status(401).json({ error: 'Невірний логін або пароль' });
    }

    // Check password
    if (!bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: 'Невірний логін або пароль' });
    }

    if (!user.is_active) {
        return res.status(403).json({ error: 'Акаунт заблоковано' });
    }

    // Generate token
    const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

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

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, (req, res) => {
    const user = db.prepare(`
        SELECT id, username, email, first_name, last_name, phone, city, bio, 
               avatar, rating, reviews_count, created_at, is_verified
        FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
        return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    res.json(user);
});

// PUT /api/auth/profile - Update profile
router.put('/profile', authenticateToken, (req, res) => {
    const { firstName, lastName, phone, city, bio } = req.body;

    db.prepare(`
        UPDATE users SET first_name = ?, last_name = ?, phone = ?, city = ?, bio = ?
        WHERE id = ?
    `).run(firstName, lastName, phone, city, bio, req.user.id);

    res.json({ message: 'Профіль оновлено' });
});

// PUT /api/auth/password - Change password
router.put('/password', authenticateToken, (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Введіть поточний та новий пароль' });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Новий пароль має бути мінімум 8 символів' });
    }

    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
        return res.status(401).json({ error: 'Невірний поточний пароль' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

    res.json({ message: 'Пароль змінено' });
});

module.exports = router;
