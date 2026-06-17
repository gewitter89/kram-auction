const express = require('express');
const db = require('../database');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// All routes require admin
router.use(requireAdmin);

// GET /api/admin/users - List users
router.get('/users', (req, res) => {
    const { page = 1, limit = 50, search } = req.query;
    let where = '';
    const params = [];
    if (search) {
        where = 'WHERE username LIKE ? OR email LIKE ?';
        params.push(`%${search}%`, `%${search}%`);
    }
    const offset = (Number(page) - 1) * Number(limit);
    const total = db.prepare(`SELECT COUNT(*) as count FROM users ${where}`).get(...params).count;
    const users = db.prepare(`
        SELECT id, username, email, first_name, last_name, city,
               rating, reviews_count, is_active, is_admin, is_verified, created_at
        FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).all(...params, Number(limit), offset);
    res.json({ users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

// PUT /api/admin/users/:id/toggle-ban
router.put('/users/:id/toggle-ban', (req, res) => {
    const user = db.prepare('SELECT id, is_active FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });
    if (user.id === req.user.id) return res.status(400).json({ error: 'Не можна заблокувати себе' });
    db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(user.is_active ? 0 : 1, user.id);
    res.json({ message: `Користувача ${user.is_active ? 'заблоковано' : 'розблоковано'}` });
});

// PUT /api/admin/users/:id/toggle-admin
router.put('/users/:id/toggle-admin', (req, res) => {
    const user = db.prepare('SELECT id, is_admin FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });
    if (user.id === req.user.id) return res.status(400).json({ error: 'Не можна змінити собі права' });
    db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(user.is_admin ? 0 : 1, user.id);
    res.json({ message: `Права адміна ${user.is_admin ? 'забрано' : 'надано'}` });
});

// GET /api/admin/lots - List all lots (moderation)
router.get('/lots', (req, res) => {
    const { page = 1, limit = 50, status = 'active', search } = req.query;
    let where = 'WHERE lots.status = ?';
    const params = [status];
    if (search) {
        where += ' AND lots.title LIKE ?';
        params.push(`%${search}%`);
    }
    const offset = (Number(page) - 1) * Number(limit);
    const total = db.prepare(`SELECT COUNT(*) as count FROM lots ${where}`).get(...params).count;
    const lots = db.prepare(`
        SELECT lots.*, users.username as seller_name,
               (SELECT filename FROM lot_images WHERE lot_id = lots.id AND is_main = 1 LIMIT 1) as main_image
        FROM lots LEFT JOIN users ON lots.seller_id = users.id
        ${where} ORDER BY lots.created_at DESC LIMIT ? OFFSET ?
    `).all(...params, Number(limit), offset);
    res.json({ lots, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

// DELETE /api/admin/lots/:id - Force delete
router.delete('/lots/:id', (req, res) => {
    const lot = db.prepare('SELECT id, title FROM lots WHERE id = ?').get(req.params.id);
    if (!lot) return res.status(404).json({ error: 'Лот не знайдено' });
    db.prepare('DELETE FROM lot_images WHERE lot_id = ?').run(lot.id);
    db.prepare('DELETE FROM bids WHERE lot_id = ?').run(lot.id);
    db.prepare('DELETE FROM favorites WHERE lot_id = ?').run(lot.id);
    db.prepare('DELETE FROM notifications WHERE lot_id = ?').run(lot.id);
    db.prepare('DELETE FROM purchases WHERE lot_id = ?').run(lot.id);
    db.prepare('DELETE FROM lots WHERE id = ?').run(lot.id);
    res.json({ message: `Лот "${lot.title}" видалено` });
});

// GET /api/admin/stats - Dashboard stats
router.get('/stats', (req, res) => {
    const stats = {
        totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
        totalLots: db.prepare('SELECT COUNT(*) as count FROM lots').get().count,
        activeLots: db.prepare("SELECT COUNT(*) as count FROM lots WHERE status = 'active'").get().count,
        totalBids: db.prepare('SELECT COUNT(*) as count FROM bids').get().count,
        totalPurchases: db.prepare("SELECT COUNT(*) as count FROM purchases WHERE status = 'pending'").get().count,
        completedPurchases: db.prepare("SELECT COUNT(*) as count FROM purchases WHERE status = 'received'").get().count,
        newUsersToday: db.prepare("SELECT COUNT(*) as count FROM users WHERE date(created_at) = date('now')").get().count,
        revenue: db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM purchases').get().total
    };
    res.json(stats);
});

module.exports = router;