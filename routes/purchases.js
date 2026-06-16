const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/purchases - My purchases (as buyer)
router.get('/', authenticateToken, (req, res) => {
    const purchases = db.prepare(`
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

// GET /api/purchases/sales - My sales (as seller)
router.get('/sales', authenticateToken, (req, res) => {
    const sales = db.prepare(`
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

// PUT /api/purchases/:id/pay - Mark as paid
router.put('/:id/pay', authenticateToken, (req, res) => {
    const purchase = db.prepare('SELECT * FROM purchases WHERE id = ? AND buyer_id = ?').get(req.params.id, req.user.id);
    if (!purchase) {
        return res.status(404).json({ error: 'Покупку не знайдено' });
    }

    db.prepare("UPDATE purchases SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);

    // Notify seller
    db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, lot_id)
        VALUES (?, 'payment', 'Оплата отримана!', 'Покупець оплатив замовлення. Відправте товар.', ?)
    `).run(purchase.seller_id, purchase.lot_id);

    res.json({ message: 'Оплату підтверджено' });
});

// PUT /api/purchases/:id/ship - Mark as shipped
router.put('/:id/ship', authenticateToken, (req, res) => {
    const { trackingNumber } = req.body;
    const purchase = db.prepare('SELECT * FROM purchases WHERE id = ? AND seller_id = ?').get(req.params.id, req.user.id);
    if (!purchase) {
        return res.status(404).json({ error: 'Продаж не знайдено' });
    }

    db.prepare(`
        UPDATE purchases SET status = 'shipped', shipped_at = CURRENT_TIMESTAMP, tracking_number = ? WHERE id = ?
    `).run(trackingNumber || null, req.params.id);

    // Notify buyer
    db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, lot_id)
        VALUES (?, 'shipped', 'Товар відправлено!', ?, ?)
    `).run(purchase.buyer_id, `ТТН: ${trackingNumber || 'не вказано'}`, purchase.lot_id);

    res.json({ message: 'Відправку підтверджено' });
});

// PUT /api/purchases/:id/receive - Mark as received
router.put('/:id/receive', authenticateToken, (req, res) => {
    const purchase = db.prepare('SELECT * FROM purchases WHERE id = ? AND buyer_id = ?').get(req.params.id, req.user.id);
    if (!purchase) {
        return res.status(404).json({ error: 'Покупку не знайдено' });
    }

    db.prepare(`
        UPDATE purchases SET status = 'received', received_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(req.params.id);

    // Notify seller
    db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, lot_id)
        VALUES (?, 'received', 'Товар отримано!', 'Покупець підтвердив отримання.', ?)
    `).run(purchase.seller_id, purchase.lot_id);

    res.json({ message: 'Отримання підтверджено' });
});

// POST /api/purchases/:id/review - Leave review
router.post('/:id/review', authenticateToken, (req, res) => {
    const { rating, text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Оцінка від 1 до 5' });
    }

    const purchase = db.prepare('SELECT * FROM purchases WHERE id = ? AND buyer_id = ?').get(req.params.id, req.user.id);
    if (!purchase) {
        return res.status(404).json({ error: 'Покупку не знайдено' });
    }
    if (purchase.status !== 'received') {
        return res.status(400).json({ error: 'Спочатку підтвердіть отримання' });
    }

    // Check if already reviewed
    const existing = db.prepare('SELECT id FROM reviews WHERE reviewer_id = ? AND lot_id = ?').get(req.user.id, purchase.lot_id);
    if (existing) {
        return res.status(409).json({ error: 'Ви вже залишили відгук' });
    }

    db.prepare(`
        INSERT INTO reviews (reviewer_id, seller_id, lot_id, rating, text)
        VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, purchase.seller_id, purchase.lot_id, rating, text || '');

    // Update seller rating
    const avgRating = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE seller_id = ?').get(purchase.seller_id);
    db.prepare('UPDATE users SET rating = ?, reviews_count = ? WHERE id = ?').run(
        Math.round(avgRating.avg * 10) / 10, avgRating.count, purchase.seller_id
    );

    res.status(201).json({ message: 'Відгук залишено' });
});

module.exports = router;
