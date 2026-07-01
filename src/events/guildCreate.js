const { Events } = require('discord.js');
const db = require('../database');

module.exports = {
    name: Events.GuildCreate,
    once: false,
    async execute(guild) {
        db.prepare('INSERT OR IGNORE INTO guilds (id) VALUES (?)').run(guild.id);
    }
};