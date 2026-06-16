const express = require('express');
const db = require('../database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:username - Public profile
router.get('/:username', optionalAuth, (req, res) => {
    const user = db.prepare(`
        SELECT id, username, first_name, city, bio, avatar, rating, reviews_count, created_at
        FROM users WHERE username = ?
    `).get(req.params.username);

    if (!user) {
        return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    // Count active lots
    const activeLots = db.prepare('SELECT COUNT(*) as count FROM lots WHERE seller_id = ? AND status = ?').get(user.id, 'active').count;
    const totalSold = db.prepare('SELECT COUNT(*) as count FROM lots WHERE seller_id = ? AND status IN (?, ?)').get(user.id, 'completed', 'sold').count;

    // Get reviews
    const reviews = db.prepare(`
        SELECT reviews.*, users.username as reviewer_name
        FROM reviews
        LEFT JOIN users ON reviews.reviewer_id = users.id
        WHERE reviews.seller_id = ?
        ORDER BY reviews.created_at DESC
        LIMIT 20
    `).all(user.id);

    // Rating breakdown
    const ratingBreakdown = db.prepare(`
        SELECT rating, COUNT(*) as count FROM reviews WHERE seller_id = ? GROUP BY rating
    `).all(user.id);

    res.json({
        ...user,
        activeLots,
        totalSold,
        reviews,
        ratingBreakdown
    });
});

// GET /api/users/:username/lots - User's lots
router.get('/:username/lots', (req, res) => {
    const user = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
    if (!user) {
        return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    const { status = 'active', page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const lots = db.prepare(`
        SELECT lots.*, categories.name as category_name,
               (SELECT filename FROM lot_images WHERE lot_id = lots.id AND is_main = 1 LIMIT 1) as main_image
        FROM lots
        LEFT JOIN categories ON lots.category_id = categories.id
        WHERE lots.seller_id = ? AND lots.status = ?
        ORDER BY lots.created_at DESC
        LIMIT ? OFFSET ?
    `).all(user.id, status, Number(limit), offset);

    res.json(lots);
});

module.exports = router;
