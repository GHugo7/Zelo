const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Jouer une musique')
        .addStringOption(option => option
            .setName('query')
            .setDescription('Nom ou URL de la musique')
            .setAutocomplete(true)
            .setRequired(true)
        ),
    async execute(interaction) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
    
        if (!channel) {
            return interaction.reply({
                content: '❌ Utilisateur introuvable dans le salon vocal !',
                flags: MessageFlags.Ephemeral
            });
        }

        const query = interaction.options.getString('query', true);
        
        try {
            await interaction.deferReply();
        } catch {
            return;
        }

        try {
            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    metadata: { channel: interaction.channel, playlistName: null },
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 60000,
                    leaveOnEnd: true,
                    leaveOnEndCooldown: 10000, 
                },
                requestedBy: interaction.user,
            });

            return interaction.deleteReply();
        } catch (e) {
            interaction.followUp(`❌ Aucun résultat trouvé pour **${query}** !`);
        }
    },

    async autocomplete(interaction) {
        const player = useMainPlayer();
        const query = interaction.options.getString('query', true);
        if (!query || query.length < 2) {
            try { await interaction.respond([]); } catch {}
            return;
        }
        try {
            const results = await Promise.race([
                player.search(query),
                new Promise((_, reject) => setTimeout(() => reject(), 1500))
            ]);
            try {
                await interaction.respond(
                    results.tracks.slice(0, 10).map(t => ({
                        name: t.title.slice(0, 100),
                        value: t.url.slice(0, 100),
                    }))
                );
            } catch {}
        } catch {
            try { await interaction.respond([]); } catch {}
        }
    },
};