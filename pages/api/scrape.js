// pages/api/scrape.js
// SSE endpoint — streams scraper progress to the client

const { runScraper } = require('../../lib/scraper');

// In-memory store (works without Vercel KV)
let inMemoryLeads = [];

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

    try {
        for await (const event of runScraper()) {
            if (event.type === 'log') {
                send({ type: 'log', message: event.message });
            } else if (event.type === 'done') {
                // Persist leads
                inMemoryLeads = event.leads;

                // Try Vercel KV if configured
                try {
                    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
                        const { kv } = await import('@vercel/kv');
                        await kv.set('leads', JSON.stringify(event.leads));
                        await kv.set('lastRun', new Date().toISOString());
                        send({ type: 'log', message: '💾 Saved to Vercel KV' });
                    } else {
                        await saveLeadsMeta(event.leads);
                        send({ type: 'log', message: '💾 Saved to in-memory store' });
                    }
                } catch (kvErr) {
                    send({ type: 'log', message: `⚠ KV save skipped: ${kvErr.message}` });
                }

                send({ type: 'done', leads: event.leads, lastRun: new Date().toISOString() });
            }
        }
    } catch (err) {
        send({ type: 'log', message: `❌ Error: ${err.message}` });
        send({ type: 'error', message: err.message });
    }

    res.end();
}

// Global in-memory store helper (exported for leads.js to import)
global._agencyLeads = global._agencyLeads || [];
global._agencyLastRun = global._agencyLastRun || null;

async function saveLeadsMeta(leads) {
    global._agencyLeads = leads;
    global._agencyLastRun = new Date().toISOString();
}
