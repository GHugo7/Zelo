const {
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    MessageFlags,
    ChannelType
} = require('discord.js');
require('dotenv').config();
const db = require('./database');
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

bot.commands = new Collection();

bot.once(Events.ClientReady, () => {
    const channels = bot.channels.cache.filter(channel => channel.type !== ChannelType.GuildCategory);
    console.log(`${bot.user.tag} est connecté ! ✅ ❤️`);
    console.log(`Uptime : ${bot.uptime}ms | ${Math.floor(bot.uptime / 1000)} secondes.\nChannels : ${channels.size}`);

    bot.channels.cache.forEach(channel => {
        console.log(`- ${channel.name} - ${channel.type}`)
    })
});

const folderPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(folderPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(folderPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            bot.commands.set(command.data.name, command);
        } else {
            console.warn(`[WARNING] Le fichier ${filePath} n'a pas les propriété "data" ou "execute".`)
        }
    }
}

// 
bot.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    console.log(interaction);
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Aucune commande correspondant à ${interaction.commandName}, n'a était trouvé`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "Il y a eu une erreur lors de l'exécution de cette commande !",
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.reply({
                content: "Il y a eu une erreur lors de l'exécution de cette commande !",
                flags: MessageFlags.Ephemeral,
            })
        }
    }
});

bot.login(process.env.TOKEN);