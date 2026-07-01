const express = require('express');
const router = express.Router();
const db = require('../database');
const telegram = require('../services/telegram');

router.post('/webhook/telegram', async (req, res) => {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret) {
        const header = req.headers['x-telegram-bot-api-secret-token'];
        if (header !== secret) {
            return res.status(403).json({ ok: false, error: 'invalid_secret' });
        }
    }
    try {
        await telegram.handleUpdate(req.body, db);
        res.json({ ok: true });
    } catch (err) {
        console.error('[webhook] error:', err);
        res.status(200).json({ ok: true });
    }
});

router.post('/telegram/setup', async (req, res) => {
    try {
        const cmd = await telegram.setupCommands();
        const hook = req.query.webhook === '1'
            ? await telegram.setWebhook(process.env.SITE_URL || process.env.BASE_URL)
            : { skipped: true };
        const info = await telegram.getBotUsernameAndAvatar();
        res.json({ ok: true, bot: info, commands: cmd, webhook: hook });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.get('/telegram/bot-info', async (req, res) => {
    try {
        const info = await telegram.getBotUsernameAndAvatar();
        const wh = await telegram.getWebhookInfo();
        res.json({ ok: true, bot: info, webhook: wh, site_url: telegram.SITE_URL, bot_username: telegram.TELEGRAM_BOT_USERNAME });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.get('/telegram/share-url/:lotId', async (req, res) => {
    const lotId = parseInt(req.params.lotId);
    if (!lotId) return res.status(400).json({ error: 'invalid_lot_id' });
    try {
        const lot = await db.prepare('SELECT l.*, u.username as seller_name, u.city as seller_city, c.name as category_name, c.slug as category_slug FROM lots l LEFT JOIN users u ON l.seller_id = u.id LEFT JOIN categories c ON l.category_id = c.id WHERE l.id = ?').get(lotId);
        if (!lot) return res.status(404).json({ error: 'not_found' });
        res.json({
            ok: true,
            web_url: telegram.buildLotUrl(lotId),
            deep_link: telegram.buildDeepLink(lotId),
            share_url: telegram.buildWebShareUrl(lot),
            inline_share_url: telegram.buildInlineShareUrl(lot),
            card_text: telegram.formatLotCard(lot)
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.get('/telegram/bot-link/:lotId', (req, res) => {
    const lotId = parseInt(req.params.lotId);
    if (!lotId) return res.status(400).json({ error: 'invalid_lot_id' });
    res.redirect(telegram.buildDeepLink(lotId));
});

router.get('/lot/:id', async (req, res) => {
    const lotId = parseInt(req.params.id);
    if (!lotId) return res.status(400).json({ error: 'invalid_lot_id' });
    try {
        const lot = await db.prepare('SELECT l.*, u.username as seller_name, u.city as seller_city, c.name as category_name, c.slug as category_slug FROM lots l LEFT JOIN users u ON l.seller_id = u.id LEFT JOIN categories c ON l.category_id = c.id WHERE l.id = ?').get(lotId);
        if (!lot) return res.status(404).json({ error: 'not_found' });
        res.json({
            ok: true,
            lot,
            web_url: telegram.buildLotUrl(lotId),
            deep_link: telegram.buildDeepLink(lotId),
            share_url: telegram.buildWebShareUrl(lot),
            card_text: telegram.formatLotCard(lot)
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
