const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'aUc7$xK9mP2vL5nQ8wR4tY6bF3jH0dS1eG7iO9pA2cX5zV8nM4kJ6';

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Необхідна авторизація' });
    }

    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Невалідний токен' });
    }
}

// Optional auth - doesn't fail if no token
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            req.user = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            // Token invalid, continue without user
        }
    }
    next();
}

module.exports = { authenticateToken, optionalAuth, JWT_SECRET };
