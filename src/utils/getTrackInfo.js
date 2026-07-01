const Groq = require('groq-sdk');

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
                    content: 'Tu es un expert en musique. Retourne UNIQUEMENT un JSON avec "artist" et "title". RÈGLES STRICTES : 1) Ne modifie JAMAIS le titre si tu n\'es pas sûr à 100%. 2) Si le titre contient déjà "Artiste - Titre", extrais-les directement sans modification. 3) Retourne null si tu doutes. Juste le JSON, pas d\'explication.'
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