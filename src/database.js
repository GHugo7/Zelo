const Database = require('better-sqlite3');
const path = require('node:path');

const db = new Database(path.join(__dirname, '..', 'database.db'));

// Création des tables au démarrage
db.exec(`
    CREATE TABLE IF NOT EXISTS guilds (
    id TEXT PRIMARY KEY,
    color INTEGER DEFAULT f50cda,
    prefix TEXT DEFAULT '-',
    channel_logs TEXT
    )
`);

module.exports = db;