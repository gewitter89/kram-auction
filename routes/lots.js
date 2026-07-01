const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

let sharp;
try { sharp = require('sharp'); } catch(e) { sharp = null; }

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) cb(null, true);
        else cb(new Error('Тільки зображення (jpg, png, webp)'));
    }
});

router.get('/', optionalAuth, async (req, res) => {
    const {
        page = 1, limit = 30, category, search, sort = 'ending',
        minPrice, maxPrice, condition, saleType, sellerId
    } = req.query;

    let where = "WHERE lots.status = 'active'";
    const params = [];

    if (category) { where += ' AND categories.slug = ?'; params.push(category); }
    if (search) {
        if (search.length > 2) {
            const countQuery = `SELECT COUNT(*) as total FROM lots
                JOIN lots_fts ON lots.id = lots_fts.rowid
                LEFT JOIN categories ON lots.category_id = categories.id
                WHERE lots.status = 'active' AND lots_fts MATCH ?`;
            const ftsWhere = `JOIN lots_fts ON lots.id = lots_fts.rowid WHERE lots.status = 'active' AND lots_fts MATCH ?`;
            const lotsQuery = `
                SELECT lots.*,
                       categories.name as category_name, categories.slug as category_slug,
                       users.username as seller_name, users.rating as seller_rating, users.reviews_count as seller_reviews,
                       (SELECT filename FROM lot_images WHERE lot_id = lots.id AND is_main = 1 LIMIT 1) as main_image
                FROM lots
                LEFT JOIN categories ON lots.category_id = categories.id
                LEFT JOIN users ON lots.seller_id = users.id
                ${ftsWhere}
                ORDER BY rank
                LIMIT ? OFFSET ?
            `;
            const offset = (Number(page) - 1) * Number(limit);
            const total = (await db.prepare(countQuery).get(search)).total;
            const lots = await db.prepare(lotsQuery).all(search, Number(limit), offset);
            return res.json({
                lots,
                pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
            });
        } else {
            where += ' AND lots.title LIKE ?';
            params.push(`%${search}%`);
        }
    }
    if (minPrice) { where += ' AND lots.current_price >= ?'; params.push(Number(minPrice)); }
    if (maxPrice) { where += ' AND lots.current_price <= ?'; params.push(Number(maxPrice)); }
    if (condition) { where += ' AND lots.condition = ?'; params.push(condition); }
    if (saleType) { where += ' AND lots.sale_type = ?'; params.push(saleType); }
    if (sellerId) { where += ' AND lots.seller_id = ?'; params.push(Number(sellerId)); }

    let orderBy;
    switch (sort) {
        case 'ending': orderBy = 'lots.end_time ASC'; break;
        case 'price-asc': orderBy = 'lots.current_price ASC'; break;
        case 'price-desc': orderBy = 'lots.current_price DESC'; break;
        case 'new': orderBy = 'lots.created_at DESC'; break;
        case 'popular': orderBy = 'lots.bids_count DESC'; break;
        default: orderBy = 'lots.end_time ASC';
    }

    const offset = (Number(page) - 1) * Number(limit);

    const countQuery = `SELECT COUNT(*) as total FROM lots
        LEFT JOIN categories ON lots.category_id = categories.id ${where}`;
    const total = (await db.prepare(countQuery).get(...params)).total;

    const lotsQuery = `
        SELECT lots.*,
               categories.name as category_name, categories.slug as category_slug,
               users.username as seller_name, users.rating as seller_rating, users.reviews_count as seller_reviews,
               (SELECT filename FROM lot_images WHERE lot_id = lots.id AND is_main = 1 LIMIT 1) as main_image
        FROM lots
        LEFT JOIN categories ON lots.category_id = categories.id
        LEFT JOIN users ON lots.seller_id = users.id
        ${where}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
    `;
    const lots = await db.prepare(lotsQuery).all(...params, Number(limit), offset);

    res.json({
        lots,
        pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
});

router.get('/top', async (req, res) => {
    const lots = await db.prepare(`
        SELECT lots.*,
               categories.name as category_name,
               users.username as seller_name, users.rating as seller_rating,
               (SELECT filename FROM lot_images WHERE lot_id = lots.id AND is_main = 1 LIMIT 1) as main_image
        FROM lots
        LEFT JOIN categories ON lots.category_id = categories.id
        LEFT JOIN users ON lots.seller_id = users.id
        WHERE lots.status = 'active'
        ORDER BY lots.bids_count DESC, lots.end_time ASC
        LIMIT 10
    `).all();
    res.json(lots);
});

router.get('/:id', optionalAuth, async (req, res) => {
    const lot = await db.prepare(`
        SELECT lots.*,
               categories.name as category_name, categories.slug as category_slug,
               users.username as seller_name, users.rating as seller_rating,
               users.reviews_count as seller_reviews, users.city as seller_city,
               users.created_at as seller_since, users.id as seller_id_ref
        FROM lots
        LEFT JOIN categories ON lots.category_id = categories.id
        LEFT JOIN users ON lots.seller_id = users.id
        WHERE lots.id = ?
    `).get(req.params.id);

    if (!lot) {
        return res.status(404).json({ error: 'Лот не знайдено' });
    }

    await db.prepare('UPDATE lots SET views_count = views_count + 1 WHERE id = ?').run(req.params.id);

    const images = await db.prepare('SELECT * FROM lot_images WHERE lot_id = ? ORDER BY sort_order').all(req.params.id);

    const bids = await db.prepare(`
        SELECT bids.amount, bids.created_at,
               SUBSTR(users.username, 1, 3) || '***' as bidder
        FROM bids
        LEFT JOIN users ON bids.user_id = users.id
        WHERE bids.lot_id = ?
        ORDER BY bids.amount DESC
        LIMIT 20
    `).all(req.params.id);

    let isFavorite = false;
    if (req.user) {
        const fav = await db.prepare('SELECT id FROM favorites WHERE user_id = ? AND lot_id = ?').get(req.user.id, req.params.id);
        isFavorite = !!fav;
    }

    res.json({ ...lot, images, bids, isFavorite });
});

router.post('/', authenticateToken, upload.array('images', 10), async (req, res) => {
    const {
        title, description, categoryId, condition, saleType,
        startPrice, buyNowPrice, reservePrice, bidStep,
        duration, city, deliveryMethods, paymentMethods
    } = req.body;

    if (!title || !categoryId || !startPrice || !duration) {
        return res.status(400).json({ error: 'Заповніть обов\'язкові поля' });
    }

    const endTime = new Date(Date.now() + Number(duration) * 24 * 60 * 60 * 1000).toISOString();

    const result = await db.prepare(`
        INSERT INTO lots (seller_id, category_id, title, description, condition, sale_type,
            start_price, current_price, buy_now_price, reserve_price, bid_step,
            city, delivery_methods, payment_methods, end_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        req.user.id, Number(categoryId), title, description || '',
        condition || 'used', saleType || 'auction',
        Number(startPrice), Number(startPrice),
        buyNowPrice ? Number(buyNowPrice) : null,
        reservePrice ? Number(reservePrice) : null,
        Number(bidStep) || 10,
        city || '', deliveryMethods || '', paymentMethods || '',
        endTime
    );

    const lotId = result.lastInsertRowid;

    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            if (sharp) {
                try {
                    const compressedPath = file.path.replace(/(\.[^.]+)$/, '_thumb$1');
                    await sharp(file.path)
                        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                        .jpeg({ quality: 85 })
                        .toFile(compressedPath);
                    fs.renameSync(compressedPath, file.path);
                } catch(e) {}
            }
        }
        for (let i = 0; i < req.files.length; i++) {
            await db.prepare('INSERT INTO lot_images (lot_id, filename, is_main, sort_order) VALUES (?, ?, ?, ?)')
                .run(lotId, req.files[i].filename, i === 0 ? 1 : 0, i);
        }
    }

    res.status(201).json({ message: 'Лот створено!', lotId });
});

router.put('/:id', authenticateToken, async (req, res) => {
    const lot = await db.prepare('SELECT * FROM lots WHERE id = ? AND seller_id = ?').get(req.params.id, req.user.id);
    if (!lot) {
        return res.status(404).json({ error: 'Лот не знайдено або ви не власник' });
    }
    if (lot.bids_count > 0) {
        return res.status(400).json({ error: 'Не можна редагувати лот з активними ставками' });
    }

    const { title, description, condition, startPrice, buyNowPrice } = req.body;

    await db.prepare(`
        UPDATE lots SET title = ?, description = ?, condition = ?,
            start_price = ?, current_price = ?, buy_now_price = ?
        WHERE id = ?
    `).run(title, description, condition, Number(startPrice), Number(startPrice),
        buyNowPrice ? Number(buyNowPrice) : null, req.params.id);

    res.json({ message: 'Лот оновлено' });
});

router.delete('/:id', authenticateToken, async (req, res) => {
    const lot = await db.prepare('SELECT * FROM lots WHERE id = ? AND seller_id = ?').get(req.params.id, req.user.id);
    if (!lot) {
        return res.status(404).json({ error: 'Лот не знайдено або ви не власник' });
    }
    if (lot.bids_count > 0 && lot.status === 'active') {
        return res.status(400).json({ error: 'Не можна видалити лот з активними ставками' });
    }

    await db.prepare('DELETE FROM lots WHERE id = ?').run(req.params.id);
    res.json({ message: 'Лот видалено' });
});

router.get('/user/my', authenticateToken, async (req, res) => {
    const { status = 'active' } = req.query;
    const lots = await db.prepare(`
        SELECT lots.*,
               (SELECT filename FROM lot_images WHERE lot_id = lots.id AND is_main = 1 LIMIT 1) as main_image
        FROM lots WHERE seller_id = ? AND status = ?
        ORDER BY created_at DESC
    `).all(req.user.id, status);
    res.json(lots);
});

module.exports = router;
