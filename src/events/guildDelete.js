const { Events } = require('discord.js');
const db = require('../database');

module.exports = {
    name: Events.GuildDelete,
    once: false,
    async execute(guild) {
        db.prepare('DELETE FROM guilds WHERE id = ?').run(guild.id);
    }
};