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