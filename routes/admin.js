const express = require('express');
const db = require('../database');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

router.use(requireAdmin);

router.get('/users', async (req, res) => {
    const { page = 1, limit = 50, search } = req.query;
    let where = '';
    const params = [];
    if (search) {
        where = 'WHERE username LIKE ? OR email LIKE ?';
        params.push(`%${search}%`, `%${search}%`);
    }
    const offset = (Number(page) - 1) * Number(limit);
    const total = await db.prepare(`SELECT COUNT(*) as count FROM users ${where}`).get(...params);
    const users = await db.prepare(`
        SELECT id, username, email, first_name, last_name, city,
               rating, reviews_count, is_active, is_admin, is_verified, created_at
        FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).all(...params, Number(limit), offset);
    res.json({ users, pagination: { page: Number(page), limit: Number(limit), total: total.count, pages: Math.ceil(total.count / Number(limit)) } });
});

router.put('/users/:id/toggle-ban', async (req, res) => {
    const user = await db.prepare('SELECT id, is_active FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });
    if (user.id === req.user.id) return res.status(400).json({ error: 'Не можна заблокувати себе' });
    await db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(user.is_active ? 0 : 1, user.id);
    res.json({ message: `Користувача ${user.is_active ? 'заблоковано' : 'розблоковано'}` });
});

router.put('/users/:id/toggle-admin', async (req, res) => {
    const user = await db.prepare('SELECT id, is_admin FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });
    if (user.id === req.user.id) return res.status(400).json({ error: 'Не можна змінити собі права' });
    await db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(user.is_admin ? 0 : 1, user.id);
    res.json({ message: `Права адміна ${user.is_admin ? 'забрано' : 'надано'}` });
});

router.get('/lots', async (req, res) => {
    const { page = 1, limit = 50, status = 'active', search } = req.query;
    let where = 'WHERE lots.status = ?';
    const params = [status];
    if (search) {
        where += ' AND lots.title LIKE ?';
        params.push(`%${search}%`);
    }
    const offset = (Number(page) - 1) * Number(limit);
    const total = await db.prepare(`SELECT COUNT(*) as count FROM lots ${where}`).get(...params);
    const lots = await db.prepare(`
        SELECT lots.*, users.username as seller_name,
               (SELECT filename FROM lot_images WHERE lot_id = lots.id AND is_main = 1 LIMIT 1) as main_image
        FROM lots LEFT JOIN users ON lots.seller_id = users.id
        ${where} ORDER BY lots.created_at DESC LIMIT ? OFFSET ?
    `).all(...params, Number(limit), offset);
    res.json({ lots, pagination: { page: Number(page), limit: Number(limit), total: total.count, pages: Math.ceil(total.count / Number(limit)) } });
});

router.delete('/lots/:id', async (req, res) => {
    const lot = await db.prepare('SELECT id, title FROM lots WHERE id = ?').get(req.params.id);
    if (!lot) return res.status(404).json({ error: 'Лот не знайдено' });
    await db.prepare('DELETE FROM lot_images WHERE lot_id = ?').run(lot.id);
    await db.prepare('DELETE FROM bids WHERE lot_id = ?').run(lot.id);
    await db.prepare('DELETE FROM favorites WHERE lot_id = ?').run(lot.id);
    await db.prepare('DELETE FROM notifications WHERE lot_id = ?').run(lot.id);
    await db.prepare('DELETE FROM purchases WHERE lot_id = ?').run(lot.id);
    await db.prepare('DELETE FROM lots WHERE id = ?').run(lot.id);
    res.json({ message: `Лот "${lot.title}" видалено` });
});

router.get('/stats', async (req, res) => {
    const stats = {
        totalUsers: (await db.prepare('SELECT COUNT(*) as count FROM users').get()).count,
        totalLots: (await db.prepare('SELECT COUNT(*) as count FROM lots').get()).count,
        activeLots: (await db.prepare("SELECT COUNT(*) as count FROM lots WHERE status = 'active'").get()).count,
        totalBids: (await db.prepare('SELECT COUNT(*) as count FROM bids').get()).count,
        totalPurchases: (await db.prepare("SELECT COUNT(*) as count FROM purchases WHERE status = 'pending'").get()).count,
        completedPurchases: (await db.prepare("SELECT COUNT(*) as count FROM purchases WHERE status = 'received'").get()).count,
        newUsersToday: (await db.prepare("SELECT COUNT(*) as count FROM users WHERE date(created_at) = date('now')").get()).count,
        revenue: (await db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM purchases').get()).total
    };
    res.json(stats);
});

router.get('/purchases', async (req, res) => {
    const { page = 1, limit = 20, status, search } = req.query;
    let where = '';
    const params = [];
    if (status && status !== 'all') {
        where += 'WHERE p.status = ?';
        params.push(status);
    }
    if (search) {
        if (where) where += ' AND '; else where = 'WHERE ';
        where += '(l.title LIKE ? OR u1.username LIKE ? OR u2.username LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const offset = (Number(page) - 1) * Number(limit);
    const total = await db.prepare(`SELECT COUNT(*) as count FROM purchases p LEFT JOIN lots l ON p.lot_id = l.id LEFT JOIN users u1 ON p.buyer_id = u1.id LEFT JOIN users u2 ON p.seller_id = u2.id ${where}`).get(...params);
    const purchases = await db.prepare(`
        SELECT p.*, l.title as lot_title, u1.username as buyer_name, u2.username as seller_name
        FROM purchases p
        LEFT JOIN lots l ON p.lot_id = l.id
        LEFT JOIN users u1 ON p.buyer_id = u1.id
        LEFT JOIN users u2 ON p.seller_id = u2.id
        ${where}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    `).all(...params, Number(limit), offset);
    res.json({ purchases, total: total.count, pages: Math.ceil(total.count / Number(limit)), page: Number(page) });
});

router.put('/purchases/:id/status', async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'shipped', 'received'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Невірний статус' });
    }
    const purchase = await db.prepare('SELECT * FROM purchases WHERE id = ?').get(req.params.id);
    if (!purchase) return res.status(404).json({ error: 'Покупку не знайдено' });
    const updates = { status };
    if (status === 'paid') updates.paid_at = new Date().toISOString();
    if (status === 'shipped') updates.shipped_at = new Date().toISOString();
    if (status === 'received') updates.received_at = new Date().toISOString();
    const cols = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const vals = Object.values(updates);
    vals.push(req.params.id);
    await db.prepare(`UPDATE purchases SET ${cols} WHERE id = ?`).run(...vals);
    res.json({ message: 'Статус оновлено' });
});

module.exports = router;
