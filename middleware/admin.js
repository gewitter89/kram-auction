const db = require('../database');

function requireAdmin(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Необхідна авторизація' });

    try {
        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = require('./auth');
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = db.prepare('SELECT id, username, is_admin FROM users WHERE id = ?').get(decoded.id);
        if (!user || !user.is_admin) {
            return res.status(403).json({ error: 'Доступ заборонено. Потрібні права адміністратора.' });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Невалідний токен' });
    }
}

module.exports = { requireAdmin };