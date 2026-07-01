require('dotenv').config();
const Sentry = require('@sentry/node');
const express = require('express');
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const schedule = require('node-schedule');
const db = require('./database');
const { sendEmail } = require('./services/email');

const authRoutes = require('./routes/auth');
const lotsRoutes = require('./routes/lots');
const bidsRoutes = require('./routes/bids');
const usersRoutes = require('./routes/users');
const messagesRoutes = require('./routes/messages');
const favoritesRoutes = require('./routes/favorites');
const purchasesRoutes = require('./routes/purchases');
const paymentRoutes = require('./routes/payment');
const notificationsRoutes = require('./routes/notifications');
const reviewsRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const invoiceRoutes = require('./routes/invoice');
const telegramBotRoutes = require('./routes/telegram-bot');

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: { origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'], methods: ['GET', 'POST'], credentials: true }
});

app.set('io', io);
app.set('db', db);

const PORT = process.env.PORT || 3000;

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());

app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https://placehold.co https://via.placeholder.com; " +
        "connect-src 'self' ws: wss:; " +
        "frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
    );
    next();
});

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Забагато запитів. Спробуйте пізніше.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Забагато спроб входу. Спробуйте через 15 хвилин.' } });
const bidLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: { error: 'Забагато ставок. Зачекайте хвилину.' } });

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/bids', bidLimiter);

const fs = require('fs');
const BOT_UA_RE = /(TelegramBot|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|WhatsApp|SkypeUriParser|redditbot|googleweblight|vkShare|Viber|Discordbot|Applebot)/i;

