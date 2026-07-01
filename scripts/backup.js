const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'auction.db');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

const date = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `auction-${date}.db`);

try {
    fs.copyFileSync(DB_PATH, backupFile);
    console.log(`[BACKUP] Created: ${backupFile}`);
    
    // Keep only last 7 backups
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('auction-')).sort().reverse();
    files.slice(7).forEach(f => {
        fs.unlinkSync(path.join(BACKUP_DIR, f));
        console.log(`[BACKUP] Removed old: ${f}`);
    });
} catch(e) {
    console.error('[BACKUP] Failed:', e.message);
    process.exit(1);
}
