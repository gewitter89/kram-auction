const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { sendEmail } = require('../services/email');

const router = express.Router();

// Helper: emit bid update to lot room
function emitBidUpdate(io, lotId) {
    const lot = db.prepare(`
        SELECT lots.*, categories.name as category_name,
               users.username as seller_name, users.rating as seller_rating,
               (SELECT filename FROM lot_images WHERE lot_id = lots.id AND is_main = 1 LIMIT 1) as main_image
        FROM lots
        LEFT JOIN categories ON lots.category_id = categories.id
        LEFT JOIN users ON lots.seller_id = users.id
        WHERE lots.id = ?
    `).get(lotId);
    if (lot) {
        const bids = db.prepare(`
            SELECT bids.amount, bids.created_at,
                   SUBSTR(users.username, 1, 3) || '***' as bidder
            FROM bids LEFT JOIN users ON bids.user_id = users.id
            WHERE bids.lot_id = ? ORDER BY bids.amount DESC LIMIT 20
        `).all(lotId);
        io.to(`lot:${lotId}`).emit('bid_update', { ...lot, bids });
    }
}

// Helper: send email for notification
function notifyUser(userId, templateName, data) {
    const user = db.prepare('SELECT email, username FROM users WHERE id = ?').get(userId);
    if (user?.email) {
        sendEmail(user.email, templateName, { user, params: data });
    }
}

// POST /api/bids - Place a bid
router.post('/', authenticateToken, (req, res) => {
    const { lotId, amount, isAuto, autoMax } = req.body;

    if (!lotId || !amount) {
        return res.status(400).json({ error: 'Вкажіть лот та суму ставки' });
    }

    // Get lot
    const lot = db.prepare(`
        SELECT * FROM lots WHERE id = ? AND status = 'active'
    `).get(lotId);

    if (!lot) {
        return res.status(404).json({ error: 'Лот не знайдено або аукціон завершено' });
    }

    // Check if auction ended
    if (new Date(lot.end_time) <= new Date()) {
        db.prepare("UPDATE lots SET status = 'completed' WHERE id = ?").run(lotId);
        return res.status(400).json({ error: 'Аукціон вже завершено' });
    }

    // Can't bid on own lot
    if (lot.seller_id === req.user.id) {
        return res.status(400).json({ error: 'Не можна робити ставку на власний лот' });
    }

    // Check minimum bid
    const minBid = lot.current_price + lot.bid_step;
    if (Number(amount) < minBid) {
        return res.status(400).json({ error: `Мінімальна ставка: ${minBid} грн.` });
    }

    // Place bid
    const bidResult = db.prepare(`
        INSERT INTO bids (lot_id, user_id, amount, is_auto, auto_max)
        VALUES (?, ?, ?, ?, ?)
    `).run(lotId, req.user.id, Number(amount), isAuto ? 1 : 0, autoMax ? Number(autoMax) : null);

    // Update lot current price and bids count
    db.prepare(`
        UPDATE lots SET current_price = ?, bids_count = bids_count + 1 WHERE id = ?
    `).run(Number(amount), lotId);

    // Anti-sniping: extend auction by 2 minutes if bid in last 2 minutes
    const timeLeft = new Date(lot.end_time) - new Date();
    if (timeLeft < 2 * 60 * 1000 && timeLeft > 0) {
        const newEndTime = new Date(Date.now() + 2 * 60 * 1000).toISOString();
        db.prepare('UPDATE lots SET end_time = ? WHERE id = ?').run(newEndTime, lotId);
    }

    // Notify previous leader
    const previousBid = db.prepare(`
        SELECT user_id FROM bids WHERE lot_id = ? AND user_id != ? ORDER BY amount DESC LIMIT 1
    `).get(lotId, req.user.id);

    if (previousBid) {
        db.prepare(`
            INSERT INTO notifications (user_id, type, title, message, lot_id)
            VALUES (?, 'outbid', 'Вашу ставку перебито!', ?, ?)
        `).run(previousBid.user_id, `Вашу ставку на "${lot.title}" перебито. Нова ціна: ${amount} грн.`, lotId);
    }

    // Process auto-bids from other users
    processAutoBids(lotId, req.user.id, Number(amount));

    // Emit real-time update
    const io = req.app.get('io');
    emitBidUpdate(io, lotId);

    // Send email to outbid user
    if (previousBid) {
        notifyUser(previousBid.user_id, 'bidOutbid', [lot.title, amount, lotId]);
    }

    res.status(201).json({
        message: 'Ставку прийнято!',
        bidId: bidResult.lastInsertRowid,
        newPrice: Number(amount)
    });
});

