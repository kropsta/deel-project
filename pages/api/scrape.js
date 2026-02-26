// pages/api/scrape.js
// SSE endpoint — streams scraper progress, then saves results to Neon Postgres

const { runScraper } = require('../../lib/scraper');
const { initDb, saveLeads, setLastRun } = require('../../lib/db');

export const config = {
    api: { bodyParser: false },
};

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const send = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        if (res.flush) res.flush();
    };

    send({ type: 'log', message: '🚀 Agency Scraper started...' });

    // Ensure DB tables exist
    try {
        await initDb();
        send({ type: 'log', message: '🗄️  Connected to Neon Postgres database' });
    } catch (dbErr) {
        send({ type: 'log', message: `⚠ DB init warning: ${dbErr.message}` });
    }

    try {
        for await (const event of runScraper()) {
            if (event.type === 'log') {
                send({ type: 'log', message: event.message });
            } else if (event.type === 'done') {
                const lastRun = new Date().toISOString();

                // Save to Neon Postgres
                try {
                    await saveLeads(event.leads);
                    await setLastRun(lastRun);
                    send({ type: 'log', message: `💾 Saved ${event.leads.length} leads to Neon Postgres` });
                } catch (saveErr) {
                    send({ type: 'log', message: `⚠ DB save error: ${saveErr.message}` });
                }

                send({ type: 'done', leads: event.leads, lastRun });
            }
        }
    } catch (err) {
        send({ type: 'log', message: `❌ Error: ${err.message}` });
        send({ type: 'error', message: err.message });
    }

    res.end();
}
