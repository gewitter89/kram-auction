const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'auction.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        city TEXT,
        bio TEXT,
        avatar TEXT,
        rating REAL DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_verified INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        is_admin INTEGER DEFAULT 0
    );

    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        parent_id INTEGER,
        icon TEXT,
        FOREIGN KEY (parent_id) REFERENCES categories(id)
    );

    -- Lots table
    CREATE TABLE IF NOT EXISTS lots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        condition TEXT DEFAULT 'used',
        sale_type TEXT DEFAULT 'auction',
        start_price REAL NOT NULL DEFAULT 1,
        current_price REAL NOT NULL DEFAULT 1,
        buy_now_price REAL,
        reserve_price REAL,
        bid_step REAL DEFAULT 10,
        bids_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        city TEXT,
        delivery_methods TEXT,
        payment_methods TEXT,
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    -- Lot images table
    CREATE TABLE IF NOT EXISTS lot_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lot_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        is_main INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE
    );

    -- Bids table
    CREATE TABLE IF NOT EXISTS bids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lot_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        is_auto INTEGER DEFAULT 0,
        auto_max REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lot_id) REFERENCES lots(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Favorites table
    CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        lot_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lot_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE
    );

    -- Messages table
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        lot_id INTEGER,
        text TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id),
        FOREIGN KEY (lot_id) REFERENCES lots(id)
    );

    -- Reviews table
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reviewer_id INTEGER NOT NULL,
        seller_id INTEGER NOT NULL,
        lot_id INTEGER,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reviewer_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES users(id),
        FOREIGN KEY (lot_id) REFERENCES lots(id)
    );

    -- Notifications table
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        lot_id INTEGER,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (lot_id) REFERENCES lots(id)
    );

    -- Purchases table (completed transactions)
    CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lot_id INTEGER NOT NULL,
        buyer_id INTEGER NOT NULL,
        seller_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_method TEXT,
        delivery_method TEXT,
        tracking_number TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        paid_at DATETIME,
        shipped_at DATETIME,
        received_at DATETIME,
        FOREIGN KEY (lot_id) REFERENCES lots(id),
        FOREIGN KEY (buyer_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES users(id)
    );
`);

// Seed categories
const categoriesExist = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (categoriesExist.count === 0) {
    const insertCat = db.prepare('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)');
    const categories = [
        ['Електроніка, Техніка', 'electronics', '💻'],
        ['Ноутбуки', 'laptops', '💻'],
        ['Смартфони', 'smartphones', '📱'],
        ['Комплектуючі для ПК', 'pc-parts', '🖥️'],
        ['Системні блоки, ПК', 'desktops', '🖥️'],
        ['Одяг, мода, краса', 'fashion', '👗'],
        ['Автозапчастини, Тюнінг', 'auto', '🚗'],
        ['Спорт, Туризм', 'sport', '⚽'],
        ['Дитячі товари', 'kids', '🧸'],
        ['Будинок, дозвілля', 'home', '🏠'],
        ['Інструменти', 'tools', '🔧'],
        ['Техніка для кухні', 'kitchen', '☕'],
        ['Розумні годинники', 'smartwatch', '⌚'],
        ['Камери', 'cameras', '📷'],
    ];
    const insertMany = db.transaction((cats) => {
        for (const cat of cats) {
            insertCat.run(...cat);
        }
    });
    insertMany(categories);
}

module.exports = db;
