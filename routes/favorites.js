const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    const favorites = await db.prepare(`
        SELECT lots.*, categories.name as category_name,
               users.username as seller_name,
               (SELECT filename FROM lot_images WHERE lot_id = lots.id AND is_main = 1 LIMIT 1) as main_image
        FROM favorites
        LEFT JOIN lots ON favorites.lot_id = lots.id
        LEFT JOIN categories ON lots.category_id = categories.id
        LEFT JOIN users ON lots.seller_id = users.id
        WHERE favorites.user_id = ?
        ORDER BY favorites.created_at DESC
    `).all(req.user.id);
    res.json(favorites);
});

router.post('/:lotId', authenticateToken, async (req, res) => {
    const lotId = Number(req.params.lotId);

    const lot = await db.prepare('SELECT id FROM lots WHERE id = ?').get(lotId);
    if (!lot) {
        return res.status(404).json({ error: 'Лот не знайдено' });
    }

    try {
        await db.prepare('INSERT INTO favorites (user_id, lot_id) VALUES (?, ?)').run(req.user.id, lotId);
        res.status(201).json({ message: 'Додано в обране' });
    } catch (err) {
        if (err.message && (err.message.includes('UNIQUE') || err.code === '23505')) {
            return res.status(409).json({ error: 'Вже в обраному' });
        }
        throw err;
    }
});

router.delete('/:lotId', authenticateToken, async (req, res) => {
    await db.prepare('DELETE FROM favorites WHERE user_id = ? AND lot_id = ?').run(req.user.id, Number(req.params.lotId));
    res.json({ message: 'Видалено з обраного' });
});

module.exports = router;
