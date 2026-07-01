const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/seller/:sellerId', async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const reviews = await db.prepare(`
        SELECT reviews.*, users.username as reviewer_name, lots.title as lot_title
        FROM reviews
        LEFT JOIN users ON reviews.reviewer_id = users.id
        LEFT JOIN lots ON reviews.lot_id = lots.id
        WHERE reviews.seller_id = ?
        ORDER BY reviews.created_at DESC
        LIMIT ? OFFSET ?
    `).all(req.params.sellerId, Number(limit), offset);

    const stats = await db.prepare(`
        SELECT
            COUNT(*) as total,
            AVG(rating) as average,
            SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five,
            SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four,
            SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three,
            SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two,
            SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one
        FROM reviews WHERE seller_id = ?
    `).get(req.params.sellerId);

    res.json({ reviews, stats });
});

router.post('/', authenticateToken, async (req, res) => {
    const { purchaseId, rating, text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Оцінка від 1 до 5' });
    }

    const purchase = await db.prepare(`
        SELECT * FROM purchases WHERE id = ? AND buyer_id = ? AND status = 'received'
    `).get(purchaseId, req.user.id);

    if (!purchase) {
        return res.status(404).json({ error: 'Покупку не знайдено або товар ще не отримано' });
    }

    const existing = await db.prepare('SELECT id FROM reviews WHERE reviewer_id = ? AND lot_id = ?').get(req.user.id, purchase.lot_id);
    if (existing) {
        return res.status(409).json({ error: 'Ви вже залишили відгук' });
    }

    await db.prepare(`
        INSERT INTO reviews (reviewer_id, seller_id, lot_id, rating, text)
        VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, purchase.seller_id, purchase.lot_id, rating, text || '');

    const avgRating = await db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE seller_id = ?').get(purchase.seller_id);
    await db.prepare('UPDATE users SET rating = ?, reviews_count = ? WHERE id = ?').run(
        Math.round(avgRating.avg * 10) / 10, avgRating.count, purchase.seller_id
    );

    await db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, lot_id)
        VALUES (?, 'review', 'Новий відгук!', ?, ?)
    `).run(purchase.seller_id, `Покупець залишив відгук: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`, purchase.lot_id);

    res.status(201).json({ message: 'Відгук залишено!' });
});

module.exports = router;
