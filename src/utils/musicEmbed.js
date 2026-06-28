const { EmbedBuilder } = require('discord.js');
const getColor = require('./getColor');

module.exports = function buildMusicEmbed(queue, page = 0) {
    const currentTrack = queue.currentTrack;
    const tracks = queue.tracks.toArray();
    const tracksPerPage = 10;
    const totalPages = Math.ceil(tracks.length / tracksPerPage) || 1;
    const pageTracks = tracks.slice(page * tracksPerPage, (page + 1) * tracksPerPage);

    if (!currentTrack) return null;

    // Barre de progression
    const duration = currentTrack.durationMS;
    const position = queue.node.getTimestamp();
    const progress = position ? Math.floor(position.progress / 5) : 0;
    const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);

    // Liste de la queue
    const queueList = pageTracks.length > 0
        ? pageTracks.map((t, i) => `${page * tracksPerPage + i + 1}. **${t.title}** - **${t.author}**`).join('\n')
        : 'Aucune musique dans la queue';

    const embed = new EmbedBuilder()
        .setColor(getColor(queue.guild.id))
        .setTitle('🎵 Lu` Music Player')
        .setThumbnail(currentTrack.thumbnail || null)
        .addFields(
            { name: '🎶 En cours', value: `**${currentTrack.title}**`, inline: false },
            { name: '👤 Artiste', value: currentTrack.author, inline: true },
            { name: '⏱️ Durée', value: position?.current?.label && position?.total?.label ? `${position.current.label} / ${position.total.label}` : '0:00 / 0:00', inline: true },
            { name: '➕ Ajouté par', value: `${currentTrack.requestedBy}`, inline: false },
            { name: `▶️ ${bar}`, value: '\u200b', inline: false },
            { name: `📋 File d'attente — page ${page + 1}/${totalPages}`, value: queueList, inline: false },
        )
        .setTimestamp();
    
    return { embed, totalPages }
};