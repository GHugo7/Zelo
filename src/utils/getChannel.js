const db = require('../database');

module.exports = function getChannel(guildId, channelId) {
    db.prepare(`
        SELECT * FROM guilds WHERE id = ? 
    `)
}