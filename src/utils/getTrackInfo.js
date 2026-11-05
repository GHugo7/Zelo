const fs = require('node:fs');
const path = require('node:path');
const SYSTEM_PROMPT = fs.readFileSync(path.join(__dirname, '../prompts/trackInfo.txt'), 'utf-8');

const Groq = require('groq-sdk');
const db = require('../database')
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = async function getTrackInfo(title, author, url) {
    // Verification du cache BDD
    if (url) {
        const cached = db.prepare('SELECT artist, title FROM track_cache WHERE url = ?').get(url);
        if (cached) return { artist: cached.artist, title: cached.title };
    }

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT
                },
                {
                    role: 'user',
                    content: `Titre : "${title}"\nChaîne/Auteur : "${author}"\nRetourne JSON avec "artist", "title" et "confidence" (0 à 1). Si confidence < 0.8, mets les valeurs originales.`
                }
            ],
            max_tokens: 100,
            temperature: 0.0,
        });

        const content = response.choices[0]?.message?.content?.trim();
        const json = JSON.parse(content);

        if (json.confidence && json.confidence < 0.8) return null;

        if (json.artist && json.title) {
            return { artist: json.artist, title: json.title };
        }
        return null;
    } catch {
        return null;
    }
};