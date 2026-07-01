const db = require('../database');

module.exports = function getChannel(guildId, type) {
    const data =  db.prepare(`
        SELECT * FROM config WHERE id = ?
    `).get(guildId);

    if (!data) return null;

    switch (type) {
        case "logs":
            return data.channel_logs;
        default: return null;
    }
}