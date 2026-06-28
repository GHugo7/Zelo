const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');

let player;

async function createPlayer(client) {
    player = new Player(client, {
        useLegacyFFmpeg: false,
    });
    await player.extractors.loadMulti(DefaultExtractors);

    return player;
};

function getPlayer() {
    return player;
};

module.exports = { createPlayer, getPlayer }