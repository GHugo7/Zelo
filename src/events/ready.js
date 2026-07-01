const {
    Events,
    ChannelType,
    ActivityType,
} = require('discord.js');
const { createPlayer } = require('../player');
const db = require('../database');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(bot) {
        const channels = bot.channels.cache.filter(channel => channel.type !== ChannelType.GuildCategory);
        const category = bot.channels.cache.filter(category => category.type == ChannelType.GuildCategory);
        console.log(`${bot.user.username} est connecté ! ✅ ❤️`);
        console.log(`Channels : ${channels.size}`);
        console.log(`Categories : ${category.size}`);

        bot.channels.cache.forEach(channel => {
            let channelTypeName;
            if (channel.type !== ChannelType.GuildCategory) {
                switch (channel.type) {
                    case ChannelType.GuildText:
                        channelTypeName = 'Textuel'
                        break;
                    case ChannelType.GuildVoice:
                        channelTypeName = 'Vocal'
                        break;
                    case ChannelType.GuildCategory:
                        channelTypeName = 'Categories'
                        break;
                    default:
                        channelTypeName = `Inconnu (${channel.type})`
                        break;
                    }
                console.log(`- ${channel.name} - type : ${channelTypeName}`)
            }
        })

        await createPlayer(bot);
        require('../playerEvents')
        const statuts = [
            { name: 'la Community Lu\'', type: ActivityType.Watching },
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