const fs = require('node:fs');
const path = require('node:path');
const SYSTEM_PROMPT = fs.readFileSync(path.join(__dirname, '../prompts/trackInfo.txt'), 'utf-8');
const DEBUG = require('./debug');

const Anthropic = require('@anthropic-ai/sdk')
const db = require('../database')
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

module.exports = async function getTrackInfo(title, author, url) {
    // Verification du cache BDD
    if (url) {
        const cached = db.prepare('SELECT artist, title FROM track_cache WHERE url = ?').get(url);
        DEBUG('[trackInfo] entrée :', { title, author, url });
        DEBUG('[trackInfo] cache :', cached);
        if (cached) return { artist: cached.artist, title: cached.title };
    }

    try {
        const cleanAuthor = (author ?? '').replace(/[\u115F\u1160\u17B4\u17B5\u180E\u200B-\u200F\u2060-\u206F\u3164\uFEFF\u1CBC]/g, '').trim();
        const response = await anthropic.messages.create({
            model: 'claude-haiku-5-5',
            max_tokens: 150,
            thinking: { type: 'disabled' },
            output_config: { effort: 'low' },
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: `Titre : "${title}"\nChaîne/Auteur : "${cleanAuthor}"` }],
        });

        DEBUG('[trackInfo] réponse brute :', response.content[0]?.text);

        const content = response.content[0]?.text?.trim();
        const json = JSON.parse(content);

        if (Number(json.confidence ?? 0) < 0.8) return null;

        if (json.artist && json.title) {
            if (url) {
                db.prepare('INSERT OR REPLACE INTO track_cache (url, artist, title) VALUES (?, ?, ?)').run(url, json.artist, json.title);
            }
            return { artist: json.artist, title: json.title };
        }
        return null;
    } catch (e) {
        console.error('[trackInfo] erreur :', e.status ?? '', e.message);
        return null;
    }
};