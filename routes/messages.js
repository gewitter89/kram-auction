const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    const conversations = await db.prepare(`
        SELECT
            m.*,
            CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as other_user_id,
            u.username as other_username,
            u.avatar as other_avatar
        FROM messages m
        LEFT JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
        WHERE m.id IN (
            SELECT MAX(id) FROM messages
            WHERE sender_id = ? OR receiver_id = ?
            GROUP BY CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
        )
        ORDER BY m.created_at DESC
    `).all(req.user.id, req.user.id, req.user.id, req.user.id, req.user.id);

    res.json(conversations);
});

router.get('/:userId', authenticateToken, async (req, res) => {
    const messages = await db.prepare(`
        SELECT messages.*, users.username as sender_name
        FROM messages
        LEFT JOIN users ON messages.sender_id = users.id
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at ASC
    `).all(req.user.id, req.params.userId, req.params.userId, req.user.id);

    await db.prepare(`
        UPDATE messages SET is_read = 1
        WHERE receiver_id = ? AND sender_id = ? AND is_read = 0
    `).run(req.user.id, req.params.userId);

    res.json(messages);
});

router.post('/', authenticateToken, async (req, res) => {
    const { receiverId, text, lotId } = req.body;

    if (!receiverId || !text) {
        return res.status(400).json({ error: 'Вкажіть отримувача та текст' });
    }
    if (Number(receiverId) === req.user.id) {
        return res.status(400).json({ error: 'Не можна надіслати повідомлення собі' });
    }

    const receiver = await db.prepare('SELECT id FROM users WHERE id = ?').get(receiverId);
    if (!receiver) {
        return res.status(404).json({ error: 'Отримувача не знайдено' });
    }

    const result = await db.prepare(`
        INSERT INTO messages (sender_id, receiver_id, lot_id, text)
        VALUES (?, ?, ?, ?)
    `).run(req.user.id, Number(receiverId), lotId ? Number(lotId) : null, text);

    await db.prepare(`
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (?, 'message', 'Нове повідомлення', ?)
    `).run(Number(receiverId), `Нове повідомлення від ${req.user.username}`);

    res.status(201).json({ message: 'Повідомлення надіслано', id: result.lastInsertRowid });
});

router.get('/unread/count', authenticateToken, async (req, res) => {
    const count = await db.prepare(`
        SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0
    `).get(req.user.id);
    res.json({ count: count ? count.count : 0 });
});

module.exports = router;
