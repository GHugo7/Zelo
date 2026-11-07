const { getPlayer } = require('./player');
const buildMusicEmbed = require('./utils/musicEmbed');
const buildMusicButtons = require('./utils/musicButtons');
const getTrackInfo = require('./utils/getTrackInfo');

const player = getPlayer();

player.events.on('playerStart', async (queue, track) => {
    const trackInfo = await getTrackInfo(track.title, track.author, track.url);
    queue.metadata.trackInfo = trackInfo;

    await new Promise(resolve => setTimeout(resolve, 0));
    const page = queue.metadata.currentPage || 0;
    const result = buildMusicEmbed(queue, page);
    if (!result) return;
    const { embed, embedFile, totalPages } = result;
    const buttons = buildMusicButtons(page, totalPages, false, queue.repeatMode);

    if (queue.metadata.playerMessage) {
        // Message deja existant - edit
        await queue.metadata.playerMessage.edit({
            embeds: [embed, embedFile],
            components: buttons,
        }).catch(() => {});
    } else {
        // Initialisation - creation du message
        const message = await queue.metadata.channel.send({
            embeds: [embed, embedFile],
            components: buttons,
        });
        queue.metadata.playerMessage = message;
    }

    if (queue.metadata.playerInterval) {
        clearInterval(queue.metadata.playerInterval);
    }

    // Edit toutes les secondes
    const interval = setInterval(async () => {
        if (!queue.isPlaying()) {
            clearInterval(interval);
            return;
        }
        const page = queue.metadata.currentPage || 0;
        const result = buildMusicEmbed(queue, page);
        if (!result) return;
        const { embed: updatedEmbed, embedFile: updatedEmbedFile, totalPages: updatedPages } = result;
        const updatedButtons = buildMusicButtons(page, updatedPages, queue.node.isPaused(), queue.repeatMode);
        await queue.metadata.playerMessage.edit({
            embeds: [updatedEmbed, updatedEmbedFile],
            components: updatedButtons,
        }).catch(() => clearInterval(interval));
    }, 1000);
    queue.metadata.playerInterval = interval;
});

player.events.on('disconnect', async (queue) => {
    if (queue.metadata.playerMessage) {
        await queue.metadata.playerMessage.delete().catch(() => {});
    }

    if (queue.metadata.playerInterval) {
        clearInterval(queue.metadata.playerInterval);
    }
});

player.events.on('emptyChannel', async (queue) => {
    if (queue.metadata.playerMessage) {
        await queue.metadata.playerMessage.delete().catch(() => {});
    }

    if (queue.metadata.playerInterval) {
        clearInterval(queue.metadata.playerInterval);
    }
});

player.events.on('emptyQueue', (queue) => {
    return;
});

player.events.on('error', (queue, error) => {
    console.error(`Erreur player :`, error);
    queue.metadata.channel.send(`❌ Erreur : ${error.message}`);
});

player.events.on('playerError', (queue, error) => {
    console.error(`Erreur playerError :`, error);
    queue.metadata.channel.send(`❌ Erreur de lecture : ${error.message}`);
});