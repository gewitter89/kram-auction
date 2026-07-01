const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://kram:kram@localhost:5432/kram',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

console.log('[DB] PostgreSQL pool created');

async function initSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        city TEXT,
        bio TEXT,
        avatar TEXT,
        rating DOUBLE PRECISION DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        is_verified INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        is_admin INTEGER DEFAULT 0,
        reset_token TEXT,
        reset_token_expires TIMESTAMPTZ,
        email_verified INTEGER DEFAULT 0,
        email_token TEXT,
        telegram_chat_id TEXT,
        google_id TEXT,
        two_factor_secret TEXT,
        two_factor_enabled INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        parent_id INTEGER REFERENCES categories(id),
        icon TEXT
      );
      CREATE TABLE IF NOT EXISTS lots (
        id SERIAL PRIMARY KEY,
        seller_id INTEGER NOT NULL REFERENCES users(id),
        category_id INTEGER NOT NULL REFERENCES categories(id),
        title TEXT NOT NULL,
        description TEXT,
        condition TEXT DEFAULT 'used',
        sale_type TEXT DEFAULT 'auction',
        start_price NUMERIC(12,2) NOT NULL DEFAULT 1,
        current_price NUMERIC(12,2) NOT NULL DEFAULT 1,
        buy_now_price NUMERIC(12,2),
        reserve_price NUMERIC(12,2),
        bid_step NUMERIC(12,2) DEFAULT 10,
        bids_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        city TEXT,
        delivery_methods TEXT,
        payment_methods TEXT,
        start_time TIMESTAMPTZ DEFAULT NOW(),
        end_time TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        tsv tsvector GENERATED ALWAYS AS (to_tsvector('ukrainian', coalesce(title,'') || ' ' || coalesce(description,''))) STORED
      );
      CREATE TABLE IF NOT EXISTS lot_images (
        id SERIAL PRIMARY KEY,
        lot_id INTEGER NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        is_main INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        lot_id INTEGER NOT NULL REFERENCES lots(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        amount NUMERIC(12,2) NOT NULL,
        is_auto INTEGER DEFAULT 0,
        auto_max NUMERIC(12,2),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        lot_id INTEGER NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, lot_id)
      );
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id),
        receiver_id INTEGER NOT NULL REFERENCES users(id),
        lot_id INTEGER REFERENCES lots(id),
        text TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        reviewer_id INTEGER NOT NULL REFERENCES users(id),
        seller_id INTEGER NOT NULL REFERENCES users(id),
        lot_id INTEGER REFERENCES lots(id),
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        text TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        lot_id INTEGER REFERENCES lots(id),
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        lot_id INTEGER NOT NULL REFERENCES lots(id),
        buyer_id INTEGER NOT NULL REFERENCES users(id),
        seller_id INTEGER NOT NULL REFERENCES users(id),
        amount NUMERIC(12,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_method TEXT,
        delivery_method TEXT,
        tracking_number TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        paid_at TIMESTAMPTZ,
        shipped_at TIMESTAMPTZ,
        received_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS email_queue (
        id SERIAL PRIMARY KEY,
        recipient TEXT NOT NULL,
        template TEXT NOT NULL,
        data_json TEXT NOT NULL,
        retries INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_lots_status ON lots(status)',
      'CREATE INDEX IF NOT EXISTS idx_lots_seller ON lots(seller_id)',
      'CREATE INDEX IF NOT EXISTS idx_lots_category ON lots(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_lots_end_time ON lots(end_time)',
      'CREATE INDEX IF NOT EXISTS idx_lots_tsv ON lots USING GIN(tsv)',
      'CREATE INDEX IF NOT EXISTS idx_bids_lot ON bids(lot_id)',
      'CREATE INDEX IF NOT EXISTS idx_bids_user ON bids(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_id)',
      'CREATE INDEX IF NOT EXISTS idx_purchases_seller ON purchases(seller_id)',
      'CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status)',
      'CREATE INDEX IF NOT EXISTS idx_reviews_seller ON reviews(seller_id)',
      'CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id)',
    ];
    for (const idx of indexes) {
      await client.query(idx);
    }

    const { rows: existing } = await client.query('SELECT COUNT(*) as count FROM categories');
    if (parseInt(existing[0].count) === 0) {
      const categories = [
        ['Електроніка, Техніка', 'electronics'],
        ['Ноутбуки', 'laptops'],
        ['Смартфони', 'smartphones'],
        ['Комплектуючі для ПК', 'pc-parts'],
        ['Системні блоки, ПК', 'desktops'],
        ['Одяг, мода, краса', 'fashion'],
        ['Автозапчастини, Тюнінг', 'auto'],
        ['Спорт, Туризм', 'sport'],
        ['Дитячі товари', 'kids'],
        ['Будинок, дозвілля', 'home'],
        ['Інструменти', 'tools'],
        ['Техніка для кухні', 'kitchen'],
        ['Розумні годинники', 'smartwatch'],
        ['Камери', 'cameras'],
      ];
      for (const [name, slug] of categories) {
        await client.query('INSERT INTO categories (name, slug, icon) VALUES ($1, $2, $3)', [name, slug, '']);
      }
      console.log('[DB] Categories seeded');
    }

    console.log('[DB] PostgreSQL schema initialized');
  } finally {
    client.release();
  }
}

