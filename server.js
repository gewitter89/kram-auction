require('dotenv').config();
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

// Import routes
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

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Make io accessible in routes
app.set('io', io);
app.set('db', db);

const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Allow inline scripts for now
    crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { error: 'Забагато запитів. Спробуйте пізніше.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Забагато спроб входу. Спробуйте через 15 хвилин.' }
});

const bidLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    message: { error: 'Забагато ставок. Зачекайте хвилину.' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/bids', bidLimiter);

// Body parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d'
}));

// Socket.IO — real-time bid updates
io.on('connection', (socket) => {
    socket.on('join-lot', (lotId) => {
        socket.join(`lot:${lotId}`);
    });
    socket.on('leave-lot', (lotId) => {
        socket.leave(`lot:${lotId}`);
    });
    socket.on('join-cabinet', (userId) => {
        if (userId) socket.join(`user:${userId}`);
    });
});

// API Routes
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

// API: Get categories
app.get('/api/categories', (req, res) => {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json(categories);
});

// API: Site stats
app.get('/api/stats', (req, res) => {
    const stats = {
        totalLots: db.prepare("SELECT COUNT(*) as count FROM lots WHERE status = 'active'").get().count,
        totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
        totalBids: db.prepare('SELECT COUNT(*) as count FROM bids').get().count,
        totalSold: db.prepare("SELECT COUNT(*) as count FROM lots WHERE status IN ('completed','sold')").get().count,
    };
    res.json(stats);
});

// Scheduled job: Close expired auctions every 30 seconds
schedule.scheduleJob('*/30 * * * * *', () => {
    const now = new Date().toISOString();
    const expiredLots = db.prepare(`
        SELECT id, seller_id, title, current_price, reserve_price
        FROM lots 
        WHERE status = 'active' AND end_time <= ?
    `).all(now);

    if (expiredLots.length === 0) return;

    const closeLot = db.prepare(`UPDATE lots SET status = ? WHERE id = ?`);
    const getWinner = db.prepare(`SELECT user_id, amount FROM bids WHERE lot_id = ? ORDER BY amount DESC LIMIT 1`);
    const createPurchase = db.prepare(`
        INSERT INTO purchases (lot_id, buyer_id, seller_id, amount, status) 
        VALUES (?, ?, ?, ?, 'pending')
    `);
    const createNotification = db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, lot_id) 
        VALUES (?, ?, ?, ?, ?)
    `);

    const processExpired = db.transaction(() => {
        for (const lot of expiredLots) {
            const winner = getWinner.get(lot.id);

            if (winner) {
                if (lot.reserve_price && winner.amount < lot.reserve_price) {
                    closeLot.run('reserve_not_met', lot.id);
                    createNotification.run(winner.user_id, 'reserve_not_met',
                        'Резервну ціну не досягнуто',
                        `Аукціон "${lot.title}" завершено, але резервну ціну не досягнуто.`, lot.id);
                    createNotification.run(lot.seller_id, 'reserve_not_met',
                        'Резервну ціну не досягнуто',
                        `Аукціон "${lot.title}" завершено без продажу.`, lot.id);
                } else {
                    closeLot.run('completed', lot.id);
                    createPurchase.run(lot.id, winner.user_id, lot.seller_id, winner.amount);
                    createNotification.run(winner.user_id, 'won', 'Ви виграли аукціон!',
                        `Вітаємо! Ви виграли "${lot.title}" за ${winner.amount} грн.`, lot.id);
                    createNotification.run(lot.seller_id, 'sold', 'Ваш лот продано!',
                        `"${lot.title}" продано за ${winner.amount} грн.`, lot.id);
                    // Socket + Email
                    io.to(`lot:${lot.id}`).emit('bid_update', { status: 'completed', id: lot.id, title: lot.title });
                    io.to(`user:${winner.user_id}`).emit('notification', { type: 'won', title: 'Ви виграли аукціон!', lotId: lot.id });
                    io.to(`user:${lot.seller_id}`).emit('notification', { type: 'sold', title: 'Ваш лот продано!', lotId: lot.id });
                    const winnerUser = db.prepare('SELECT email FROM users WHERE id = ?').get(winner.user_id);
                    const sellerUser = db.prepare('SELECT email FROM users WHERE id = ?').get(lot.seller_id);
                    if (winnerUser?.email) sendEmail(winnerUser.email, 'auctionWon', { user: winnerUser, params: [lot.title, winner.amount, lot.id] });
                    if (sellerUser?.email) sendEmail(sellerUser.email, 'lotSold', { user: sellerUser, params: [lot.title, winner.amount] });
                }
            } else {
                closeLot.run('expired', lot.id);
                createNotification.run(lot.seller_id, 'expired', 'Аукціон завершено',
                    `"${lot.title}" завершено без ставок.`, lot.id);
            }
        }
    });

    processExpired();
    if (expiredLots.length > 0) {
        console.log(`[${new Date().toLocaleTimeString()}] Закрито ${expiredLots.length} аукціонів`);
    }
});

// Scheduled job: Send reminder notifications (1 hour before end)
schedule.scheduleJob('*/5 * * * *', () => {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const endingSoon = db.prepare(`
        SELECT lots.id, lots.title, favorites.user_id
        FROM lots
        JOIN favorites ON favorites.lot_id = lots.id
        WHERE lots.status = 'active' AND lots.end_time BETWEEN ? AND ?
    `).all(now, oneHourFromNow);

    const createNotification = db.prepare(`
        INSERT OR IGNORE INTO notifications (user_id, type, title, message, lot_id)
        VALUES (?, 'ending_soon', 'Лот завершується!', ?, ?)
    `);

    for (const item of endingSoon) {
        createNotification.run(item.user_id, `"${item.title}" завершується менш ніж за годину!`, item.id);
        io.to(`user:${item.user_id}`).emit('notification', { type: 'ending_soon', title: 'Лот завершується!', lotId: item.id });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Внутрішня помилка сервера'
            : err.message
    });
});

// Fallback: serve frontend
app.use((req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint не знайдено' });
    }
});

server.listen(PORT, () => {
    console.log(`\n🚀 МійАукціон сервер запущено!`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📦 База даних: auction.db`);
    console.log(`🔒 Режим: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏱  Автозавершення аукціонів: кожні 30 сек\n`);
});

module.exports = app;