// Process auto-bids
function processAutoBids(lotId, currentBidderId, currentAmount) {
    const autoBids = db.prepare(`
        SELECT bids.*, users.username FROM bids
        LEFT JOIN users ON bids.user_id = users.id
        WHERE bids.lot_id = ? AND bids.is_auto = 1 AND bids.user_id != ? AND bids.auto_max > ?
        ORDER BY bids.auto_max DESC
        LIMIT 1
    `).get(lotId, currentBidderId, currentAmount);

    if (autoBids) {
        const lot = db.prepare('SELECT bid_step FROM lots WHERE id = ?').get(lotId);
        const newBid = Math.min(currentAmount + lot.bid_step, autoBids.auto_max);

        db.prepare(`
            INSERT INTO bids (lot_id, user_id, amount, is_auto) VALUES (?, ?, ?, 1)
        `).run(lotId, autoBids.user_id, newBid);

        db.prepare(`
            UPDATE lots SET current_price = ?, bids_count = bids_count + 1 WHERE id = ?
        `).run(newBid, lotId);

        // Notify the person who was just outbid by auto-bid
        db.prepare(`
            INSERT INTO notifications (user_id, type, title, message, lot_id)
            VALUES (?, 'outbid', 'Вашу ставку перебито (автоставка)', ?, ?)
        `).run(currentBidderId, `Автоставка перебила вашу ставку. Нова ціна: ${newBid} грн.`, lotId);
    }
}

// GET /api/bids/my - My bids
router.get('/my', authenticateToken, (req, res) => {
    const bids = db.prepare(`
        SELECT bids.*, lots.title as lot_title, lots.current_price, lots.end_time, lots.status as lot_status,
               (SELECT filename FROM lot_images WHERE lot_id = lots.id AND is_main = 1 LIMIT 1) as lot_image,
               CASE WHEN bids.amount = lots.current_price THEN 'winning' ELSE 'outbid' END as bid_status
        FROM bids
        LEFT JOIN lots ON bids.lot_id = lots.id
        WHERE bids.user_id = ?
        GROUP BY bids.lot_id
        HAVING bids.amount = MAX(bids.amount)
        ORDER BY bids.created_at DESC
    `).all(req.user.id);
    res.json(bids);
});

// GET /api/bids/lot/:lotId - Bid history for a lot
router.get('/lot/:lotId', (req, res) => {
    const bids = db.prepare(`
        SELECT bids.amount, bids.created_at,
               SUBSTR(users.username, 1, 3) || '***' as bidder
        FROM bids
        LEFT JOIN users ON bids.user_id = users.id
        WHERE bids.lot_id = ?
        ORDER BY bids.amount DESC
    `).all(req.params.lotId);
    res.json(bids);
});

// POST /api/bids/buy-now - Buy now
router.post('/buy-now', authenticateToken, (req, res) => {
    const { lotId } = req.body;

    const lot = db.prepare(`
        SELECT * FROM lots WHERE id = ? AND status = 'active' AND buy_now_price IS NOT NULL
    `).get(lotId);

    if (!lot) {
        return res.status(404).json({ error: 'Лот не знайдено або "Купити зараз" недоступно' });
    }
    if (lot.seller_id === req.user.id) {
        return res.status(400).json({ error: 'Не можна купити власний лот' });
    }

    // Close auction and create purchase
    db.prepare("UPDATE lots SET status = 'sold', current_price = ? WHERE id = ?").run(lot.buy_now_price, lotId);

    db.prepare(`
        INSERT INTO purchases (lot_id, buyer_id, seller_id, amount, status)
        VALUES (?, ?, ?, ?, 'pending')
    `).run(lotId, req.user.id, lot.seller_id, lot.buy_now_price);

    // Notifications
    db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, lot_id)
        VALUES (?, 'purchased', 'Покупка оформлена!', ?, ?)
    `).run(req.user.id, `Ви купили "${lot.title}" за ${lot.buy_now_price} грн.`, lotId);

    db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, lot_id)
        VALUES (?, 'sold', 'Ваш лот куплено!', ?, ?)
    `).run(lot.seller_id, `"${lot.title}" куплено за ${lot.buy_now_price} грн.`, lotId);

    // Socket + Email
    const io = req.app.get('io');
    emitBidUpdate(io, lotId);
    notifyUser(req.user.id, 'auctionWon', [lot.title, lot.buy_now_price, lotId]);
    notifyUser(lot.seller_id, 'lotSold', [lot.title, lot.buy_now_price]);

    res.json({ message: 'Покупка оформлена!', amount: lot.buy_now_price });
});

module.exports = router;
