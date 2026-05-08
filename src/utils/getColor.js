const db = require('../database');

module.exports = function getColor(guildId) {
    const guild = db.prepare('SELECT color FROM guilds WHERE id = ?').get(guildId);
    return guild ? guild.color : 0xf50cda;
};