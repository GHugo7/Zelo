const {
    Events,
    ChannelType,
} = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(bot) {
        const channels = bot.channels.cache.filter(channel => channel.type !== ChannelType.GuildCategory);
        console.log(`${bot.user.tag} est connecté ! ✅ ❤️`);
        console.log(`Uptime : ${bot.uptime}ms | ${Math.floor(bot.uptime / 1000)} secondes.\nChannels : ${channels.size}`);

        bot.channels.cache.forEach(channel => {
            console.log(`- ${channel.name} - type : ${channel.type}`)
        })
    }
}