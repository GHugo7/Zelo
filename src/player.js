const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');

let player;

async function createPlayer(client) {
    player = new Player(client);
    await player.extractors.loadMulti(DefaultExtractors);
    
    /*player.events.on('playerStart', (queue, track) => {
        queue.metadata.channel.send(`🎵 En train de jouer **${track.title}**`);
    });*/

    player.events.on('error', (queue, error) => {
        console.error(`Erreur player :`, error);
        queue.metadata.channel.send(`❌ Erreur : ${error.message}`);
    });

    player.events.on('playerError', (queue, error) => {
        console.error(`Erreur playerError :`, error);
        queue.metadata.channel.send(`❌ Erreur de lecture : ${error.message}`);
    });

    return player;
};

function getPlayer() {
    return player;
};

module.exports = { createPlayer, getPlayer }