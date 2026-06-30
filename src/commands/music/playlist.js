const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Gérer vos playlist.')
        .addSubcommand(sub => sub 
            .setName('create')
            .setDescription('Créer une playlist')
            .addStringOption(opt => opt 
                .setName('nom')
                .setDescription('Nom de la playlist')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub 
            .setName('add')
            .setDescription('Ajouter une musique à une playlist')
            .addStringOption(opt => opt
                .setName('playlist')
                .setDescription('Nom de la playlist')
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addStringOption(opt => opt 
                .setName('query')
                .setDescription('Musique à ajouter')
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand(sub => sub 
            .setName('play')
            .setDescription('Jouer une playlist')
            .addStringOption(opt => opt
                .setName('nom')
                .setDescription('Nom de la playlist')
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('list')
            .setDescription('Afficher vos playlists')
        )
        .addSubcommand(sub => sub
            .setName('show')
            .setDescription('Voir les musiques d\'une playlist')
            .addStringOption(opt => opt
                .setName('nom')
                .setDescription('Nom de la playlist')
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('delete')
            .setDescription('Supprimer une playlist')
            .addStringOption(opt => opt
                .setName('nom')
                .setDescription('Nom de la playlist')
                .setRequired(true)
                .setAutocomplete(true)
            )
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        if (sub === 'create') {
            const name = interaction.options.getString('nom');
            try {
                db.prepare('INSERT INTO playlists (guild_id, user_id, name) VALUES (?, ?, ?)').run(guildId, userId, name);
                await interaction.reply({ content: `Playlist **${name}** créée !`, flags: MessageFlags.Ephemeral });
            } catch {
                await interaction.reply({ content: `Une playlist **${name}** existe déjà !`, flags: MessageFlags.Ephemeral });
            }
        }

        else if (sub === 'add') {
            const name = interaction.options.getString('playlist');
            const query = interaction.options.getString('query');
            const playlist = db.prepare('SELECT id FROM playlists WHERE guild_id = ? AND user_id = ? AND name = ?').get(guildId, userId, name);
            if (!playlist) return interaction.reply({ content: `Playlist **${name}** introuvable !`, flags: MessageFlags.Ephemeral });

            const { useMainPlayer } = require('discord-player');
            const player = useMainPlayer();
            const result = await player.search(query, { requestedBy: interaction.user });

            if (!result.hasTracks()) return interaction.reply({ content: `Aucun résultat pour **${query}** !`, flags: MessageFlags.Ephemeral });

            const track = result.tracks[0];
            
            const existing = db.prepare('SELECT id FROM playlist_tracks WHERE playlist_id = ? AND title = ?').get(playlist.id, track.title);
            if (existing) {
                return interaction.reply({
                    content: `**${track.title}** est déjà dans la playlist **${name}** !`,
                    flags: MessageFlags.Ephemeral
                })
            }

            db.prepare('INSERT INTO playlist_tracks (playlist_id, title, url) VALUES (?, ?, ?)').run(playlist.id, track.title, track.url);
            await interaction.reply({ content: `**${track.title}** ajouté à **${name}** (recherche : ${query})`, flags: MessageFlags.Ephemeral })
        }

        else if (sub === 'list') {
            const playlists = db.prepare('SELECT name FROM playlists WHERE user_id = ?').all(userId);
            if (!playlists.length) return interaction.reply({ content: 'Vous n\'avez aucune playlist !', flags: MessageFlags.Ephemeral });
            await interaction.reply({ content: `Vos playlists :\n${playlists.map(p => `- **${p.name}**`).join('\n')}`, flags: MessageFlags.Ephemeral });
        }

        else if (sub === 'show') {
            const name = interaction.options.getString('nom');
            const playlist = db.prepare('SELECT id FROM playlists WHERE guild_id = ? AND user_id = ? and name = ?').get(guildId, userId, name);
            if (!playlist) return interaction.reply({ content: `Playlist **${name}** introuvable !`, flags: MessageFlags.Ephemeral });

            const tracks = db.prepare('SELECT title FROM playlist_tracks WHERE playlist_id = ?').all(playlist.id);
            if (!tracks.length) return interaction.reply({ content: `Playlist **${name}** est vide !`, flags: MessageFlags.Ephemeral });

            await interaction.reply({
                content: `**${name}** — ${tracks.length} musique(s) :\n${tracks.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}`,
                flags: MessageFlags.Ephemeral
            });
        }
        
        else if (sub === 'delete') {
            const name = interaction.options.getString('nom');
            const playlist = db.prepare('SELECT id FROM playlists WHERE guild_id = ? AND user_id = ? AND name = ?').get(guildId, userId, name);

            if (!playlist) return interaction.reply({ content: `Playlist **${name}** introuvable !`, flags: MessageFlags.Ephemeral });
            
            db.prepare('DELETE FROM playlists WHERE id = ?').run(playlist.id);
            await interaction.reply({ content: `Playlist **${name}** supprimée !`, flags: MessageFlags.Ephemeral });
        }

        else if (sub === 'play') {
            const name = interaction.options.getString('nom');
            const channel = interaction.member.voice.channel;

            if (!channel) return interaction.reply({
                content: 'Tu dois être dans un salon vocal !',
                flags: MessageFlags.Ephemeral
            });

            const playlist = db.prepare('SELECT id FROM playlists WHERE guild_id = ? AND user_id = ? AND name = ?').get(guildId, userId, name);
            if (!playlist) return interaction.reply({
                content: `Playlist **${name}** introuvable !`,
                flags: MessageFlags.Ephemeral
            });

            const tracks = db.prepare('SELECT title, url FROM playlist_tracks WHERE playlist_id = ?').all(playlist.id);
            if (!tracks.length) return interaction.reply({
                content: `La playlist **${name}** est vide !`,
                flags: MessageFlags.Ephemeral
            });

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const { useMainPlayer } = require('discord-player');
            const player = useMainPlayer();

            for (const track of tracks) {
                await player.play(channel, track.url, {
                    nodeOptions: { 
                        metadata: { channel: interaction.channel, playlistName: name }
                    },
                    requestedBy: interaction.user,
                }).catch(() => {});
            }

            await interaction.editReply(`Playlist **${name}** lancée — ${tracks.length} musique(s)`);
        }
    },

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        if (focusedOption.name === 'query') {
            const { useMainPlayer } = require('discord-player');
            const player = useMainPlayer();
            try {
                const results = await Promise.race([
                    player.search(focusedOption.value),
                    new Promise((_, reject) => setTimeout(() => reject(), 1500))
                ]);
                return interaction.respond(
                    results.tracks.slice(0, 10).map(t => ({ name: t.title.slice(0, 100), value: t.url.slice(0, 100) }))
                );
            } catch {
                return interaction.respond([]);
            }
        }

        let playlists;
        if (sub === 'play') {
            playlists = db.prepare('SELECT name FROM playlists WHERE guild_id = ?').all(guildId);
        } else {
            playlists = db.prepare('SELECT name FROM playlists WHERE guild_id = ? AND user_id = ?').all(guildId, userId);
        }

        const filtered = playlists.filter(p => p.name.toLowerCase().includes(focusedOption.value.toLowerCase()));
        await interaction.respond(filtered.slice(0, 25).map(p => ({ name: p.name, value: p.name })));
    }
};