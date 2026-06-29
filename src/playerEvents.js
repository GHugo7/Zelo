const { getPlayer } = require('./player');
const buildMusicEmbed = require('./utils/musicEmbed');
const buildMusicButtons = require('./utils/musicButtons');

const player = getPlayer();

player.events.on('playerStart', async (queue, track) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const page = queue.metadata.currentPage || 0;
    const result = buildMusicEmbed(queue, page);
    if (!result) return;
    const { embed, totalPages } = result;
    const buttons = buildMusicButtons(page, totalPages, false, queue.repeatMode);

    if (queue.metadata.playerMessage) {
        // Message deja existant - edit
        await queue.metadata.playerMessage.edit({
            embeds: [embed],
            components: buttons,
        }).catch(() => {});
    } else {
        // Initialisation - creation du message
        const message = await queue.metadata.send({
            embeds: [embed],
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
        const { embed: updatedEmbed, totalPages: updatedPages } = result;
        const updatedButtons = buildMusicButtons(page, updatedPages, queue.node.isPaused(), queue.repeatMode);
        await queue.metadata.playerMessage.edit({
            embeds: [updatedEmbed],
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
    queue.metadata.send(`❌ Erreur : ${error.message}`);
});

player.events.on('playerError', (queue, error) => {
    console.error(`Erreur playerError :`, error);
    queue.metadata.send(`❌ Erreur de lecture : ${error.message}`);
});