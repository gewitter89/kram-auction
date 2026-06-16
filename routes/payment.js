const express = require('express');
const crypto = require('crypto');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY || 'sandbox_public_key';
const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY || 'sandbox_private_key';

// LiqPay helper functions
function liqpayEncode(data) {
    return Buffer.from(JSON.stringify(data)).toString('base64');
}

function liqpaySign(data) {
    const signString = LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY;
    return crypto.createHash('sha1').update(signString).digest('base64');
}

// POST /api/payment/create - Create payment for purchase
router.post('/create', authenticateToken, (req, res) => {
    const { purchaseId } = req.body;

    const purchase = db.prepare(`
        SELECT purchases.*, lots.title as lot_title
        FROM purchases
        LEFT JOIN lots ON purchases.lot_id = lots.id
        WHERE purchases.id = ? AND purchases.buyer_id = ? AND purchases.status = 'pending'
    `).get(purchaseId, req.user.id);

    if (!purchase) {
        return res.status(404).json({ error: 'Покупку не знайдено або вже оплачено' });
    }

    const orderId = `order_${purchase.id}_${Date.now()}`;

    const paymentData = {
        public_key: LIQPAY_PUBLIC_KEY,
        version: '3',
        action: 'pay',
        amount: purchase.amount,
        currency: 'UAH',
        description: `Оплата лота: ${purchase.lot_title}`,
        order_id: orderId,
        result_url: `${process.env.DOMAIN || 'http://localhost:3000'}/cabinet.html#purchases`,
        server_url: `${process.env.DOMAIN || 'http://localhost:3000'}/api/payment/callback`,
        language: 'uk'
    };

    const data = liqpayEncode(paymentData);
    const signature = liqpaySign(data);

    // Save order_id to purchase
    db.prepare('UPDATE purchases SET payment_method = ? WHERE id = ?').run(orderId, purchaseId);

    res.json({
        data,
        signature,
        checkoutUrl: `https://www.liqpay.ua/api/3/checkout?data=${data}&signature=${signature}`
    });
});

// POST /api/payment/callback - LiqPay callback (server-to-server)
router.post('/callback', (req, res) => {
    const { data, signature } = req.body;

    // Verify signature
    const expectedSignature = liqpaySign(data);
    if (signature !== expectedSignature) {
        console.error('[PAYMENT] Invalid signature');
        return res.status(400).send('Invalid signature');
    }

    // Decode payment data
    const paymentResult = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));

    console.log(`[PAYMENT] Status: ${paymentResult.status}, Order: ${paymentResult.order_id}, Amount: ${paymentResult.amount}`);

    if (paymentResult.status === 'success' || paymentResult.status === 'sandbox') {
        // Find purchase by order_id
        const purchase = db.prepare('SELECT * FROM purchases WHERE payment_method = ?').get(paymentResult.order_id);

        if (purchase && purchase.status === 'pending') {
            // Mark as paid
            db.prepare(`
                UPDATE purchases SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE id = ?
            `).run(purchase.id);

            // Notify seller
            db.prepare(`
                INSERT INTO notifications (user_id, type, title, message, lot_id)
                VALUES (?, 'payment', 'Оплата отримана!', ?, ?)
            `).run(purchase.seller_id,
                `Покупець оплатив ${paymentResult.amount} грн. Відправте товар.`,
                purchase.lot_id);

            // Notify buyer
            db.prepare(`
                INSERT INTO notifications (user_id, type, title, message, lot_id)
                VALUES (?, 'payment_success', 'Оплата успішна!', ?, ?)
            `).run(purchase.buyer_id,
                `Оплату ${paymentResult.amount} грн підтверджено. Очікуйте відправку.`,
                purchase.lot_id);
        }
    }

    res.status(200).send('OK');
});

// GET /api/payment/status/:purchaseId - Check payment status
router.get('/status/:purchaseId', authenticateToken, (req, res) => {
    const purchase = db.prepare(`
        SELECT id, status, amount, paid_at FROM purchases 
        WHERE id = ? AND (buyer_id = ? OR seller_id = ?)
    `).get(req.params.purchaseId, req.user.id, req.user.id);

    if (!purchase) {
        return res.status(404).json({ error: 'Покупку не знайдено' });
    }

    res.json(purchase);
});

// POST /api/payment/monobank - Create Monobank payment link
router.post('/monobank', authenticateToken, (req, res) => {
    const { purchaseId } = req.body;

    const purchase = db.prepare(`
        SELECT purchases.*, lots.title as lot_title
        FROM purchases
        LEFT JOIN lots ON purchases.lot_id = lots.id
        WHERE purchases.id = ? AND purchases.buyer_id = ? AND purchases.status = 'pending'
    `).get(purchaseId, req.user.id);

    if (!purchase) {
        return res.status(404).json({ error: 'Покупку не знайдено' });
    }

    // Monobank acquiring API (requires merchant account)
    // For now, return card payment info
    res.json({
        message: 'Для оплати через Monobank переведіть кошти на картку продавця',
        amount: purchase.amount,
        currency: 'UAH',
        description: `Оплата: ${purchase.lot_title}`,
        // In production, integrate with Monobank Acquiring API:
        // https://api.monobank.ua/docs/acquiring.html
        instructions: [
            '1. Відкрийте додаток Monobank',
            '2. Перейдіть в "Платежі" → "За реквізитами"',
            `3. Сума: ${purchase.amount} грн`,
            `4. Призначення: Оплата лота #${purchase.lot_id}`,
            '5. Після оплати натисніть "Підтвердити оплату" в кабінеті'
        ]
    });
});

module.exports = router;
