const DB_TYPE = process.env.DB_TYPE || 'sqlite';

if (DB_TYPE === 'postgres') {
  module.exports = require('./database-pg');
} else {
  const Database = require('better-sqlite3');
  const path = require('path');

  const DATA_DIR = process.env.DATA_DIR || __dirname;
  const dbPath = path.join(DATA_DIR, 'auction.db');
  const _raw = new Database(dbPath);

  console.log(`[DB] SQLite at ${dbPath}`);

  _raw.pragma('journal_mode = WAL');
  _raw.pragma('foreign_keys = ON');

  _raw.exec(`
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
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        parent_id INTEGER,
        icon TEXT,
        FOREIGN KEY (parent_id) REFERENCES categories(id)
    );
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
    CREATE TABLE IF NOT EXISTS lot_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lot_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        is_main INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE
    );
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
    CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        lot_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lot_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE
    );
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

  try { _raw.exec('ALTER TABLE users ADD COLUMN reset_token TEXT'); } catch(e) {}
  try { _raw.exec('ALTER TABLE users ADD COLUMN reset_token_expires DATETIME'); } catch(e) {}
  try { _raw.exec('ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0'); } catch(e) {}
  try { _raw.exec('ALTER TABLE users ADD COLUMN email_token TEXT'); } catch(e) {}
  try { _raw.exec('ALTER TABLE users ADD COLUMN telegram_chat_id TEXT'); } catch(e) {}
  try { _raw.exec('ALTER TABLE users ADD COLUMN google_id TEXT'); } catch(e) {}
  try { _raw.exec('ALTER TABLE users ADD COLUMN two_factor_secret TEXT'); } catch(e) {}
  try { _raw.exec('ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0'); } catch(e) {}

  try { _raw.exec(`CREATE TABLE IF NOT EXISTS email_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient TEXT NOT NULL,
    template TEXT NOT NULL,
    data_json TEXT NOT NULL,
    retries INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`); } catch(e) {}

  try { _raw.exec('CREATE INDEX IF NOT EXISTS idx_lots_status ON lots(status)'); } catch(e) {}
  try { _raw.exec('CREATE INDEX IF NOT EXISTS idx_lots_seller ON lots(seller_id)'); } catch(e) {}
  try { _raw.exec('CREATE INDEX IF NOT EXISTS idx_lots_category ON lots(category_id)'); } catch(e) {}
  try { _raw.exec('CREATE INDEX IF NOT EXISTS idx_lots_end_time ON lots(end_time)'); } catch(e) {}
  try { _raw.exec('CREATE INDEX IF NOT EXISTS idx_bids_lot ON bids(lot_id)'); } catch(e) {}
  try { _raw.exec('CREATE INDEX IF NOT EXISTS idx_bids_user ON bids(user_id)'); } catch(e) {}
  try { _raw.exec('CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)'); } catch(e) {}
  try { _raw.exec('CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id)'); } catch(e) {}
  try { _raw.exec('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)'); } catch(e) {}
  try { _raw.exec('CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_id)'); } catch(e) {}
  try { _raw.exec('CREATE INDEX IF NOT EXISTS idx_purchases_seller ON purchases(seller_id)'); } catch(e) {}
  try { _raw.exec('CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status)'); } catch(e) {}
  try { _raw.exec('CREATE INDEX IF NOT EXISTS idx_reviews_seller ON reviews(seller_id)'); } catch(e) {}
  try { _raw.exec('CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id)'); } catch(e) {}

  const categoriesExist = _raw.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (categoriesExist.count === 0) {
    const insertCat = _raw.prepare('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)');
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
    const insertMany = _raw.transaction((cats) => {
      for (const cat of cats) {
        insertCat.run(...cat);
      }
    });
    insertMany(categories);
  }

  try { _raw.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS lots_fts USING fts5(title, description, content='lots', content_rowid='id')`); } catch(e) {}
  try { _raw.exec(`CREATE TRIGGER IF NOT EXISTS lots_ai AFTER INSERT ON lots BEGIN INSERT INTO lots_fts(rowid, title, description) VALUES (new.id, new.title, new.description); END;`); } catch(e) {}
  try { _raw.exec(`CREATE TRIGGER IF NOT EXISTS lots_ad AFTER DELETE ON lots BEGIN INSERT INTO lots_fts(lots_fts, rowid, title, description) VALUES('delete', old.id, old.title, old.description); END;`); } catch(e) {}
  try { _raw.exec(`CREATE TRIGGER IF NOT EXISTS lots_au AFTER UPDATE ON lots BEGIN INSERT INTO lots_fts(lots_fts, rowid, title, description) VALUES('delete', old.id, old.title, old.description); INSERT INTO lots_fts(rowid, title, description) VALUES (new.id, new.title, new.description); END;`); } catch(e) {}

  // Async-compatible wrapper (returns Promises for unified API with PG)
  const origPrepare = _raw.prepare.bind(_raw);

  const db = {
    prepare(sql) {
      const stmt = origPrepare(sql);
      return {
        all: (...args) => Promise.resolve(stmt.all(...args)),
        get: (...args) => Promise.resolve(stmt.get(...args)),
        run: (...args) => Promise.resolve(stmt.run(...args)),
      };
    },
    transaction(fn) {
      return (...args) => fn(...args);
    },
    close() {
      return Promise.resolve(_raw.close());
    },
  };

  module.exports = db;
}