async function renderOG(req, res, next) {
    const ua = req.headers['user-agent'] || '';
    const isBot = BOT_UA_RE.test(ua) || req.url.includes('_escaped_fragment_=');
    if (!isBot) return next();

    try {
        if (req.path === '/lot.html' && req.query.id) {
            const lot = await db.prepare(`
                SELECT l.*, u.username as seller_name, u.city as seller_city,
                       c.name as category_name, c.slug as category_slug
                FROM lots l
                LEFT JOIN users u ON l.seller_id = u.id
                LEFT JOIN categories c ON l.category_id = c.id
                WHERE l.id = ?
            `).get(req.query.id);
            if (!lot) return next();

            const html = fs.readFileSync(path.join(__dirname, 'public', 'lot.html'), 'utf8');
            const baseUrl = (process.env.SITE_URL || process.env.BASE_URL || 'https://kram.ua').replace(/\/$/, '');
            const price = Number(lot.current_price || lot.start_price).toLocaleString('en-US').replace(/,/g, '\u202F');
            const img = lot.main_image ? `${baseUrl}/uploads/${lot.main_image}` : `${baseUrl}/icons/og-image.svg`;
            const title = `${escH(lot.title)} — ${price} грн. — KRAM.UA`;
            const desc = escH((lot.description || lot.title).slice(0, 200));
            const url = `${baseUrl}/lot.html?id=${lot.id}`;

            const og = `
<!-- SSR OG -->
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${escH(img)}">
<meta property="og:url" content="${escH(url)}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="KRAM.UA">
<meta property="og:locale" content="uk_UA">
<meta property="product:price:amount" content="${lot.current_price || lot.start_price || 0}">
<meta property="product:price:currency" content="UAH">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${escH(img)}">
<link rel="canonical" href="${escH(url)}">
<!-- /SSR OG -->`;

            let out = html
                .replace(/<meta[^>]*(og:|twitter:)[^>]*>/gi, '')
                .replace(/<link rel="canonical"[^>]*>/gi, '')
                .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
                .replace('</head>', og + '\n</head>');
            res.set('Content-Type', 'text/html; charset=utf-8').send(out);
            return;
        }

        if (req.path === '/seller.html' && req.query.username) {
            const user = await db.prepare(`
                SELECT u.*, COUNT(DISTINCT l.id) as lots_count,
                       AVG(r.rating) as avg_rating
                FROM users u
                LEFT JOIN lots l ON l.seller_id = u.id AND l.status IN ('active','sold','ended')
                LEFT JOIN reviews r ON r.seller_id = u.id
                WHERE u.username = ?
                GROUP BY u.id
            `).get(req.query.username);
            if (!user) return next();

            const html = fs.readFileSync(path.join(__dirname, 'public', 'seller.html'), 'utf8');
            const baseUrl = (process.env.SITE_URL || process.env.BASE_URL || 'https://kram.ua').replace(/\/$/, '');
            const title = `@${escH(user.username)} — ${user.lots_count || 0} лотів — KRAM.UA`;
            const desc = escH((user.bio || user.username + ' на KRAM.UA').slice(0, 200));
            const url = `${baseUrl}/seller.html?username=${encodeURIComponent(user.username)}`;
            const avatar = (user.avatar || '').startsWith('http') ? user.avatar : '';
            const img = avatar || `${baseUrl}/icons/og-image.svg`;

            const og = `
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${escH(img)}">
<meta property="og:url" content="${escH(url)}">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="KRAM.UA">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${escH(img)}">
<link rel="canonical" href="${escH(url)}">
<!-- /SSR OG -->`;
            let out = html
                .replace(/<meta[^>]*(og:|twitter:)[^>]*>/gi, '')
                .replace(/<link rel="canonical"[^>]*>/gi, '')
                .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
                .replace('</head>', og + '\n</head>');
            res.set('Content-Type', 'text/html; charset=utf-8').send(out);
            return;
        }
    } catch (err) {
        console.error('[OG] render error:', err.message);
    }
    next();
}
function escH(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(renderOG);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d', etag: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));

io.on('connection', (socket) => {
    socket.on('join-lot', (lotId) => { socket.join(`lot:${lotId}`); });
    socket.on('leave-lot', (lotId) => { socket.leave(`lot:${lotId}`); });
    socket.on('join-cabinet', (userId) => { if (userId) socket.join(`user:${userId}`); });
});

app.use('/api/auth', authRoutes);
app.use('/api/lots', lotsRoutes);
app.use('/api/bids', bidsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api', telegramBotRoutes);

app.get('/api/categories', async (req, res) => {
    const categories = await db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json(categories);
});

app.get('/api/stats', async (req, res) => {
    const stats = {
        totalLots: (await db.prepare("SELECT COUNT(*) as count FROM lots WHERE status = 'active'").get()).count,
        totalUsers: (await db.prepare('SELECT COUNT(*) as count FROM users').get()).count,
        totalBids: (await db.prepare('SELECT COUNT(*) as count FROM bids').get()).count,
        totalSold: (await db.prepare("SELECT COUNT(*) as count FROM lots WHERE status IN ('completed','sold')").get()).count,
    };
    res.json(stats);
});

schedule.scheduleJob('*/30 * * * * *', async () => {
    const now = new Date().toISOString();
    const expiredLots = await db.prepare(`
        SELECT id, seller_id, title, current_price, reserve_price
        FROM lots
        WHERE status = 'active' AND end_time <= ?
    `).all(now);

    if (expiredLots.length === 0) return;

    const processExpired = db.transaction(async () => {
        for (const lot of expiredLots) {
            const winner = await db.prepare(`SELECT user_id, amount FROM bids WHERE lot_id = ? ORDER BY amount DESC LIMIT 1`).get(lot.id);

            if (winner) {
                if (lot.reserve_price && Number(winner.amount) < Number(lot.reserve_price)) {
                    await db.prepare(`UPDATE lots SET status = 'reserve_not_met' WHERE id = ?`).run(lot.id);
                    await db.prepare(`INSERT INTO notifications (user_id, type, title, message, lot_id) VALUES (?, 'reserve_not_met', 'Резервну ціну не досягнуто', ?, ?)`)
                        .run(winner.user_id, `Аукціон "${lot.title}" завершено, але резервну ціну не досягнуто.`, lot.id);
                    await db.prepare(`INSERT INTO notifications (user_id, type, title, message, lot_id) VALUES (?, 'reserve_not_met', 'Резервну ціну не досягнуто', ?, ?)`)
                        .run(lot.seller_id, `Аукціон "${lot.title}" завершено без продажу.`, lot.id);
                } else {
                    await db.prepare(`UPDATE lots SET status = 'completed' WHERE id = ?`).run(lot.id);
                    await db.prepare(`INSERT INTO purchases (lot_id, buyer_id, seller_id, amount, status) VALUES (?, ?, ?, ?, 'pending')`)
                        .run(lot.id, winner.user_id, lot.seller_id, winner.amount);
                    await db.prepare(`INSERT INTO notifications (user_id, type, title, message, lot_id) VALUES (?, 'won', 'Ви виграли аукціон!', ?, ?)`)
                        .run(winner.user_id, `Вітаємо! Ви виграли "${lot.title}" за ${winner.amount} грн.`, lot.id);
                    await db.prepare(`INSERT INTO notifications (user_id, type, title, message, lot_id) VALUES (?, 'sold', 'Ваш лот продано!', ?, ?)`)
                        .run(lot.seller_id, `"${lot.title}" продано за ${winner.amount} грн.`, lot.id);

                    io.to(`lot:${lot.id}`).emit('bid_update', { status: 'completed', id: lot.id, title: lot.title });
                    io.to(`user:${winner.user_id}`).emit('notification', { type: 'won', title: 'Ви виграли аукціон!', lotId: lot.id });
                    io.to(`user:${lot.seller_id}`).emit('notification', { type: 'sold', title: 'Ваш лот продано!', lotId: lot.id });

                    const winnerUser = await db.prepare('SELECT email FROM users WHERE id = ?').get(winner.user_id);
                    const sellerUser = await db.prepare('SELECT email FROM users WHERE id = ?').get(lot.seller_id);
                    if (winnerUser?.email) sendEmail(winnerUser.email, 'auctionWon', { user: winnerUser, params: [lot.title, winner.amount, lot.id] });
                    if (sellerUser?.email) sendEmail(sellerUser.email, 'lotSold', { user: sellerUser, params: [lot.title, winner.amount] });
                }
            } else {
                await db.prepare(`UPDATE lots SET status = 'expired' WHERE id = ?`).run(lot.id);
                await db.prepare(`INSERT INTO notifications (user_id, type, title, message, lot_id) VALUES (?, 'expired', 'Аукціон завершено', ?, ?)`)
                    .run(lot.seller_id, `"${lot.title}" завершено без ставок.`, lot.id);
            }
        }
    });

    try {
        await processExpired();
        console.log(`[${new Date().toLocaleTimeString()}] Закрито ${expiredLots.length} аукціонів`);
    } catch(e) {
        console.error('[SCHEDULER] Error closing expired lots:', e.message);
    }
});

schedule.scheduleJob('*/5 * * * *', async () => {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const endingSoon = await db.prepare(`
        SELECT lots.id, lots.title, favorites.user_id
        FROM lots
        JOIN favorites ON favorites.lot_id = lots.id
        WHERE lots.status = 'active' AND lots.end_time BETWEEN ? AND ?
    `).all(now, oneHourFromNow);

    for (const item of endingSoon) {
        await db.prepare(`INSERT INTO notifications (user_id, type, title, message, lot_id) VALUES (?, 'ending_soon', 'Лот завершується!', ?, ?)`)
            .run(item.user_id, `"${item.title}" завершується менш ніж за годину!`, item.id);
        io.to(`user:${item.user_id}`).emit('notification', { type: 'ending_soon', title: 'Лот завершується!', lotId: item.id });
    }
});

if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 0.1,
        integrations: [new Sentry.Integrations.Express({ app })]
    });
    app.use(Sentry.Handlers.requestHandler());
    console.log('[SENTRY] Initialized');
}

Sentry.setupExpressErrorHandler(app);

app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Внутрішня помилка сервера'
            : err.message
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.use((req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint не знайдено' });
    }
});

process.on('SIGTERM', () => {
    console.log('[SHUTDOWN] SIGTERM received, closing server...');
    server.close(async () => {
        await db.close();
        console.log('[SHUTDOWN] Done');
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
});

if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        const dbType = process.env.DB_TYPE || 'sqlite';
        console.log(`\n🚀 KRAM.UA сервер запущено!`);
        console.log(`📍 http://localhost:${PORT}`);
        console.log(`📦 База даних: ${dbType}`);
        console.log(`🔒 Режим: ${process.env.NODE_ENV || 'development'}`);
        console.log(`⏱  Автозавершення аукціонів: кожні 30 сек\n`);
    });
}

module.exports = app;
