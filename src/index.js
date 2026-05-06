const {
    Client,
    GatewayIntentBits,
    channels,
    ChannelType
} = require('discord.js');
const { channel } = require('node:diagnostics_channel');
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});

bot.once('clientReady', () => {
    const channels = bot.channels.cache.filter(channel => channel.type !== ChannelType.GuildCategory);
    console.log(`${bot.user.tag} est connecté ! ✅ ❤️`);
    console.log(`Le bot est prêt depuis ${bot.uptime} millisecondes ! ou ${Math.floor(bot.uptime / 1000)} secondes.\n ${channels.size} channels`);

    bot.channels.cache.forEach(channel => {
        console.log(`${channel.name} - ${channel.type}`)
    })
});


bot.on('', () => {

});
bot.login(process.env.TOKEN);