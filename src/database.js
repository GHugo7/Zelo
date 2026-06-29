const Database = require('better-sqlite3');
const path = require('node:path');

const db = new Database(path.join(__dirname, '..', 'database.db'));

// Création des tables au démarrage
db.exec(`
    CREATE TABLE IF NOT EXISTS track_cache (
    youtube_title TEXT PRIMARY KEY,
    artist TEXT,
    title TEXT
    )
`);

module.exports = db;