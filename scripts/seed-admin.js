const bcrypt = require('bcryptjs');
const db = require('../database');

// Add is_admin column if missing
try {
    db.prepare("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0").run();
    console.log('✓ Column is_admin added');
} catch (e) {
    console.log('→ Column is_admin already exists');
}

// Create admin user
const username = 'admin';
const password = 'admin123';
const email = 'admin@kram.auction';

const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);

if (existing) {
    // Make existing user admin
    db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(existing.id);
    console.log('✓ User "' + username + '" (id=' + existing.id + ') promoted to admin');
} else {
    // Create new admin
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
        INSERT INTO users (username, email, password_hash, first_name, is_admin)
        VALUES (?, ?, ?, 'Admin', 1)
    `).run(username, email, hash);
    console.log('✓ Admin user created: id=' + result.lastInsertRowid);
}

console.log('\n=== ADMIN CREDENTIALS ===');
console.log('  Login:    ' + username);
console.log('  Password: ' + password);
console.log('  Email:    ' + email);
console.log('========================\n');
