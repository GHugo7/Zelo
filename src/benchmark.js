require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const testCases = [
    // Titres propres — résultat attendu évident
    { title: 'Papaoutai', author: 'Stromae', expected: { artist: 'Stromae', title: 'Papaoutai' } },
    { title: 'Pardonne-moi', author: 'Louane', expected: { artist: 'Louane', title: 'Pardonne-moi' } },
    { title: 'Djadja', author: 'Aya Nakamura', expected: { artist: 'Aya Nakamura', title: 'Djadja' } },

    // Titres YouTube "sales"
    { title: '95-128 STROMAE - PAPAOUTAI °11', author: 'MixTapes', expected: { artist: 'Stromae', title: 'Papaoutai' } },
    { title: 'GIMS - PARISIENNE (Ft. La Mano 1.9) [Official Video]', author: 'GIMS', expected: { artist: 'GIMS', title: 'Parisienne' } },
    { title: 'Jul - Love de toi (Clip Officiel) HD', author: 'Jul', expected: { artist: 'Jul', title: 'Love de toi' } },

    // Cas ambigus — versions différentes
    { title: 'Enemy', author: 'Tommee Profitt', expected: { artist: 'Tommee Profitt', title: 'Enemy' } },
    { title: 'Enemy', author: 'Imagine Dragons', expected: { artist: 'Imagine Dragons', title: 'Enemy' } },

    // Titres en langue étrangère
    { title: 'Ainsi Bas La Vida Funk', author: 'DR MØB, ZODIVK', expected: { artist: 'DR MØB, ZODIVK', title: 'Ainsi Bas La Vida Funk' } },
    { title: 'アイオライト', author: 'Inori Minase', expected: { artist: 'Inori Minase', title: 'アイオライト' } },

    // Cas où Groq devrait fallback (musique peu connue)
    { title: 'Je veux - Nilusi', author: 'Nilusi', expected: { artist: 'Nilusi', title: 'Je veux' } },
];

async function testRequest(title, author) {
    const start = Date.now();
    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                {
                    role: 'system',
                    content: 'Tu es un expert en musique. Retourne UNIQUEMENT un JSON avec "artist", "title" et "confidence" (0 à 1). RÈGLES STRICTES : 1) Ne modifie JAMAIS le titre si tu n\'es pas sûr à 100%. 2) Si le titre contient déjà "Artiste - Titre", extrais-les directement. 3) Si tu doutes, mets confidence < 0.8. Juste le JSON.'
                },
                {
                    role: 'user',
                    content: `Titre : "${title}"\nChaîne/Auteur : "${author}"\nRetourne le JSON.`
                }
            ],
            max_tokens: 100,
            temperature: 0.0,
        });

        const latency = Date.now() - start;
        const content = response.choices[0]?.message?.content?.trim();
        const json = JSON.parse(content);

        return { latency, result: json };
    } catch (e) {
        return { latency: Date.now() - start, error: e.message };
    }
}

function normalize(str) {
    return str?.toLowerCase().trim().replace(/[^a-z0-9àâäéèêëîïôùûüç]/gi, '');
}

function checkResult(result, expected) {
    const artistMatch = normalize(result.artist) === normalize(expected.artist);
    const titleMatch = normalize(result.title) === normalize(expected.title);
    return { artistMatch, titleMatch };
}

async function benchmark() {
    console.log('🔥 Benchmark Groq — Test métadonnées musicales\n');
    console.log('═'.repeat(70));

    const latencies = [];
    let passed = 0;
    let failed = 0;
    let hallucinations = 0;

    for (const test of testCases) {
        const { latency, result, error } = await testRequest(test.title, test.author);
        latencies.push(latency);

        if (error) {
            console.log(`❌ [${latency}ms] "${test.title}" → Erreur: ${error}`);
            failed++;
            continue;
        }

        if (result.confidence < 0.8) {
            console.log(`⚠️  [${latency}ms] "${test.title}" → Confidence faible (${result.confidence}) — fallback`);
            continue;
        }

        const { artistMatch, titleMatch } = checkResult(result, test.expected);
        const status = artistMatch && titleMatch ? '✅' : '❌';

        if (artistMatch && titleMatch) {
            passed++;
        } else {
            failed++;
            if (!artistMatch || !titleMatch) hallucinations++;
        }

        console.log(`${status} [${latency}ms] [conf: ${result.confidence}]`);
        console.log(`   Input    : "${test.title}" by "${test.author}"`);
        console.log(`   Expected : ${test.expected.artist} - ${test.expected.title}`);
        console.log(`   Got      : ${result.artist} - ${result.title}`);
        if (!artistMatch) console.log(`   ⚠️  Artiste incorrect`);
        if (!titleMatch) console.log(`   ⚠️  Titre incorrect`);
        console.log();

        await new Promise(r => setTimeout(r, 200));
    }

    console.log('═'.repeat(70));
    console.log(`\n📊 Résultats :`);
    console.log(`   ✅ Réussis     : ${passed}/${testCases.length}`);
    console.log(`   ❌ Échoués     : ${failed}`);
    console.log(`   🤔 Hallucinations : ${hallucinations}`);
    console.log(`\n⏱️  Performance :`);
    console.log(`   Moyenne : ${Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)}ms`);
    console.log(`   Min     : ${Math.min(...latencies)}ms`);
    console.log(`   Max     : ${Math.max(...latencies)}ms`);
}

benchmark();