const express = require('express');
const crypto = require('crypto');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY;
const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY;

function liqpayEncode(data) {
    return Buffer.from(JSON.stringify(data)).toString('base64');
}

function liqpaySign(data) {
    const signString = LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY;
    return crypto.createHash('sha1').update(signString).digest('base64');
}

router.post('/create', authenticateToken, async (req, res) => {
    if (!LIQPAY_PUBLIC_KEY || !LIQPAY_PRIVATE_KEY) {
        return res.status(500).json({ error: 'Платіжна система тимчасово недоступна' });
    }

    const { purchaseId } = req.body;

    const purchase = await db.prepare(`
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

    await db.prepare('UPDATE purchases SET payment_method = ? WHERE id = ?').run(orderId, purchaseId);

    res.json({
        data,
        signature,
        checkoutUrl: `https://www.liqpay.ua/api/3/checkout?data=${data}&signature=${signature}`
    });
});

router.post('/callback', async (req, res) => {
    const { data, signature } = req.body;

    const expectedSignature = liqpaySign(data);
    if (signature !== expectedSignature) {
        console.error('[PAYMENT] Invalid signature');
        return res.status(400).send('Invalid signature');
    }

    const paymentResult = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));

    console.log(`[PAYMENT] Status: ${paymentResult.status}, Order: ${paymentResult.order_id}, Amount: ${paymentResult.amount}`);

    const isValidPayment = paymentResult.status === 'success' ||
        (paymentResult.status === 'sandbox' && process.env.NODE_ENV !== 'production');

    if (isValidPayment) {
        const purchase = await db.prepare('SELECT * FROM purchases WHERE payment_method = ?').get(paymentResult.order_id);

        if (purchase && purchase.status === 'pending') {
            await db.prepare(`
                UPDATE purchases SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE id = ?
            `).run(purchase.id);

            await db.prepare(`
                INSERT INTO notifications (user_id, type, title, message, lot_id)
                VALUES (?, 'payment', 'Оплата отримана!', ?, ?)
            `).run(purchase.seller_id,
                `Покупець оплатив ${paymentResult.amount} грн. Відправте товар.`,
                purchase.lot_id);

            await db.prepare(`
                INSERT INTO notifications (user_id, type, title, message, lot_id)
                VALUES (?, 'payment_success', 'Оплата успішна!', ?, ?)
            `).run(purchase.buyer_id,
                `Оплату ${paymentResult.amount} грн підтверджено. Очікуйте відправку.`,
                purchase.lot_id);
        }
    }

    res.status(200).send('OK');
});

router.get('/status/:purchaseId', authenticateToken, async (req, res) => {
    const purchase = await db.prepare(`
        SELECT id, status, amount, paid_at FROM purchases
        WHERE id = ? AND (buyer_id = ? OR seller_id = ?)
    `).get(req.params.purchaseId, req.user.id, req.user.id);

    if (!purchase) {
        return res.status(404).json({ error: 'Покупку не знайдено' });
    }

    res.json(purchase);
});

router.post('/monobank', authenticateToken, async (req, res) => {
    const { purchaseId } = req.body;

    const purchase = await db.prepare(`
        SELECT purchases.*, lots.title as lot_title
        FROM purchases
        LEFT JOIN lots ON purchases.lot_id = lots.id
        WHERE purchases.id = ? AND purchases.buyer_id = ? AND purchases.status = 'pending'
    `).get(purchaseId, req.user.id);

    if (!purchase) {
        return res.status(404).json({ error: 'Покупку не знайдено' });
    }

    res.json({
        message: 'Для оплати через Monobank переведіть кошти на картку продавця',
        amount: purchase.amount,
        currency: 'UAH',
        description: `Оплата: ${purchase.lot_title}`,
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
