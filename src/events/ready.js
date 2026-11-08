const {
    Events,
    ActivityType,
} = require('discord.js');
const { createPlayer } = require('../player');
const db = require('../database');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(bot) {
        console.log(`${bot.user.username} est connecté ! ✅ ❤️`);

        try {
            await createPlayer(bot);
            require('../playerEvents');
        } catch (error) {
            console.error('[ready] lecteur musique indisponible :', error);
        }
        const statuts = [
            { name: 'Zelo - Mister', type: ActivityType.Watching },
            { name: '/help pour commencer', type: ActivityType.Playing },
            { name: 'de la bonne musique', type: ActivityType.Listening },
            { name: 'vos messages', type: ActivityType.Watching },
        ];

        let i = 0;
        bot.user.setPresence({
            activities: [statuts[0]],
            status: 'online' // online, idle, dnd, invisible
        });
        setInterval(() => {
            i = (i + 1) % statuts.length;
            bot.user.setActivity(statuts[i]);
        }, 10000);

        bot.guilds.cache.forEach(guild => {
            db.prepare('INSERT OR IGNORE INTO guilds (id) VALUES (?)').run(guild.id);
        });
    }
}