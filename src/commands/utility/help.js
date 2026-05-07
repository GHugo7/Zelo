const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('help').setDescription("Tu as besoin de plus d'information sur les commandes ?"),
    async execute(interaction) {
        await interaction.reply({
            content: 'Hey !',
            flags: MessageFlags.Ephemeral,
        })
    }
};