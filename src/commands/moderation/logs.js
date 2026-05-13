const {
    SlashCommandBuilder, 
    ChannelType
} = require('discord.js');
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription("Choisir le salon de logs")
        .addChannelOption(option => option
            .setName('channel')
            .setDescription("Salon où envoyé les logs du serveur")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');  
        const guildId = interaction.guild.id;

        db.prepare(`
            INSERT INTO guilds (id, channel_logs) VALUES (?, ?)
            ON CONFLICT(id) DO UPDATE SET channel_logs = ?
        `).run(guildId, channel.id, channel.id)

        await interaction.reply({
            content: getChannel.id,
        });
        console.log(channel.id);
    }
}