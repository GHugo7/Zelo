const Database = require('better-sqlite3');
const path = require('node:path');

const db = new Database(path.join(__dirname, '..', 'database.db'));

// Création des tables au démarrage
db.exec(`
    CREATE TABLE IF NOT EXISTS guilds (
        id TEXT PRIMARY KEY
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS config (
    id TEXT PRIMARY KEY,
    color INTEGER DEFAULT 5793266,
    channel_logs TEXT,
    logs_member_join INTEGER DEFAULT 0,
    logs_member_leave INTEGER DEFAULT 0,
    logs_voice_join INTEGER DEFAULT 0,
    logs_voice_leave INTEGER DEFAULT 0,
    logs_message_delete INTEGER DEFAULT 0,
    logs_message_update INTEGER DEFAULT 0,

    FOREIGN KEY(id) REFERENCES guilds(id) ON DELETE CASCADE
    )
`)

db.exec(`
    CREATE TABLE IF NOT EXISTS track_cache (
    url TEXT PRIMARY KEY,
    artist TEXT,
    title TEXT
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT,
        user_id TEXT,
        name TEXT,
        UNIQUE(guild_id, user_id, name)
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS playlist_tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playlist_id INTEGER,
        title TEXT,
        url TEXT,
        FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
    )
`);

module.exports = db;