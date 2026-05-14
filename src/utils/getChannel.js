const db = require('../database');

module.exports = function getChannel(guildId, type) {
    let data =  db.prepare(`
        SELECT * FROM guilds WHERE id = ?
    `).get(guildId)

    switch (type) {
        case "logs":
            return data.channel_logs;
        default: return null;
    }
}