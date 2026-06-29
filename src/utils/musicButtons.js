const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js')

module.exports = function buildMusicButtons(page, totalPages, isPaused, repeatMode = 0) {
    const controlRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('music_previous')
            .setEmoji('⏮️')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('music_pause')
            .setEmoji(isPaused ? '▶️' : '⏸️')
            .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('music_skip')
            .setEmoji('⏭️')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('music_stop')
            .setEmoji('⏹️')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('music_shuffle')
            .setEmoji('🔀')
            .setStyle(ButtonStyle.Secondary),
    );

    const pageRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('music_prev_page')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
        new ButtonBuilder()
            .setCustomId('music_next_page')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page >= totalPages - 1),
    );

    const loopRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('music_loop')
            .setPlaceholder('🔁 Mode de répétition')
            .addOptions([
                { label: 'Désactivé', value: '0', default: repeatMode === 0 },
                { label: 'Répéter la musique', value: '1', default: repeatMode === 1 },
                { label: 'Répéter la queue', value: '2', default: repeatMode === 2 },
                { label: 'AutoPlay', value: '3', default: repeatMode === 3 },
            ])
    );

    return [controlRow, pageRow, loopRow]
};