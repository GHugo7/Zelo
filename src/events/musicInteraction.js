const { Events, MessageFlags } = require('discord.js');
const { useQueue, useHistory } = require('discord-player');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const queue = useQueue(interaction.guild.id);

        if (!queue) {
            return interaction.reply({
                content: '❌ Aucune musique en cours !',
                flags: MessageFlags.Ephemeral
            });
        }

        switch (interaction.customId) {
            case 'music_pause':
                queue.node.setPaused(!queue.node.isPaused());
                await interaction.deferUpdate();
                break;
            case 'music_skip':
                queue.node.skip();
                await interaction.deferUpdate();
                break;
            case 'music_stop':
                await queue.metadata.playerMessage.delete();
                queue.delete();
                await interaction.deferUpdate();
                break;
            case 'music_shuffle':
                queue.tracks.shuffle();
                await interaction.deferUpdate();
                break;
            case 'music_previous':
                try {
                    const history = useHistory(interaction.guild.id)
                    await history.previous();
                    await interaction.deferUpdate();
                } catch {
                    await interaction.reply({
                        content: '❌ Aucune musique en cours !',
                        flags: MessageFlags.Ephemeral
                    });
                }
                break;
            case 'music_prev_page':
            case 'music_next_page':
                await interaction.deferUpdate();
                break;
        }
    }
}