const {
    SlashCommandBuilder 
} = require('discord.js');
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .addStringOption(),

    async execute(interaction) {
        const input = interaction.options.getChannel('channel')
    }
}