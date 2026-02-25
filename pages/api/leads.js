// pages/api/leads.js
// GET — return all leads | DELETE — clear all leads

export default async function handler(req, res) {
    // Try Vercel KV first
    const useKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

    if (req.method === 'GET') {
        try {
            if (useKV) {
                const { kv } = await import('@vercel/kv');
                const leads = await kv.get('leads');
                const lastRun = await kv.get('lastRun');
                return res.json({ leads: leads ? JSON.parse(leads) : [], lastRun });
            }
        } catch (_) { }
        // Fallback to in-memory
        return res.json({
            leads: global._agencyLeads || [],
            lastRun: global._agencyLastRun || null,
        });
    }

    if (req.method === 'DELETE') {
        try {
            if (useKV) {
                const { kv } = await import('@vercel/kv');
                await kv.del('leads');
                await kv.del('lastRun');
            }
        } catch (_) { }
        global._agencyLeads = [];
        global._agencyLastRun = null;
        return res.json({ ok: true });
    }

    res.status(405).end();
}
