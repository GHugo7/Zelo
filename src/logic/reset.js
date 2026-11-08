const { EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../database');
const getColor = require('../utils/getColor')
const embedError = require('../utils/embedError')

module.exports = {
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const guildDB = db.prepare(`SELECT id FROM config WHERE id = ?`).get(guildId);

        const embed = new EmbedBuilder()
            .setColor(getColor(guildId)) // ROUGE ~
            .setTitle('⚙️ Réinitialisation — BDD')
            .setTimestamp(); 

        if (guildDB) {
            db.prepare(`DELETE FROM config WHERE id = ?`).run(guildId);
            embed.setDescription('La configuration de ce serveur a été supprimée !')
        } 
        else if (!guildDB) {
            const errorEmbed = embedError('⚙️ Réinitialisation — BDD' ,'Aucune configuration n\'a été trouvée pour ce serveur.')
            
            return interaction.reply({
                embeds: [errorEmbed],
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });
    }
};
