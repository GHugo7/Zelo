const {
    Events,
    ChannelType,
    ActivityType,
} = require('discord.js');
const { createPlayer } = require('../player');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(bot) {
        const channels = bot.channels.cache.filter(channel => channel.type !== ChannelType.GuildCategory);
        console.log(`${bot.user.username} est connecté ! ✅ ❤️`);
        console.log(`Channels : ${channels.size}`);

        bot.channels.cache.forEach(channel => {
            console.log(`- ${channel.name} - type : ${channel.type}`)
        })

        await createPlayer(bot);
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
        }, 20000);
    }
}