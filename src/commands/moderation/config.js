const { SlashCommandBuilder, MessageFlags ,ChannelType } = require('discord.js');
const db = require('../../database');

const resetLogic = require('../../logic/reset');
const logsLogic = require('../../logic/logs');
const colorLogic = require('../../logic/color');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configurer Lu`')
        .addSubcommand(sub => sub
            .setName('color')
            .setDescription('Définir la couleur du bot')
            .addStringOption(option => option 
                .setName('couleur')
                .setDescription('Couleur en hexadécimal (ex: #f50cda)')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub 
            .setName('logs')
            .setDescription('Définir le salon de logs')
            .addChannelOption(option => option
                .setName('channel')
                .setDescription("Salon où envoyé les logs")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('reset')
            .setDescription('Réinitialiser la config du serveur')
        ),
    
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (sub === 'reset') {
            return resetLogic.execute(interaction);
        }

        if (sub === 'color') {
            return colorLogic.execute(interaction);
        }

        if (sub === 'logs') {
            logsLogic.execute(interaction);
        }

    }
};