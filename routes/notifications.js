const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const notifications = await db.prepare(`
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    `).all(req.user.id, Number(limit), offset);

    const unreadCount = await db.prepare(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0
    `).get(req.user.id);

    res.json({ notifications, unreadCount: unreadCount ? unreadCount.count : 0 });
});

router.get('/unread', authenticateToken, async (req, res) => {
    const count = await db.prepare(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0
    `).get(req.user.id);
    res.json({ count: count ? count.count : 0 });
});

router.put('/read-all', authenticateToken, async (req, res) => {
    await db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(req.user.id);
    res.json({ message: 'Всі прочитано' });
});

router.put('/:id/read', authenticateToken, async (req, res) => {
    await db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Прочитано' });
});

router.delete('/:id', authenticateToken, async (req, res) => {
    await db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Видалено' });
});

module.exports = router;
