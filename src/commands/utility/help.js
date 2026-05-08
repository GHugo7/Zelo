const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const getColor = require('../../utils/getColor');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription("Tu as besoin de plus d'information sur les commandes ?"),
    async execute(interaction) {  
        const color = getColor(interaction.guild.id);
        const embed = new EmbedBuilder()
            .setTitle('📋 Commandes disponibles')
            .setColor(color)
            .setFields(
                { name: '/ping', value: 'Vérifier le bon fonctionnement du bot'},
                { name: '/help', value: 'Donne la liste des commandes'},
                { name: '/color', value: 'Permet de personnaliser la couleur du bot'},
            )
            .setTimestamp()

            await interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral,
            })
    }
};