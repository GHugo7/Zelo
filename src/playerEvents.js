const { getPlayer } = require('./player')

const player = getPlayer();

player.events.on('playerStart', (queue, track) => {
    queue.metadata.channel.send(`🎵 En train de jouer **${track.title}**`);
});

player.events.on('disconnect', (queue) => {
    queue.metadata.channel.send(`👋 Déconnecté du vocal`);
});

player.events.on('emptyChannel', (queue) => {
    queue.metadata.channel.send(`👋 Salon vide, déconnexion`);
});

player.events.on('emptyQueue', (queue) => {
    queue.metadata.channel.send(`✅ Queue terminée`);
});

player.events.on('error', (queue, error) => {
    console.error(`Erreur player :`, error);
    queue.metadata.channel.send(`❌ Erreur : ${error.message}`);
});

player.events.on('playerError', (queue, error) => {
    console.error(`Erreur playerError :`, error);
    queue.metadata.channel.send(`❌ Erreur de lecture : ${error.message}`);
});