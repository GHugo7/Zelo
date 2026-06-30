const {
    SlashCommandBuilder,
    EmbedBuilder,
    MessageFlags,
} = require('discord.js');
const db = require('../database');

module.exports = {
    async execute(interaction) {
        const input = interaction.options.getString('couleur');
        const hex = input.replace('#', '');

        if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
            return interaction.reply({
                content: '❌ Couleur invalide ! Format attendu : `#5865F2`',
                flags: MessageFlags.Ephemeral,
            });
        }
        
        const color = parseInt(hex, 16);
        const guildId = interaction.guild.id;

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Configuration — Couleur')
            .setColor(color)
            .addFields(
                { name: 'Nouvelle couleur', value: `#${hex.toUpperCase()}`, inline: true }
            )
            .setTimestamp()

        db.prepare(`
            INSERT INTO guilds (id, color) VALUES (?, ?)
            ON CONFLICT(id) DO UPDATE SET COLOR = ?
        `).run(guildId, color, color);

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        })
    }
};