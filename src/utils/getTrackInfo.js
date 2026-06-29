const https = require('https');

module.exports = async function getTrackInfo(title, artist) {
    const query = encodeURIComponent(`artist:${artist} recording:${title}`);
    const url = `https://musicbrainz.org/ws/2/recording/?query=${query}&fmt=json&limit=1`;

    return new Promise((resolve) => {
        https.get(url, {
            headers: {
                'User-Agent': 'LuBot/1.0 (discord bot)',
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const recording = json?.recordings?.[0];
                    if (recording && recording.score >= 95) {
                        resolve({
                            title: recording.title,
                            artist: recording['artist-credit']?.[0]?.name || null,
                        });
                    } else {
                        resolve(null);
                    }
                } catch {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
};