function convertSql(sql) {
  let q = sql;
  let counter = 0;
  q = q.replace(/\?/g, () => `$${++counter}`);

  q = q.replace(/datetime\("now",\s*"\+1 hour"\)/gi, "NOW() + INTERVAL '1 hour'");
  q = q.replace(/datetime\('now',\s*'\+1 hour'\)/gi, "NOW() + INTERVAL '1 hour'");
  q = q.replace(/datetime\("now"\)/gi, 'NOW()');
  q = q.replace(/datetime\('now'\)/gi, 'NOW()');
  q = q.replace(/date\('now'\)/gi, 'CURRENT_DATE');
  q = q.replace(/date\("now"\)/gi, 'CURRENT_DATE');

  q = q.replace(/INSERT OR IGNORE INTO/gi, 'INSERT INTO');

  // Full-text search: lots_fts MATCH → tsvector
  if (/lots_fts/i.test(q)) {
    q = q.replace(/JOIN\s+lots_fts\s+ON\s+lots\.id\s*=\s*lots_fts\.rowid/gi, '');
    q = q.replace(/lots_fts\s*\.\s*rowid/gi, 'lots.id');
    q = q.replace(/lots_fts\s*MATCH\s*\?/gi, "lots.tsv @@ plainto_tsquery('ukrainian', $1)");
    q = q.replace(/ORDER\s+BY\s+rank/gi, "ORDER BY ts_rank(lots.tsv, plainto_tsquery('ukrainian', $1)) DESC");
  }

  q = q.replace(/SUBSTR\(([^,]+),\s*(\d+),\s*(\d+)\)/gi, 'SUBSTRING($1 FROM $2 FOR $3)');

  return q;
}

class PgStatement {
  constructor(executor, sql) {
    this._exec = executor;
    this._sql = convertSql(sql);
  }

  get _query() {
    const isInsert = /^\s*INSERT\s+/i.test(this._sql) && !/RETURNING\s+/i.test(this._sql);
    if (isInsert) {
      return this._sql.replace(/;?\s*$/, ' RETURNING id');
    }
    return this._sql;
  }

  async all(...params) {
    const r = await this._exec(this._sql, params);
    return r.rows;
  }

  async get(...params) {
    const r = await this._exec(this._sql, params);
    return r.rows[0] || undefined;
  }

  async run(...params) {
    const sqlExec = this._query;
    const isInsert = sqlExec !== this._sql;
    const r = await this._exec(sqlExec, params);
    if (isInsert && r.rows.length > 0) {
      return { lastInsertRowid: r.rows[0].id, changes: r.rowCount };
    }
    return { lastInsertRowid: null, changes: r.rowCount };
  }
}

class PgWrapper {
  constructor() {
    this._pool = pool;
    this._client = null; // set during transaction
  }

  get _exec() {
    if (this._client) {
      return (sql, params) => this._client.query(sql, params);
    }
    return (sql, params) => this._pool.query(sql, params);
  }

  prepare(sql) {
    return new PgStatement(this._exec, sql);
  }

  transaction(fn) {
    const self = this;
    return async (...args) => {
      const client = await self._pool.connect();
      self._client = client;
      try {
        await client.query('BEGIN');
        await fn(...args);
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        self._client = null;
        client.release();
      }
    };
  }

  async close() {
    await this._pool.end();
  }
}

const db = new PgWrapper();

let _initPromise = null;
const origPrepare = db.prepare.bind(db);
db.prepare = function(sql) {
  if (!_initPromise) {
    _initPromise = initSchema().catch(e => {
      console.error('[DB] Schema init failed:', e.message);
      throw e;
    });
  }
  const stmt = origPrepare(sql);
  const origAll = stmt.all.bind(stmt);
  const origGet = stmt.get.bind(stmt);
  const origRun = stmt.run.bind(stmt);
  return {
    all: async (...args) => { await _initPromise; return origAll(...args); },
    get: async (...args) => { await _initPromise; return origGet(...args); },
    run: async (...args) => { await _initPromise; return origRun(...args); },
  };
};

module.exports = db;
