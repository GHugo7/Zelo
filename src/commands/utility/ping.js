const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Ping... pong !'),
    async execute(interaction) {
        await interaction.reply({
            content: 'Pong !',
            flags: MessageFlags.Ephemeral,
        });
    }
}