const { SlashCommandBuilder, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const getColor = require('../../utils/getColor');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription("Tu as besoin de plus d'information sur les commandes ?"),
    async execute(interaction) {  
        const color = getColor(interaction.guild.id);
        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.globalName,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('📋 Commandes disponibles')
            .setColor(color)
            .setFields(
                { name: '/ping', value: 'Vérifier le bon fonctionnement du bot.'},
                { name: '/help', value: 'Donne la liste des commandes.'},
                { name: '/color', value: 'Permet de personnaliser la couleur du bot.'},
                { name: '/config', value: 'Permet la configuration du bot.'},
                { name: '/play', value: 'Ecouter de la musique.'},
            )
            .setTimestamp()

            await interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral,
            })
    }
};