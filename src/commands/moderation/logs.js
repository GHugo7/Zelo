const {
    SlashCommandBuilder,
    EmbedBuilder,
    ChannelType
} = require('discord.js');
const db = require('../../database');
const getChannel = require('../../utils/getChannel')
const getColor = require('../../utils/getColor')

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
        const guildDB = db.prepare(`SELECT channel_logs FROM guilds WHERE id = ?`).get(guildId);

        if (guildDB && guildDB.channel_logs === channel.id) {
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: interaction.user.globalName,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setColor(getColor(guildId))
                .setTitle("⚙️ Configuration - logs")
                .addFields(
                    { name: "Salon", value: `${channel}`, inline: true },
                    { name: "Action", value: `Aucune`, inline: true },
                    { name: "Ancien salon", value: `${channel}`, inline: true },
                )
                .setTimestamp()

            return await interaction.reply({
                embeds: [embed],
            })
        }

        db.prepare(`
            INSERT INTO guilds (id, channel_logs) VALUES (?, ?)
            ON CONFLICT(id) DO UPDATE SET channel_logs = ?
        `).run(guildId, channel.id, channel.id)

        const embed = new EmbedBuilder()
            .setColor(getColor(guildId))
            // HEADER
            .setAuthor({
                name: interaction.user.globalName,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle("⚙️ Configuration - logs")
            // Corps
            .addFields(
                { name: "Salon", value: `${channel}`, inline: true },
                { name: "Action", value: `${guildDB?.channel_logs ? "Modifié" : "Défini"}`, inline: true },
                { name: "Ancien salon", value: `${guildDB?.channel_logs ? `<#${guildDB.channel_logs}>` : '-'}`, inline: true },
            )
            // Footer
            .setTimestamp()
        await interaction.reply({
            embeds: [embed],
        });
    }
}