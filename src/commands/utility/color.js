const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('color')
        .setDescription('Change la couleur du bot')
        .addStringOption(option => option 
            .setName('couleur')
            .setDescription('Couleur en hexadécimal (ex: #f50cda)')
            .setRequired(true)
        ),
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

        db.prepare(`
            INSERT INTO guilds (id, color) VALUES (?, ?)
            ON CONFLICT(id) DO UPDATE SET COLOR = ?
        `).run(guildId, color, color);

        interaction.reply({
            content: '✅ La couleur a été mis à jour !',
            flags: MessageFlags.Ephemeral,
        });
    }
};