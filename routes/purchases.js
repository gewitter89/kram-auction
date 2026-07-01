const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    const purchases = await db.prepare(`
        SELECT purchases.*, lots.title as lot_title,
               users.username as seller_name,
               (SELECT filename FROM lot_images WHERE lot_id = lots.id AND is_main = 1 LIMIT 1) as lot_image
        FROM purchases
        LEFT JOIN lots ON purchases.lot_id = lots.id
        LEFT JOIN users ON purchases.seller_id = users.id
        WHERE purchases.buyer_id = ?
        ORDER BY purchases.created_at DESC
    `).all(req.user.id);
    res.json(purchases);
});

router.get('/sales', authenticateToken, async (req, res) => {
    const sales = await db.prepare(`
        SELECT purchases.*, lots.title as lot_title,
               users.username as buyer_name,
               (SELECT filename FROM lot_images WHERE lot_id = lots.id AND is_main = 1 LIMIT 1) as lot_image
        FROM purchases
        LEFT JOIN lots ON purchases.lot_id = lots.id
        LEFT JOIN users ON purchases.buyer_id = users.id
        WHERE purchases.seller_id = ?
        ORDER BY purchases.created_at DESC
    `).all(req.user.id);
    res.json(sales);
});

router.put('/:id/pay', authenticateToken, async (req, res) => {
    const purchase = await db.prepare('SELECT * FROM purchases WHERE id = ? AND buyer_id = ?').get(req.params.id, req.user.id);
    if (!purchase) {
        return res.status(404).json({ error: 'Покупку не знайдено' });
    }
    if (purchase.status !== 'pending') {
        return res.status(400).json({ error: 'Покупка вже оплачена або в іншому статусі' });
    }

    await db.prepare("UPDATE purchases SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);

    await db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, lot_id)
        VALUES (?, 'payment', 'Оплата отримана!', 'Покупець оплатив замовлення. Відправте товар.', ?)
    `).run(purchase.seller_id, purchase.lot_id);

    res.json({ message: 'Оплату підтверджено' });
});

router.put('/:id/ship', authenticateToken, async (req, res) => {
    const { trackingNumber } = req.body;
    const purchase = await db.prepare('SELECT * FROM purchases WHERE id = ? AND seller_id = ?').get(req.params.id, req.user.id);
    if (!purchase) {
        return res.status(404).json({ error: 'Продаж не знайдено' });
    }
    if (purchase.status !== 'paid') {
        return res.status(400).json({ error: 'Спочатку потрібно оплатити покупку' });
    }

    await db.prepare(`
        UPDATE purchases SET status = 'shipped', shipped_at = CURRENT_TIMESTAMP, tracking_number = ? WHERE id = ?
    `).run(trackingNumber || null, req.params.id);

    await db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, lot_id)
        VALUES (?, 'shipped', 'Товар відправлено!', ?, ?)
    `).run(purchase.buyer_id, `ТТН: ${trackingNumber || 'не вказано'}`, purchase.lot_id);

    res.json({ message: 'Відправку підтверджено' });
});

router.put('/:id/receive', authenticateToken, async (req, res) => {
    const purchase = await db.prepare('SELECT * FROM purchases WHERE id = ? AND buyer_id = ?').get(req.params.id, req.user.id);
    if (!purchase) {
        return res.status(404).json({ error: 'Покупку не знайдено' });
    }
    if (purchase.status !== 'shipped') {
        return res.status(400).json({ error: 'Товар ще не відправлено' });
    }

    await db.prepare(`
        UPDATE purchases SET status = 'received', received_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(req.params.id);

    await db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, lot_id)
        VALUES (?, 'received', 'Товар отримано!', 'Покупець підтвердив отримання.', ?)
    `).run(purchase.seller_id, purchase.lot_id);

    res.json({ message: 'Отримання підтверджено' });
});

router.post('/:id/review', authenticateToken, async (req, res) => {
    const { rating, text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Оцінка від 1 до 5' });
    }

    const purchase = await db.prepare('SELECT * FROM purchases WHERE id = ? AND buyer_id = ?').get(req.params.id, req.user.id);
    if (!purchase) {
        return res.status(404).json({ error: 'Покупку не знайдено' });
    }
    if (purchase.status !== 'received') {
        return res.status(400).json({ error: 'Спочатку підтвердіть отримання' });
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

    res.status(201).json({ message: 'Відгук залишено' });
});

module.exports = router;
