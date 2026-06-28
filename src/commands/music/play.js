const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { name } = require('../../database');

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

        await interaction.deferReply();

        try {
            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    metadata: {
                        channel: interaction.channel,
                    },
                },
            });

            return interaction.followUp(`🎵 **${track.title}** ajouté à la queue !`);
        } catch (e) {
            interaction.followUp(`❌ Aucun résultat trouvé pour **${query}** !`);
        }
    },

    async autocomplete(interaction) {
        const player = useMainPlayer();
        const query = interaction.options.getString('query', true);

        if (!query) return interaction.respond([]);

        try {
            const results = await player.search(query);
            return interaction.respond(
                results.tracks.slice(0, 10).map(t => ({
                    name: t.title.slice(0, 100),
                    value: t.url.slice(0, 100),
                }))
            );
        } catch {
            return interaction.respond([])
        }
    },
};