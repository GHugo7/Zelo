const {
    SlashCommandBuilder,
} = require('discord.js');
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Réinitialiser la base de donnée acroché au serveur'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const guildDB = db.prepare(`SELECT id FROM guilds WHERE id = ?`).get(guildId);
        if (guildDB) {
            db.prepare(`DELETE FROM guilds WHERE id = ?`).run(guildId);

            await interaction.reply({
                content: `⚙️ Réinitialisation - BDD\nLa base de donnée de ce serveur a été supprimé !`,
            })
        } else {
            await interaction.reply({
                content: `⚙️ Réinitialisation - BDD\nLa base de donnée de ce serveur n'a pas été trouvé`,
            })
        }
    }
}
